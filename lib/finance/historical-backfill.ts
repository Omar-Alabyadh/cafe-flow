import { FinancialBackfillBatchStatus, FinancialDataOrigin, PosPaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { FINANCIAL_AUDIT_ACTIONS } from "@/lib/finance/audit-actions";
import { ZERO_MONEY } from "@/lib/finance/money";

export const HISTORICAL_BACKFILL_VERSION = "f3-lyd-zero-adjustments-v1";
export type BackfillPreview = { totalOrders: number; nativeOrders: number; candidates: number; currencyEligible: number; zeroDiscountEligible: number; zeroTaxEligible: number; missingReliableTotals: number; missingBranch: number; missingPaymentMethod: number; missingPaidAt: number; missingReceiver: number; noPayment: number; deterministic: number; partial: number; manualReconciliation: number; legacyUnknown: number; orderUpdates: number; itemUpdates: number };

function native(order: { financialDataOrigin: FinancialDataOrigin | null; payments: { status: string }[] }) {
  return order.financialDataOrigin === FinancialDataOrigin.NATIVE && order.payments.some((payment) => payment.status === PosPaymentStatus.CAPTURED);
}

function summarize(orders: Array<{ financialDataOrigin: FinancialDataOrigin | null; currency: string | null; discountTotal: Prisma.Decimal | null; taxTotal: Prisma.Decimal | null; subtotalAmount: Prisma.Decimal | null; totalAmount: Prisma.Decimal | null; branchId: string | null; branchDataOrigin: FinancialDataOrigin | null; items: Array<{ lineDiscountTotal: Prisma.Decimal | null; lineTaxTotal: Prisma.Decimal | null }>; payments: Array<{ status: string; method: unknown; paidAt: Date | null; receivedByUserId: string | null }> }>): BackfillPreview {
  const result: BackfillPreview = { totalOrders: orders.length, nativeOrders: 0, candidates: 0, currencyEligible: 0, zeroDiscountEligible: 0, zeroTaxEligible: 0, missingReliableTotals: 0, missingBranch: 0, missingPaymentMethod: 0, missingPaidAt: 0, missingReceiver: 0, noPayment: 0, deterministic: 0, partial: 0, manualReconciliation: 0, legacyUnknown: 0, orderUpdates: 0, itemUpdates: 0 };

  for (const order of orders) {
    if (native(order)) {
      result.nativeOrders++;
      continue;
    }

    result.candidates++;
    const payment = order.payments.find((candidate) => candidate.status === PosPaymentStatus.CAPTURED);
    const critical = !order.totalAmount || !order.subtotalAmount || !order.branchId || !payment?.method || !payment.paidAt || !payment.receivedByUserId;
    const needsOrderUpdate = !order.currency || order.discountTotal === null || order.taxTotal === null || order.financialDataOrigin === null || (!order.branchId && order.branchDataOrigin === null);

    if (!order.currency) result.currencyEligible++;
    if (order.discountTotal === null) result.zeroDiscountEligible++;
    if (order.taxTotal === null) result.zeroTaxEligible++;
    if (!order.totalAmount || !order.subtotalAmount) result.missingReliableTotals++;
    if (!order.branchId) result.missingBranch++;
    if (!payment?.method) result.missingPaymentMethod++;
    if (!payment?.paidAt) result.missingPaidAt++;
    if (!payment?.receivedByUserId) result.missingReceiver++;
    if (!order.payments.length) result.noPayment++;
    result.itemUpdates += order.items.filter((item) => item.lineDiscountTotal === null || item.lineTaxTotal === null).length;
    if (needsOrderUpdate) result.orderUpdates++;
    if (critical) result.legacyUnknown++;
    else result.deterministic++;
  }

  return result;
}

function eligibleOrderWhere(businessId: string): Prisma.OrderWhereInput {
  // This is exactly the inverse of native().  The explicit null branch avoids SQL
  // three-valued logic accidentally excluding a legacy order that has a payment.
  return {
    businessId,
    OR: [
      { financialDataOrigin: null },
      { financialDataOrigin: { not: FinancialDataOrigin.NATIVE } },
      { payments: { none: { status: PosPaymentStatus.CAPTURED } } },
    ],
  };
}

export async function previewHistoricalBackfill(businessId: string) {
  const orders = await prisma.order.findMany({ where: { businessId }, include: { items: true, payments: true } });
  return summarize(orders);
}

export async function applyHistoricalBackfill(input: { businessId: string; actorUserId?: string; backfillVersion: string; idempotencyKey: string; confirmationToken: string }) {
  if (input.confirmationToken !== "APPLY_FINANCIAL_BACKFILL") throw new Error("BACKFILL_CONFIRMATION_REQUIRED");

  // The Prisma defaults are intentional: after reducing up to 158 sequential writes
  // to seven conditional UPDATE statements, a longer interactive transaction is not justified.
  return prisma.$transaction(async (tx) => {
    const batchWhere = { businessId_backfillVersion_idempotencyKey: { businessId: input.businessId, backfillVersion: input.backfillVersion, idempotencyKey: input.idempotencyKey } };
    const existing = await tx.financialBackfillBatch.findUnique({ where: batchWhere });
    if (existing?.status === FinancialBackfillBatchStatus.COMPLETED) return { batch: existing, replayed: true };

    const orders = await tx.order.findMany({ where: { businessId: input.businessId }, include: { items: true, payments: true } });
    const preview = summarize(orders);
    const batch = existing ?? await tx.financialBackfillBatch.create({
      data: {
        businessId: input.businessId,
        actorUserId: input.actorUserId,
        backfillVersion: input.backfillVersion,
        idempotencyKey: input.idempotencyKey,
        status: FinancialBackfillBatchStatus.RUNNING,
        previewSummary: JSON.stringify(preview),
        startedAt: new Date(),
      },
    });

    const orderWhere = eligibleOrderWhere(input.businessId);
    await tx.order.updateMany({ where: { ...orderWhere, currency: null }, data: { currency: "LYD" } });
    await tx.order.updateMany({ where: { ...orderWhere, discountTotal: null }, data: { discountTotal: ZERO_MONEY } });
    await tx.order.updateMany({ where: { ...orderWhere, taxTotal: null }, data: { taxTotal: ZERO_MONEY } });
    await tx.order.updateMany({ where: { ...orderWhere, financialDataOrigin: null }, data: { financialDataOrigin: FinancialDataOrigin.LEGACY_UNKNOWN } });
    await tx.order.updateMany({ where: { ...orderWhere, branchId: null, branchDataOrigin: null }, data: { branchDataOrigin: FinancialDataOrigin.LEGACY_UNKNOWN } });

    const itemWhere: Prisma.OrderItemWhereInput = { order: orderWhere };
    await tx.orderItem.updateMany({ where: { ...itemWhere, lineDiscountTotal: null }, data: { lineDiscountTotal: ZERO_MONEY } });
    await tx.orderItem.updateMany({ where: { ...itemWhere, lineTaxTotal: null }, data: { lineTaxTotal: ZERO_MONEY } });

    const completed = await tx.financialBackfillBatch.update({
      where: { id: batch.id },
      data: { status: FinancialBackfillBatchStatus.COMPLETED, appliedSummary: JSON.stringify(preview), completedAt: new Date() },
    });
    await tx.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        businessId: input.businessId,
        action: FINANCIAL_AUDIT_ACTIONS.BACKFILL_APPLIED,
        entityType: "FinancialBackfillBatch",
        entityId: batch.id,
        afterSnapshot: JSON.stringify({ backfillVersion: input.backfillVersion, candidates: preview.candidates }),
      },
    });

    return { batch: completed, replayed: false };
  });
}
