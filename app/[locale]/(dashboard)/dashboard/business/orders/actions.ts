"use server";

import { getCurrentUserId } from "@/lib/auth/session";
import { canFinalizeOrderWithStockDeduction } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { requireOwnerBusinessForCatalog } from "@/lib/catalog/require-owner-business";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import { prisma } from "@/lib/prisma";
import {
  type CompleteOrderErrorCode,
  completeOrderForBusiness,
  demoteToDraftIfNoItems,
  isOrderEditable,
  promoteDraftToInProgressIfNeeded,
} from "@/lib/orders/order.service";
import {
  revalidateAfterStockImpact,
  revalidateOrderDetail,
  revalidateOrdersIndex,
  revalidateTenantAggregateSurfaces,
} from "@/lib/cache/revalidate-tenant-ui";
import { parsePositiveOrderQuantity } from "@/lib/orders/order-item.service";

export type OrderActionState = {
  error: string | null;
  success: string | null;
  /** Present only from `addOrderItem` on success: lets the client remount the form without a reset effect. */
  formResetKey?: number;
};

/**
 * Order line edits affect list/detail UIs and also aggregate metrics (today counts, recent orders).
 * They do not move stock until completion — so we do not invalidate POS availability here.
 */
function revalidateOrderPaths(locale: string, orderId: string) {
  revalidateOrdersIndex(locale);
  revalidateOrderDetail(locale, orderId);
  revalidateTenantAggregateSurfaces(locale);
}

const COMPLETE_ORDER_ERROR_KEYS = {
  ORDER_NOT_FOUND: "orders.complete.errors.ORDER_NOT_FOUND",
  ORDER_NOT_OPEN: "orders.complete.errors.ORDER_NOT_OPEN",
  ORDER_EMPTY: "orders.complete.errors.ORDER_EMPTY",
  PRODUCT_NOT_FOUND: "orders.complete.errors.PRODUCT_NOT_FOUND",
  RECIPE_REQUIRED: "orders.complete.errors.RECIPE_REQUIRED",
  RECIPE_EMPTY: "orders.complete.errors.RECIPE_EMPTY",
  INSUFFICIENT_STOCK: "orders.complete.errors.INSUFFICIENT_STOCK",
  MATERIAL_NOT_FOUND: "orders.complete.errors.MATERIAL_NOT_FOUND",
  UNKNOWN: "orders.complete.errors.UNKNOWN",
} as const satisfies Record<CompleteOrderErrorCode, string>;

/**
 * Adds a catalog line to an open order (DRAFT or IN_PROGRESS).
 * First line promotes DRAFT → IN_PROGRESS so "empty draft" stays visually distinct.
 */
export async function addOrderItem(
  prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const keepKey = prev.formResetKey ?? 0;
  /**
   * Unauthorized is not the same as "no business":
   * this action runs on forged POSTs too, so we verify active tenant context + explicit order write permissions here.
   */
  const ctx = await requireOwnerBusinessForCatalog(formData, ["orders.create"]);
  if (!ctx.ok) {
    return { error: ctx.error, success: null, formResetKey: keepKey };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));

  const orderId = String(formData.get("orderId") ?? "").trim();
  const productId = String(formData.get("productId") ?? "").trim();
  const quantityText = String(formData.get("quantity") ?? "");

  if (!orderId) {
    return { error: t("orders.addItem.missingOrderId"), success: null, formResetKey: keepKey };
  }
  if (!productId) {
    return { error: t("orders.addItem.missingProductId"), success: null, formResetKey: keepKey };
  }

  const parsedQty = parsePositiveOrderQuantity(quantityText);
  if (!parsedQty.ok) {
    return { error: t(`orders.quantity.${parsedQty.code}`), success: null, formResetKey: keepKey };
  }
  const quantity = parsedQty.quantity;

  const order = await prisma.order.findFirst({
    where: { id: orderId, businessId: ctx.businessId, archivedAt: null },
    select: { id: true, status: true },
  });
  if (!order) {
    return { error: t("orders.addItem.orderNotFound"), success: null, formResetKey: keepKey };
  }
  if (!isOrderEditable(order.status)) {
    return { error: t("orders.addItem.orderNotOpen"), success: null, formResetKey: keepKey };
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, businessId: ctx.businessId, archivedAt: null, isActive: true },
    select: { id: true },
  });
  if (!product) {
    return { error: t("orders.addItem.productNotFound"), success: null, formResetKey: keepKey };
  }

  await prisma.$transaction(async (tx) => {
    await tx.orderItem.create({
      data: { orderId: order.id, productId: product.id, quantity },
    });
    await promoteDraftToInProgressIfNeeded(tx, order.id, order.status);
  });

  revalidateOrderPaths(ctx.locale, order.id);
  return {
    error: null,
    success: t("orders.addItem.success"),
    formResetKey: Date.now(),
  };
}

