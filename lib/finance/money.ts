import { Prisma } from "@prisma/client";

export const MONEY_SCALE = 3;
export const ZERO_MONEY = new Prisma.Decimal(0);

export type DecimalInput = Prisma.Decimal.Value;

/** CafeFlow monetary policy: round half-up to NUMERIC(18,3) precision. */
export function roundMoney(value: DecimalInput): Prisma.Decimal {
  return new Prisma.Decimal(value).toDecimalPlaces(MONEY_SCALE, Prisma.Decimal.ROUND_HALF_UP);
}

export function calculateLineAmounts(input: {
  quantity: DecimalInput;
  unitPrice: DecimalInput;
  discountTotal?: DecimalInput;
  taxTotal?: DecimalInput;
}) {
  const quantity = new Prisma.Decimal(input.quantity);
  const unitPrice = roundMoney(input.unitPrice);
  const discountTotal = roundMoney(input.discountTotal ?? ZERO_MONEY);
  const taxTotal = roundMoney(input.taxTotal ?? ZERO_MONEY);

  if (quantity.lte(0) || unitPrice.lt(0) || discountTotal.lt(0) || taxTotal.lt(0)) {
    throw new Error("FINANCIAL_AMOUNT_INVALID");
  }

  const lineSubtotal = roundMoney(quantity.mul(unitPrice));
  const lineTotal = roundMoney(lineSubtotal.sub(discountTotal).add(taxTotal));
  if (lineTotal.lt(0)) throw new Error("FINANCIAL_TOTAL_NEGATIVE");

  return { unitPrice, lineSubtotal, discountTotal, taxTotal, lineTotal };
}

export function calculateOrderAmounts(input: {
  lineSubtotals: DecimalInput[];
  discountTotal?: DecimalInput;
  taxTotal?: DecimalInput;
}) {
  const subtotal = input.lineSubtotals.reduce<Prisma.Decimal>(
    (sum, amount) => sum.add(amount),
    new Prisma.Decimal(0),
  );
  const subtotalAmount = roundMoney(subtotal);
  const discountTotal = roundMoney(input.discountTotal ?? ZERO_MONEY);
  const taxTotal = roundMoney(input.taxTotal ?? ZERO_MONEY);
  if (subtotalAmount.lt(0) || discountTotal.lt(0) || taxTotal.lt(0)) {
    throw new Error("FINANCIAL_AMOUNT_INVALID");
  }
  const totalAmount = roundMoney(subtotalAmount.sub(discountTotal).add(taxTotal));
  if (totalAmount.lt(0)) throw new Error("FINANCIAL_TOTAL_NEGATIVE");
  return { subtotalAmount, discountTotal, taxTotal, totalAmount };
}
