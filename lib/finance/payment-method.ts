import { PosPaymentMethod, PosPaymentStatus } from "@prisma/client";

export const OFFICIAL_POS_PAYMENT_METHODS = Object.freeze(Object.values(PosPaymentMethod));
export const INITIAL_POS_PAYMENT_STATUSES = Object.freeze(Object.values(PosPaymentStatus));

export type PaymentCategory = "cash" | "banking";

export function derivePaymentCategory(method: PosPaymentMethod): PaymentCategory {
  return method === PosPaymentMethod.CASH ? "cash" : "banking";
}

export function isOfficialPosPaymentMethod(value: unknown): value is PosPaymentMethod {
  return typeof value === "string" && OFFICIAL_POS_PAYMENT_METHODS.includes(value as PosPaymentMethod);
}

export function isInitialPosPaymentStatus(value: unknown): value is PosPaymentStatus {
  return typeof value === "string" && INITIAL_POS_PAYMENT_STATUSES.includes(value as PosPaymentStatus);
}
