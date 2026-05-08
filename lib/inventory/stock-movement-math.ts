import { Prisma, StockMovementType } from "@prisma/client";

/**
 * Stock movements always store `quantity` as a positive magnitude.
 * This function converts that magnitude into a signed delta for the running balance:
 * - IN types add to stock.
 * - OUT types subtract from stock.
 *
 * This keeps the database rows easy to read during demos: you always see a positive
 * number in the `quantity` column, and the `type` column explains the direction.
 */
export function signedDeltaFromMovement(
  type: StockMovementType,
  positiveQuantity: Prisma.Decimal,
): Prisma.Decimal {
  const increases: StockMovementType[] = [
    StockMovementType.OPENING_BALANCE,
    StockMovementType.STOCK_IN,
    StockMovementType.ADJUSTMENT_ADD,
  ];

  if (increases.includes(type)) {
    return positiveQuantity;
  }

  // ADJUSTMENT_SUBTRACT, WASTE, and CONSUMPTION reduce on-hand quantity.
  return positiveQuantity.mul(new Prisma.Decimal(-1));
}
