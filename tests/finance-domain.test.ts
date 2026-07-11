import assert from "node:assert/strict";
import test from "node:test";
import {
  FinancialDataOrigin,
  PosPaymentMethod,
  PosPaymentStatus,
} from "@prisma/client";
import { calculateLineAmounts, calculateOrderAmounts, roundMoney } from "@/lib/finance/money";
import {
  derivePaymentCategory,
  INITIAL_POS_PAYMENT_STATUSES,
  isInitialPosPaymentStatus,
  isOfficialPosPaymentMethod,
  OFFICIAL_POS_PAYMENT_METHODS,
} from "@/lib/finance/payment-method";
import { validateNativePaymentInvariants } from "@/lib/finance/payment-invariants";

test("roundMoney uses half-up rounding at three decimal places", () => {
  assert.equal(roundMoney("1.2344").toFixed(3), "1.234");
  assert.equal(roundMoney("1.2345").toFixed(3), "1.235");
});

test("line arithmetic snapshots quantity times price and applies discount then tax", () => {
  const result = calculateLineAmounts({ quantity: "2.5", unitPrice: "4.1115", discountTotal: "0.250", taxTotal: "0.100" });
  assert.equal(result.unitPrice.toFixed(3), "4.112");
  assert.equal(result.lineSubtotal.toFixed(3), "10.280");
  assert.equal(result.lineTotal.toFixed(3), "10.130");
});

test("order arithmetic sums line subtotals and applies order adjustments", () => {
  const result = calculateOrderAmounts({ lineSubtotals: ["10.111", "2.222"], discountTotal: "1.000", taxTotal: "0.500" });
  assert.equal(result.subtotalAmount.toFixed(3), "12.333");
  assert.equal(result.totalAmount.toFixed(3), "11.833");
});

test("payment category is derived and never stored as a third method state", () => {
  assert.equal(derivePaymentCategory(PosPaymentMethod.CASH), "cash");
  assert.equal(derivePaymentCategory(PosPaymentMethod.BANK_CARD), "banking");
  assert.equal(derivePaymentCategory(PosPaymentMethod.SADAD), "banking");
});

test("official payment method allowlist is exact and has no unknown value", () => {
  assert.deepEqual(OFFICIAL_POS_PAYMENT_METHODS, [
    "CASH", "BANK_CARD", "ONE_PAY", "LY_PAY", "EDAFLY", "MOBI_CASH",
    "MASREFY_PAY", "YUSR_PAY", "YUSR_PAY_QR", "SADAD", "SAHARA_PAY",
  ]);
  assert.equal(isOfficialPosPaymentMethod("LEGACY_UNKNOWN"), false);
  assert.equal(isOfficialPosPaymentMethod("UNKNOWN"), false);
});

test("initial payment status allowlist is exact", () => {
  assert.deepEqual(INITIAL_POS_PAYMENT_STATUSES, ["PENDING", "CAPTURED", "FAILED", "CANCELLED"]);
  assert.equal(isInitialPosPaymentStatus("REFUNDED"), false);
});

test("native captured payment invariant requires exact tenant, branch, currency, amount, receiver and receipt", () => {
  assert.doesNotThrow(() => validateNativePaymentInvariants({
    businessId: "business-1",
    branchId: "branch-1",
    orderBusinessId: "business-1",
    orderBranchId: "branch-1",
    amount: "12.333",
    orderTotalAmount: "12.333",
    currency: "LYD",
    orderCurrency: "LYD",
    method: PosPaymentMethod.CASH,
    status: PosPaymentStatus.CAPTURED,
    paidAt: new Date("2026-07-11T12:00:00Z"),
    receivedByUserId: "user-1",
    receivedByDisplayNameSnapshot: "Cashier",
    receiptNumber: "RCT-B01-1",
    financialDataOrigin: FinancialDataOrigin.NATIVE,
  }));
});

test("native payment rejects amount and tenant mismatches", () => {
  const base = {
    businessId: "business-1",
    branchId: "branch-1",
    orderBusinessId: "business-1",
    orderBranchId: "branch-1",
    amount: "12.333",
    orderTotalAmount: "12.333",
    currency: "LYD",
    orderCurrency: "LYD",
    method: PosPaymentMethod.CASH,
    status: PosPaymentStatus.CAPTURED,
    paidAt: new Date("2026-07-11T12:00:00Z"),
    receivedByUserId: "user-1",
    receivedByDisplayNameSnapshot: "Cashier",
    receiptNumber: "RCT-B01-1",
    financialDataOrigin: FinancialDataOrigin.NATIVE,
  } as const;
  assert.throws(() => validateNativePaymentInvariants({ ...base, orderBusinessId: "business-2" }), /PAYMENT_BUSINESS_MISMATCH/);
  assert.throws(() => validateNativePaymentInvariants({ ...base, amount: "12.334" }), /PAYMENT_AMOUNT_MISMATCH/);
});

test("manually reconciled captured payment keeps the same financial invariants", () => {
  assert.doesNotThrow(() => validateNativePaymentInvariants({
    businessId: "b", branchId: "br", orderBusinessId: "b", orderBranchId: "br", amount: "1.000", orderTotalAmount: "1.000",
    currency: "LYD", orderCurrency: "LYD", method: PosPaymentMethod.CASH, status: PosPaymentStatus.CAPTURED, paidAt: new Date(),
    receivedByUserId: "u", receivedByDisplayNameSnapshot: "Receiver", receiptNumber: "RCT-BR-1", financialDataOrigin: FinancialDataOrigin.MANUALLY_RECONCILED,
  }));
});
