import { FinancialDataOrigin, PosPaymentMethod, PosPaymentStatus } from "@prisma/client";
import { roundMoney, type DecimalInput } from "@/lib/finance/money";

export type NativePaymentInvariantInput = {
  businessId: string;
  branchId: string;
  orderBusinessId: string;
  orderBranchId: string | null;
  amount: DecimalInput;
  orderTotalAmount: DecimalInput;
  currency: string;
  orderCurrency: string;
  method: PosPaymentMethod | null;
  status: PosPaymentStatus;
  paidAt: Date | null;
  receivedByUserId: string | null;
  receivedByDisplayNameSnapshot: string | null;
  receiptNumber: string | null;
  financialDataOrigin: FinancialDataOrigin;
};

export function validateNativePaymentInvariants(input: NativePaymentInvariantInput): void {
  if (input.financialDataOrigin !== FinancialDataOrigin.NATIVE) throw new Error("PAYMENT_ORIGIN_INVALID");
  if (!input.businessId || input.businessId !== input.orderBusinessId) throw new Error("PAYMENT_BUSINESS_MISMATCH");
  if (!input.branchId || input.branchId !== input.orderBranchId) throw new Error("PAYMENT_BRANCH_MISMATCH");
  if (!input.currency || input.currency !== input.orderCurrency) throw new Error("PAYMENT_CURRENCY_MISMATCH");
  if (!input.method) throw new Error("PAYMENT_METHOD_REQUIRED");
  if (!roundMoney(input.amount).eq(roundMoney(input.orderTotalAmount))) throw new Error("PAYMENT_AMOUNT_MISMATCH");

  if (input.status === PosPaymentStatus.CAPTURED) {
    if (!input.paidAt) throw new Error("PAYMENT_PAID_AT_REQUIRED");
    if (!input.receivedByUserId || !input.receivedByDisplayNameSnapshot?.trim()) {
      throw new Error("PAYMENT_RECEIVER_REQUIRED");
    }
    if (!input.receiptNumber?.trim()) throw new Error("PAYMENT_RECEIPT_REQUIRED");
  } else if (input.paidAt) {
    throw new Error("PAYMENT_PAID_AT_NOT_ALLOWED");
  }
}
