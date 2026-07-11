import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { FinancialDataOrigin, PosPaymentStatus } from "@prisma/client";
import { isOfficialPaymentReportEligible } from "@/lib/finance/official-report-eligibility";

test("legacy reconciliation migration is additive and never writes historical data", () => {
  const migration = readFileSync("prisma/migrations/20260711230000_legacy_financial_reconciliation_f4/migration.sql", "utf8");
  assert.match(migration, /ADD COLUMN "reconciliationEvidenceDescription" TEXT/);
  assert.doesNotMatch(migration, /^\s*(DELETE|UPDATE|INSERT|TRUNCATE|DROP)\b/im);
  assert.doesNotMatch(migration, /PaymentRequest|PaymentMethod|Refund/);
});

test("only a complete tenant-consistent captured payment is report eligible", () => {
  const order = { businessId: "business", branchId: "branch", currency: "LYD", totalAmount: "12.000", financialDataOrigin: FinancialDataOrigin.MANUALLY_RECONCILED, payments: [{ businessId: "business", branchId: "branch", currency: "LYD", amount: "12.000", method: "CASH", status: PosPaymentStatus.CAPTURED, paidAt: new Date(), receivedByUserId: "receiver" }] };
  assert.equal(isOfficialPaymentReportEligible(order), true);
  assert.equal(isOfficialPaymentReportEligible({ ...order, financialDataOrigin: FinancialDataOrigin.LEGACY_UNKNOWN }), false);
  assert.equal(isOfficialPaymentReportEligible({ ...order, payments: [] }), false);
  assert.equal(isOfficialPaymentReportEligible({ ...order, payments: [{ ...order.payments[0], branchId: "other" }] }), false);
});
