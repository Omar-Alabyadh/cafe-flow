import { FinancialDataOrigin, FinancialDocumentType, OrderStatus, PosPaymentMethod, PosPaymentStatus, Prisma } from "@prisma/client";
import { FINANCIAL_AUDIT_ACTIONS } from "@/lib/finance/audit-actions";
import { allocateDocumentSequence, formatFinancialDocumentNumber } from "@/lib/finance/document-sequence";
import { calculateLineAmounts, calculateOrderAmounts, ZERO_MONEY } from "@/lib/finance/money";
import { isOfficialPosPaymentMethod } from "@/lib/finance/payment-method";
import { validateNativePaymentInvariants } from "@/lib/finance/payment-invariants";
import { prisma } from "@/lib/prisma";

export type LegacyReconciliationInput = { orderId: string; branchId: string; receiverUserId: string; method: PosPaymentMethod; paidAt: Date; evidenceDescription: string; reason: string; reference?: string | null; linePrices: Array<{ orderItemId: string; unitPrice: string }> };
export type LegacyReconciliationResult = { orderId: string; orderNumber: string; receiptNumber: string; replayed: boolean };

function text(value: string, code: string) { const clean = value.trim().replace(/\s+/g, " "); if (!clean || clean.length > 2000 || /[\u0000-\u001f]/.test(clean)) throw new Error(code); return clean; }
function price(value: string) { if (!/^\d+(?:\.\d{1,3})?$/.test(value.trim())) throw new Error("RECONCILIATION_PRICE_INVALID"); const result = new Prisma.Decimal(value); if (result.lte(0)) throw new Error("RECONCILIATION_PRICE_INVALID"); return result; }

export async function reconcileLegacyOrder(input: LegacyReconciliationInput, actor: { businessId: string; userId: string }): Promise<LegacyReconciliationResult> {
  const evidenceDescription = text(input.evidenceDescription, "RECONCILIATION_EVIDENCE_REQUIRED");
  const reason = text(input.reason, "RECONCILIATION_REASON_REQUIRED");
  if (!isOfficialPosPaymentMethod(input.method) || Number.isNaN(input.paidAt.getTime())) throw new Error("RECONCILIATION_PAYMENT_INVALID");
  const prices = new Map(input.linePrices.map((line) => [line.orderItemId, price(line.unitPrice)]));
  if (prices.size !== input.linePrices.length) throw new Error("RECONCILIATION_LINES_INVALID");
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw(Prisma.sql`SELECT "id" FROM "Order" WHERE "id" = ${input.orderId} FOR UPDATE`);
    const order = await tx.order.findFirst({ where: { id: input.orderId, businessId: actor.businessId }, include: { items: true, payments: true } });
    if (!order) throw new Error("RECONCILIATION_ORDER_NOT_FOUND");
    if (order.financialDataOrigin === FinancialDataOrigin.MANUALLY_RECONCILED) {
      const payment = order.payments.find((candidate) => candidate.status === PosPaymentStatus.CAPTURED);
      if (!order.orderNumber || !payment?.receiptNumber) throw new Error("RECONCILIATION_CONFLICT");
      return { orderId: order.id, orderNumber: order.orderNumber, receiptNumber: payment.receiptNumber, replayed: true };
    }
    if (order.financialDataOrigin !== FinancialDataOrigin.LEGACY_UNKNOWN || order.status !== OrderStatus.COMPLETED || order.items.length === 0 || order.payments.some((p) => p.status === PosPaymentStatus.CAPTURED)) throw new Error("RECONCILIATION_CONFLICT");
    if (prices.size !== order.items.length || order.items.some((item) => !prices.has(item.id))) throw new Error("RECONCILIATION_LINES_INVALID");
    const [branch, receiver] = await Promise.all([
      tx.branch.findFirst({ where: { id: input.branchId, businessId: actor.businessId }, select: { id: true, code: true } }),
      tx.membership.findFirst({ where: { userId: input.receiverUserId, businessId: actor.businessId, archivedAt: null }, select: { user: { select: { fullName: true } } } }),
    ]);
    if (!branch) throw new Error("RECONCILIATION_BRANCH_INVALID"); if (!receiver) throw new Error("RECONCILIATION_RECEIVER_INVALID");
    const lines = order.items.map((item) => ({ item, amounts: calculateLineAmounts({ quantity: item.quantity, unitPrice: prices.get(item.id)! }) }));
    const totals = calculateOrderAmounts({ lineSubtotals: lines.map((line) => line.amounts.lineSubtotal), discountTotal: ZERO_MONEY, taxTotal: ZERO_MONEY });
    const orderNumber = formatFinancialDocumentNumber(FinancialDocumentType.ORDER, branch.code, await allocateDocumentSequence(tx, actor.businessId, FinancialDocumentType.ORDER));
    const receiptNumber = formatFinancialDocumentNumber(FinancialDocumentType.RECEIPT, branch.code, await allocateDocumentSequence(tx, actor.businessId, FinancialDocumentType.RECEIPT));
    for (const line of lines) await tx.orderItem.update({ where: { id: line.item.id }, data: { unitPrice: line.amounts.unitPrice, lineSubtotal: line.amounts.lineSubtotal, lineDiscountTotal: ZERO_MONEY, lineTaxTotal: ZERO_MONEY, lineTotal: line.amounts.lineTotal } });
    const updated = await tx.order.update({ where: { id: order.id }, data: { branchId: branch.id, orderNumber, subtotalAmount: totals.subtotalAmount, discountTotal: ZERO_MONEY, taxTotal: ZERO_MONEY, totalAmount: totals.totalAmount, currency: "LYD", financialSnapshotVersion: 1, financialDataOrigin: FinancialDataOrigin.MANUALLY_RECONCILED, branchDataOrigin: FinancialDataOrigin.MANUALLY_RECONCILED, reconciliationEvidenceDescription: evidenceDescription, reconciliationReason: reason, reconciledAt: new Date(), reconciledByUserId: actor.userId } });
    validateNativePaymentInvariants({ businessId: actor.businessId, branchId: branch.id, orderBusinessId: updated.businessId, orderBranchId: updated.branchId, amount: totals.totalAmount, orderTotalAmount: updated.totalAmount!, currency: "LYD", orderCurrency: updated.currency!, method: input.method, status: PosPaymentStatus.CAPTURED, paidAt: input.paidAt, receivedByUserId: input.receiverUserId, receivedByDisplayNameSnapshot: receiver.user.fullName, receiptNumber, financialDataOrigin: FinancialDataOrigin.MANUALLY_RECONCILED });
    const payment = await tx.payment.create({ data: { businessId: actor.businessId, branchId: branch.id, orderId: order.id, receiptNumber, amount: totals.totalAmount, currency: "LYD", method: input.method, status: PosPaymentStatus.CAPTURED, paidAt: input.paidAt, receivedByUserId: input.receiverUserId, receivedByDisplayNameSnapshot: receiver.user.fullName, reference: input.reference?.trim() || null, financialDataOrigin: FinancialDataOrigin.MANUALLY_RECONCILED } });
    await tx.auditLog.create({ data: { actorUserId: actor.userId, businessId: actor.businessId, branchId: branch.id, action: FINANCIAL_AUDIT_ACTIONS.LEGACY_RECONCILIATION_APPLIED, entityType: "Order", entityId: order.id, afterSnapshot: JSON.stringify({ orderNumber, receiptNumber, totalAmount: totals.totalAmount.toString(), currency: "LYD", paymentId: payment.id }) } });
    return { orderId: order.id, orderNumber, receiptNumber, replayed: false };
  });
}