/**
 * Removes a line from an open order. Deleting the last line demotes IN_PROGRESS → DRAFT (empty).
 */
export async function removeOrderItem(_prev: OrderActionState, formData: FormData): Promise<OrderActionState> {
  const ctx = await requireOwnerBusinessForCatalog(formData, ["orders.create"]);
  if (!ctx.ok) {
    return { error: ctx.error, success: null };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));

  const orderId = String(formData.get("orderId") ?? "").trim();
  const orderItemId = String(formData.get("orderItemId") ?? "").trim();
  if (!orderId || !orderItemId) {
    return { error: t("orders.removeItem.missingIds"), success: null };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const line = await tx.orderItem.findFirst({
        where: {
          id: orderItemId,
          orderId,
          order: { businessId: ctx.businessId, archivedAt: null },
        },
        include: { order: { select: { status: true } } },
      });
      if (!line) {
        throw new Error("LINE_NOT_FOUND");
      }
      if (!isOrderEditable(line.order.status)) {
        throw new Error("ORDER_CLOSED");
      }

      await tx.orderItem.delete({ where: { id: orderItemId } });
      const remaining = await tx.orderItem.count({ where: { orderId } });
      await demoteToDraftIfNoItems(tx, orderId, remaining, line.order.status);
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "LINE_NOT_FOUND") return { error: t("orders.removeItem.lineNotFound"), success: null };
    if (msg === "ORDER_CLOSED") return { error: t("orders.removeItem.orderClosed"), success: null };
    return { error: t("orders.removeItem.genericError"), success: null };
  }

  revalidateOrderPaths(ctx.locale, orderId);
  return { error: null, success: t("orders.removeItem.success") };
}

/**
 * Updates quantity on an existing line (open orders only). Zero/invalid input is rejected before Prisma.
 */
export async function updateOrderItemQuantity(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const ctx = await requireOwnerBusinessForCatalog(formData, ["orders.create"]);
  if (!ctx.ok) {
    return { error: ctx.error, success: null };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));

  const orderId = String(formData.get("orderId") ?? "").trim();
  const orderItemId = String(formData.get("orderItemId") ?? "").trim();
  const quantityText = String(formData.get("quantity") ?? "");
  if (!orderId || !orderItemId) {
    return { error: t("orders.updateQuantity.missingIds"), success: null };
  }

  const parsedQty = parsePositiveOrderQuantity(quantityText);
  if (!parsedQty.ok) {
    return { error: t(`orders.quantity.${parsedQty.code}`), success: null };
  }

  try {
    const line = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        orderId,
        order: { businessId: ctx.businessId, archivedAt: null },
      },
      include: { order: { select: { status: true } } },
    });
    if (!line) {
      throw new Error("LINE_NOT_FOUND");
    }
    if (!isOrderEditable(line.order.status)) {
      throw new Error("ORDER_CLOSED");
    }

    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { quantity: parsedQty.quantity },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "LINE_NOT_FOUND") return { error: t("orders.updateQuantity.lineNotFound"), success: null };
    if (msg === "ORDER_CLOSED") return { error: t("orders.updateQuantity.orderClosed"), success: null };
    return { error: t("orders.updateQuantity.genericError"), success: null };
  }

  revalidateOrderPaths(ctx.locale, orderId);
  return { error: null, success: t("orders.updateQuantity.success") };
}

/**
 * Completes the order and runs recipe-based stock deduction inside one transaction.
 */
export async function completeOrder(formData: FormData): Promise<{ error: string | null }> {
  const userId = await getCurrentUserId();
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  if (!userId) {
    return { error: t("orders.complete.mustSignIn") };
  }
  let context;
  try {
    context = await getCurrentBusinessMemberContext(userId);
  } catch (error) {
    if (isBusinessContextSelectionError(error)) {
      return { error: t("orders.complete.selectBusinessFirst") };
    }
    throw error;
  }
  if (!canFinalizeOrderWithStockDeduction(context.member)) {
    return { error: t("orders.complete.notAllowed") };
  }

  const businessId = context.business.id;

  const orderId = String(formData.get("orderId") ?? "").trim();
  if (!orderId) {
    return { error: t("orders.complete.missingOrderId") };
  }

  const result = await completeOrderForBusiness({ businessId, orderId });
  if (!result.ok) {
    return { error: t(COMPLETE_ORDER_ERROR_KEYS[result.code]) };
  }

  revalidateOrdersIndex(locale);
  revalidateOrderDetail(locale, orderId);
  revalidateAfterStockImpact(locale);
  return { error: null };
}
