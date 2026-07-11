"use server";

import { signOut } from "@/auth";
import { requireOwnerBusinessForCatalog } from "@/lib/catalog/require-owner-business";
import { getCurrentBusinessMemberContext } from "@/lib/authorization/context";
import { canAccessBranch } from "@/lib/authorization/access";
import { clearPlatformStepUpCookie } from "@/lib/platform/platform-step-up-cookie";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import { consumeProductFromRecipeInTransaction } from "@/lib/inventory/consume-product-from-recipe";
import {
  revalidateAfterStockImpact,
  revalidateOrderDetail,
  revalidateOrdersIndex,
} from "@/lib/cache/revalidate-tenant-ui";
import { prisma } from "@/lib/prisma";
import { allocateDocumentSequence, formatFinancialDocumentNumber } from "@/lib/finance/document-sequence";
import { calculateLineAmounts, calculateOrderAmounts } from "@/lib/finance/money";
import { FINANCIAL_AUDIT_ACTIONS } from "@/lib/finance/audit-actions";
import { isOfficialPosPaymentMethod } from "@/lib/finance/payment-method";
import { validateNativePaymentInvariants } from "@/lib/finance/payment-invariants";
import { FinancialDataOrigin, FinancialDocumentType, OrderStatus, PosPaymentMethod, PosPaymentStatus, Prisma } from "@prisma/client";

type ValidatedPosCartLine = {
  productId: string;
  quantity: number;
};

export type PosSubmitState = {
  error: string | null;
  success: string | null;
};

const initialState: PosSubmitState = { error: null, success: null };
const MAX_POS_CART_LINES = 100;
const MAX_POS_LINE_QUANTITY = 999;
const POS_ID_PATTERN = /^c[a-z0-9]{8,}$/i;
const POS_IDEMPOTENCY_KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidPosId(value: unknown): value is string {
  return typeof value === "string" && POS_ID_PATTERN.test(value.trim());
}

function parsePosIdempotencyKey(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const key = value.trim();
  if (key.length !== 36 || !POS_IDEMPOTENCY_KEY_PATTERN.test(key)) {
    return null;
  }
  return key.toLowerCase();
}

function parsePosCartPayload(payloadRaw: string): { ok: true; lines: ValidatedPosCartLine[] } | { ok: false; reason: "empty" | "invalid" } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payloadRaw);
  } catch {
    return { ok: false, reason: "invalid" };
  }

  if (!Array.isArray(parsed)) {
    return { ok: false, reason: "invalid" };
  }
  if (parsed.length === 0) {
    return { ok: false, reason: "empty" };
  }
  if (parsed.length > MAX_POS_CART_LINES) {
    return { ok: false, reason: "invalid" };
  }

  const quantityByProductId = new Map<string, number>();
  for (const line of parsed) {
    if (!isPlainRecord(line)) {
      return { ok: false, reason: "invalid" };
    }

    const keys = Object.keys(line);
    if (keys.some((key) => key !== "productId" && key !== "quantity")) {
      return { ok: false, reason: "invalid" };
    }

    if (!isValidPosId(line.productId)) {
      return { ok: false, reason: "invalid" };
    }
    if (
      typeof line.quantity !== "number" ||
      !Number.isSafeInteger(line.quantity) ||
      line.quantity <= 0 ||
      line.quantity > MAX_POS_LINE_QUANTITY
    ) {
      return { ok: false, reason: "invalid" };
    }

    const productId = line.productId.trim();
    const nextQuantity = (quantityByProductId.get(productId) ?? 0) + line.quantity;
    if (nextQuantity > MAX_POS_LINE_QUANTITY) {
      return { ok: false, reason: "invalid" };
    }
    quantityByProductId.set(productId, nextQuantity);
  }

  const lines = Array.from(quantityByProductId, ([productId, quantity]) => ({ productId, quantity }));
  if (lines.length === 0) {
    return { ok: false, reason: "empty" };
  }
  return { ok: true, lines };
}

function cartSignature(lines: ValidatedPosCartLine[]): string {
  return [...lines]
    .sort((a, b) => a.productId.localeCompare(b.productId))
    .map((line) => `${line.productId}:${line.quantity}`)
    .join("|");
}

function decimalToSafeInteger(value: Prisma.Decimal): number | null {
  if (!value.isInteger()) {
    return null;
  }
  const n = value.toNumber();
  return Number.isSafeInteger(n) ? n : null;
}

type ExistingPosOrder = {
  id: string;
  status: OrderStatus;
  branchId: string | null;
  financialDataOrigin: FinancialDataOrigin | null;
  orderNumber: string | null;
  items: Array<{ productId: string; quantity: Prisma.Decimal }>;
  payments: Array<{ id: string; receiptNumber: string | null; method: PosPaymentMethod | null; amount: Prisma.Decimal; status: PosPaymentStatus; reference: string | null }>;
};

