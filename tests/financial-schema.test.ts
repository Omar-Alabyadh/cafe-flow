import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const schema = readFileSync("prisma/schema.prisma", "utf8");
const migration = readFileSync(
  "prisma/migrations/20260711190000_financial_schema_foundation_f1/migration.sql",
  "utf8",
);

test("legacy-facing order and item financial fields are nullable", () => {
  for (const field of [
    "branchId", "orderNumber", "subtotalAmount", "discountTotal", "taxTotal", "totalAmount",
    "currency", "financialSnapshotVersion", "financialDataOrigin", "branchDataOrigin",
    "productNameSnapshot", "productCodeSnapshot", "unitPrice", "lineSubtotal",
    "lineDiscountTotal", "lineTaxTotal", "lineTotal",
  ]) {
    assert.match(schema, new RegExp(`\\b${field}\\s+\\w+\\?`));
  }
});

test("money columns use NUMERIC 18,3 and document uniqueness is business scoped", () => {
  assert.equal((migration.match(/DECIMAL\(18,3\)/g) ?? []).length, 10);
  assert.match(migration, /Order_businessId_orderNumber_key/);
  assert.match(migration, /Payment_businessId_receiptNumber_key/);
  assert.doesNotMatch(migration, /UNIQUE[^\n]+\("orderNumber"\)/);
  assert.doesNotMatch(migration, /UNIQUE[^\n]+\("receiptNumber"\)/);
});

test("captured payment uniqueness is a partial PostgreSQL index", () => {
  assert.match(migration, /CREATE UNIQUE INDEX "Payment_one_captured_per_order_idx"[\s\S]+WHERE "status" = 'CAPTURED'/);
  assert.doesNotMatch(migration, /CREATE UNIQUE INDEX[^\n]+ON "Payment"\("orderId"\);/);
});

test("migration is additive and leaves SaaS payment domain untouched", () => {
  assert.doesNotMatch(migration, /^\s*(DROP|DELETE|UPDATE|TRUNCATE)\b/im);
  assert.doesNotMatch(migration, /ALTER TYPE "PaymentMethod"|ALTER TABLE "PaymentRequest"/);
  assert.match(migration, /CREATE TYPE "PosPaymentMethod"/);
});
