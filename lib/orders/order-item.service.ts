import { Prisma } from "@prisma/client";

/**
 * Validation helpers for order lines on the *management* screen.
 * Why strict parsing?
 * - Quantities flow into recipe consumption math at completion; bad input must never reach Prisma as NaN.
 * - Zero/negative quantities would imply "free" consumption or broken stock logic.
 */

export type OrderQuantityParseError = "EMPTY" | "INVALID_FORMAT" | "NOT_POSITIVE";

export type ParsedQuantity =
  | { ok: true; quantity: Prisma.Decimal }
  | { ok: false; code: OrderQuantityParseError };

/**
 * @param quantityText raw input from the form (Arabic or Western digits typed as plain text)
 * @returns parsed positive Decimal or a stable machine code translated in server actions via `serverActions.orders.quantity.*`.
 */
export function parsePositiveOrderQuantity(quantityText: string): ParsedQuantity {
  const trimmed = quantityText.trim();
  if (!trimmed) {
    return { ok: false, code: "EMPTY" };
  }
  if (!/^\d+(\.\d{1,3})?$/.test(trimmed)) {
    return { ok: false, code: "INVALID_FORMAT" };
  }
  const quantity = new Prisma.Decimal(trimmed);
  if (!quantity.gt(new Prisma.Decimal(0))) {
    return { ok: false, code: "NOT_POSITIVE" };
  }
  return { ok: true, quantity };
}