function existingOrderMatchesRequest(order: ExistingPosOrder, lines: ValidatedPosCartLine[], branchId: string, method: PosPaymentMethod, reference: string | null): boolean {
  if (order.status !== OrderStatus.COMPLETED || order.branchId !== branchId || order.items.length !== lines.length) {
    return false;
  }
  const persistedLines: ValidatedPosCartLine[] = [];
  for (const item of order.items) {
    const quantity = decimalToSafeInteger(item.quantity);
    if (quantity === null) {
      return false;
    }
    persistedLines.push({ productId: item.productId, quantity });
  }
  const payment = order.payments.find((candidate) => candidate.status === PosPaymentStatus.CAPTURED);
  return cartSignature(persistedLines) === cartSignature(lines) && payment?.method === method && (payment.reference ?? null) === reference;
}

async function findExistingPosOrder(businessId: string, idempotencyKey: string): Promise<ExistingPosOrder | null> {
  return prisma.order.findFirst({
    where: { businessId, idempotencyKey },
    select: {
      id: true,
      status: true,
      branchId: true,
      financialDataOrigin: true,
      orderNumber: true,
      items: {
        select: { productId: true, quantity: true },
        orderBy: { productId: "asc" },
      },
      payments: { select: { id: true, receiptNumber: true, method: true, amount: true, status: true, reference: true } },
    },
  });
}

function parseReference(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return null;
  if (normalized.length > 120 || /[\u0000-\u001f]/.test(normalized)) return null;
  return normalized;
}

function successMessage(t: Awaited<ReturnType<typeof getServerActionTranslator>>, order: ExistingPosOrder) {
  const payment = order.payments.find((candidate) => candidate.status === PosPaymentStatus.CAPTURED);
  if (!payment || order.financialDataOrigin !== FinancialDataOrigin.NATIVE || !order.orderNumber || !payment.receiptNumber) return null;
  return t("pos.paymentSuccess", { orderNumber: order.orderNumber, receiptNumber: payment.receiptNumber });
}

function isExpectedPosIdempotencyConflict(error: unknown): boolean {
  if (error === null || typeof error !== "object" || !("code" in error)) {
    return false;
  }
  const candidate = error as { code?: unknown; meta?: { target?: unknown } };
  if (candidate.code !== "P2002") {
    return false;
  }
  const target = candidate.meta?.target;
  if (Array.isArray(target)) {
    return target.includes("idempotencyKey");
  }
  return typeof target === "string" && target.includes("idempotencyKey");
}

/**
 * POS rail:         (Auth.js signOut)          .
 *                          .
 */
export async function signOutFromPos(formData: FormData) {
  const raw = String(formData.get("locale") ?? "ar").trim();
  const locale = raw.replace(/[^\w-]/g, "") || "ar";
  await clearPlatformStepUpCookie();
  await signOut({ redirectTo: `/${locale}/sign-in` });
}

/**
 * POS completion flow:
 * - creates one order,
 * - writes all order items,
 * - deducts stock only for items that have valid recipes,
 * - completes order in the same transaction.
 *
 * This does NOT modify existing orders actions. It is a dedicated POS flow.
 */
