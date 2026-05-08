import { consumeProductFromRecipeInTransaction } from "@/lib/inventory/consume-product-from-recipe";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@prisma/client";

/**
 * ---------------------------------------------------------------------------
 * Order management philosophy (CafeFlow / graduation defense)
 * ---------------------------------------------------------------------------
 * - POS (`/dashboard/business/pos`): where selling happens — cart, payment intent,
 *   and (in this phase) immediate completion + stock deduction in one flow.
 * - Orders index (`/dashboard/business/orders`): supervision only — search, filter,
 *   open a row, fix mistakes on *open* drafts / in-progress orders, complete when ready.
 * We never imply the orders list is a second cash register; wording in the UI matches that.
 *
 * Stock deduction runs **only inside successful completion** (same rule as before):
 * building a draft does not move inventory; completing does, in one DB transaction.
 */

/** Statuses where managers may add/remove lines or change quantities. */
export const EDITABLE_ORDER_STATUSES: readonly OrderStatus[] = [
  OrderStatus.DRAFT,
  OrderStatus.IN_PROGRESS,
];

export function isOrderEditable(status: OrderStatus): boolean {
  return status === OrderStatus.DRAFT || status === OrderStatus.IN_PROGRESS;
}

/**
 * Completion is blocked when there is nothing to sell or the order is already closed.
 * The UI should mirror this so supervisors understand why the button is hidden/disabled.
 */
export function canShowCompleteOrderAction(status: OrderStatus, itemCount: number): boolean {
  return isOrderEditable(status) && itemCount > 0;
}

/**
 * After the first line is attached, the order leaves "empty draft" and becomes work-in-progress.
 * This makes the distinction obvious in the table: empty draft vs active basket.
 */
export async function promoteDraftToInProgressIfNeeded(
  tx: Prisma.TransactionClient,
  orderId: string,
  currentStatus: OrderStatus,
): Promise<void> {
  if (currentStatus === OrderStatus.DRAFT) {
    await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.IN_PROGRESS },
    });
  }
}

/**
 * If every line is removed from an in-progress order, we demote back to DRAFT (empty header).
 * That matches the "empty draft" label in the UI.
 */
export async function demoteToDraftIfNoItems(
  tx: Prisma.TransactionClient,
  orderId: string,
  remainingCount: number,
  currentStatus: OrderStatus,
): Promise<void> {
  if (remainingCount === 0 && currentStatus === OrderStatus.IN_PROGRESS) {
    await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.DRAFT },
    });
  }
}

export type CompleteOrderResult =
  | { ok: true }
  | { ok: false; code: CompleteOrderErrorCode };

export type CompleteOrderErrorCode =
  | "ORDER_NOT_FOUND"
  | "ORDER_NOT_OPEN"
  | "ORDER_EMPTY"
  | "PRODUCT_NOT_FOUND"
  | "RECIPE_REQUIRED"
  | "RECIPE_EMPTY"
  | "INSUFFICIENT_STOCK"
  | "MATERIAL_NOT_FOUND"
  | "UNKNOWN";

/**
 * Completes an open order and deducts stock per recipe lines.
 * Any consumption failure rolls back the **entire** transaction — no partial stock moves.
 */
export async function completeOrderForBusiness(params: {
  businessId: string;
  orderId: string;
}): Promise<CompleteOrderResult> {
  const { businessId, orderId } = params;

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, businessId, archivedAt: null },
        include: { items: true },
      });
      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }
      if (!isOrderEditable(order.status)) {
        throw new Error("ORDER_NOT_OPEN");
      }
      if (order.items.length === 0) {
        throw new Error("ORDER_EMPTY");
      }

      for (const item of order.items) {
        await consumeProductFromRecipeInTransaction(tx, {
          businessId,
          productId: item.productId,
          quantity: new Prisma.Decimal(item.quantity.toString()),
          note: `Complete order ${order.id}`,
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.COMPLETED, completedAt: new Date() },
      });
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "ORDER_NOT_FOUND") return { ok: false, code: "ORDER_NOT_FOUND" };
    if (msg === "ORDER_NOT_OPEN") return { ok: false, code: "ORDER_NOT_OPEN" };
    if (msg === "ORDER_EMPTY") return { ok: false, code: "ORDER_EMPTY" };
    if (msg === "PRODUCT_NOT_FOUND") return { ok: false, code: "PRODUCT_NOT_FOUND" };
    if (msg === "RECIPE_REQUIRED") return { ok: false, code: "RECIPE_REQUIRED" };
    if (msg === "RECIPE_EMPTY") return { ok: false, code: "RECIPE_EMPTY" };
    if (msg === "INSUFFICIENT_STOCK") return { ok: false, code: "INSUFFICIENT_STOCK" };
    if (msg === "MATERIAL_NOT_FOUND") return { ok: false, code: "MATERIAL_NOT_FOUND" };
    return { ok: false, code: "UNKNOWN" };
  }
}