export async function submitPosOrder(
  _prev: PosSubmitState,
  formData: FormData,
): Promise<PosSubmitState> {
  /**
   * POS is an operational write path; page-level guards are not enough.
   * We enforce tenant context + POS permission on the server action to block forged requests.
   */
  const ctx = await requireOwnerBusinessForCatalog(formData, ["pos.access", "pos.payment.capture"]);
  if (!ctx.ok) {
    return { ...initialState, error: ctx.error };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));
  const businessContext = await getCurrentBusinessMemberContext(ctx.userId);
  const branchId = String(formData.get("branchId") ?? "").trim();
  if (!branchId) return { ...initialState, error: t("pos.branchRequired") };
  if (businessContext.member.branchId && businessContext.member.branchId !== branchId) {
    return { ...initialState, error: t("pos.branchInvalid") };
  }
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, businessId: ctx.businessId, isActive: true, archivedAt: null },
    select: { id: true, code: true },
  });
  if (!branch || !canAccessBranch(businessContext.member, branch.id)) {
    return { ...initialState, error: t("pos.branchInvalid") };
  }
  const rawMethod = String(formData.get("paymentMethod") ?? "").trim();
  if (!isOfficialPosPaymentMethod(rawMethod)) return { ...initialState, error: t("pos.paymentMethodInvalid") };
  const paymentMethod = rawMethod;
  const bankingConfirmed = String(formData.get("bankingConfirmed") ?? "") === "true";
  if (paymentMethod !== PosPaymentMethod.CASH && !bankingConfirmed) {
    return { ...initialState, error: t("pos.bankingConfirmationRequired") };
  }
  const rawReference = String(formData.get("paymentReference") ?? "").trim();
  const reference = paymentMethod === PosPaymentMethod.CASH ? null : parseReference(formData.get("paymentReference"));
  if (paymentMethod !== PosPaymentMethod.CASH && rawReference && !reference) {
    return { ...initialState, error: t("pos.paymentReferenceInvalid") };
  }
  const idempotencyKey = parsePosIdempotencyKey(formData.get("idempotencyKey"));
  if (!idempotencyKey) {
    return { ...initialState, error: t("pos.idempotencyKeyInvalid") };
  }

  const payloadRaw = String(formData.get("cart") ?? "").trim();
  if (!payloadRaw) {
    return { ...initialState, error: t("pos.cartMissing") };
  }

  const parsedCart = parsePosCartPayload(payloadRaw);
  if (!parsedCart.ok && parsedCart.reason === "invalid") {
    return { ...initialState, error: t("pos.cartInvalid") };
  }
  if (!parsedCart.ok) {
    return { ...initialState, error: t("pos.cartEmpty") };
  }
  const cleanCart = parsedCart.lines;
  const existingOrder = await findExistingPosOrder(ctx.businessId, idempotencyKey);
  if (existingOrder) {
    const success = successMessage(t, existingOrder);
    if (!success) return { ...initialState, error: t("pos.legacyReplay") };
    if (!existingOrderMatchesRequest(existingOrder, cleanCart, branch.id, paymentMethod, reference)) {
      return { ...initialState, error: t("pos.idempotencyConflict") };
    }
    return { error: null, success };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const productIds = cleanCart.map((line) => line.productId);
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          businessId: ctx.businessId,
          archivedAt: null,
          isActive: true,
        },
        select: { id: true, code: true, nameAr: true, basePrice: true },
      });
      const productMap = new Map(products.map((product) => [product.id, product]));
      const actor = await tx.user.findUnique({
        where: { id: ctx.userId },
        select: { fullName: true },
      });

      if (productMap.size !== productIds.length) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const verifiedLines = cleanCart.map((line) => {
        const product = productMap.get(line.productId);
        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }
        return {
          product,
          quantity: new Prisma.Decimal(line.quantity.toString()),
          amounts: calculateLineAmounts({ quantity: line.quantity, unitPrice: product.basePrice.toString() }),
        };
      });
      const orderAmounts = calculateOrderAmounts({ lineSubtotals: verifiedLines.map((line) => line.amounts.lineSubtotal) });
      const orderSequence = await allocateDocumentSequence(tx, ctx.businessId, FinancialDocumentType.ORDER);
      const orderNumber = formatFinancialDocumentNumber(FinancialDocumentType.ORDER, branch.code, orderSequence);
      const currency = businessContext.business.defaultCurrency;

      const order = await tx.order.create({
        data: {
          businessId: ctx.businessId,
          idempotencyKey,
          status: OrderStatus.DRAFT,
          notes: t("pos.orderNotes"),
          branchId: branch.id,
          orderNumber,
          subtotalAmount: orderAmounts.subtotalAmount,
          discountTotal: orderAmounts.discountTotal,
          taxTotal: orderAmounts.taxTotal,
          totalAmount: orderAmounts.totalAmount,
          currency,
          financialSnapshotVersion: 1,
          financialDataOrigin: FinancialDataOrigin.NATIVE,
          branchDataOrigin: FinancialDataOrigin.NATIVE,
        },
      });

      for (const line of verifiedLines) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: line.product.id,
            quantity: line.quantity,
            productNameSnapshot: line.product.nameAr,
            productCodeSnapshot: line.product.code,
            unitPrice: line.amounts.unitPrice,
            lineSubtotal: line.amounts.lineSubtotal,
            lineDiscountTotal: line.amounts.discountTotal,
            lineTaxTotal: line.amounts.taxTotal,
            lineTotal: line.amounts.lineTotal,
          },
        });
      }

      // POS rule in this phase:
      // if product has recipe items => deduct stock.
      // if product has no recipe => keep order completion without deduction.
      for (const line of verifiedLines) {
        const recipe = await tx.recipe.findFirst({
          where: { businessId: ctx.businessId, productId: line.product.id },
          include: { items: { select: { id: true } } },
        });
        if (!recipe || recipe.items.length === 0) {
          continue;
        }

        await consumeProductFromRecipeInTransaction(tx, {
          businessId: ctx.businessId,
          productId: line.product.id,
          quantity: line.quantity,
          orderId: order.id,
          executorLabel: actor?.fullName ?? t("pos.executorUnknown"),
          executorRole: t("pos.executorRole"),
          sourceLabel: t("pos.sourceLabel"),
        });
      }

      const receiptSequence = await allocateDocumentSequence(tx, ctx.businessId, FinancialDocumentType.RECEIPT);
      const receiptNumber = formatFinancialDocumentNumber(FinancialDocumentType.RECEIPT, branch.code, receiptSequence);
      validateNativePaymentInvariants({
        businessId: ctx.businessId, branchId: branch.id, orderBusinessId: ctx.businessId, orderBranchId: order.branchId,
        amount: orderAmounts.totalAmount, orderTotalAmount: orderAmounts.totalAmount, currency, orderCurrency: currency,
        method: paymentMethod, status: PosPaymentStatus.CAPTURED, paidAt: new Date(), receivedByUserId: ctx.userId,
        receivedByDisplayNameSnapshot: actor?.fullName ?? null, receiptNumber, financialDataOrigin: FinancialDataOrigin.NATIVE,
      });
      const paidAt = new Date();
      const payment = await tx.payment.create({ data: {
        businessId: ctx.businessId, branchId: branch.id, orderId: order.id, receiptNumber, amount: orderAmounts.totalAmount,
        currency, method: paymentMethod, status: PosPaymentStatus.CAPTURED, paidAt, receivedByUserId: ctx.userId,
        receivedByDisplayNameSnapshot: actor?.fullName ?? null, reference, financialDataOrigin: FinancialDataOrigin.NATIVE,
      } });

      await tx.auditLog.createMany({ data: [
        { actorUserId: ctx.userId, businessId: ctx.businessId, branchId: branch.id, action: FINANCIAL_AUDIT_ACTIONS.SNAPSHOT_CREATED, entityType: "Order", entityId: order.id, afterSnapshot: JSON.stringify({ orderNumber, totalAmount: orderAmounts.totalAmount.toString(), currency }) },
        { actorUserId: ctx.userId, businessId: ctx.businessId, branchId: branch.id, action: FINANCIAL_AUDIT_ACTIONS.ORDER_NUMBER_ISSUED, entityType: "Order", entityId: order.id, afterSnapshot: JSON.stringify({ orderNumber }) },
        { actorUserId: ctx.userId, businessId: ctx.businessId, branchId: branch.id, action: FINANCIAL_AUDIT_ACTIONS.PAYMENT_ATTEMPT_CREATED, entityType: "Payment", entityId: payment.id, afterSnapshot: JSON.stringify({ method: paymentMethod, amount: orderAmounts.totalAmount.toString() }) },
        { actorUserId: ctx.userId, businessId: ctx.businessId, branchId: branch.id, action: FINANCIAL_AUDIT_ACTIONS.PAYMENT_CAPTURED, entityType: "Payment", entityId: payment.id, afterSnapshot: JSON.stringify({ receiptNumber }) },
        { actorUserId: ctx.userId, businessId: ctx.businessId, branchId: branch.id, action: FINANCIAL_AUDIT_ACTIONS.RECEIPT_NUMBER_ISSUED, entityType: "Payment", entityId: payment.id, afterSnapshot: JSON.stringify({ receiptNumber }) },
      ] });

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.COMPLETED, completedAt: new Date() },
      });

      return { orderId: order.id, orderNumber, receiptNumber };
    });

    /**
     * POS completion touches orders, stock, and dashboard KPIs in one shot.
     * We reuse the shared stock invalidation helper so POS availability stays aligned with inventory.
     */
    revalidateAfterStockImpact(ctx.locale);
    revalidateOrdersIndex(ctx.locale);
    revalidateOrderDetail(ctx.locale, result.orderId);

    return { error: null, success: t("pos.paymentSuccess", { orderNumber: result.orderNumber, receiptNumber: result.receiptNumber }) };
  } catch (error) {
    if (isExpectedPosIdempotencyConflict(error)) {
      const replayedOrder = await findExistingPosOrder(ctx.businessId, idempotencyKey);
      if (!replayedOrder) {
        return { ...initialState, error: t("pos.idempotencyDuplicateFailed") };
      }
      const success = successMessage(t, replayedOrder);
      if (!success) return { ...initialState, error: t("pos.legacyReplay") };
      if (!existingOrderMatchesRequest(replayedOrder, cleanCart, branch.id, paymentMethod, reference)) {
        return { ...initialState, error: t("pos.idempotencyConflict") };
      }
      return { error: null, success };
    }
    const message = error instanceof Error ? error.message : "";
    if (message === "PRODUCT_NOT_FOUND") {
      return { ...initialState, error: t("pos.productNotFound") };
    }
    if (message === "INSUFFICIENT_STOCK") {
      return { ...initialState, error: t("pos.insufficientStock") };
    }
    return { ...initialState, error: t("pos.genericError") };
  }
}
