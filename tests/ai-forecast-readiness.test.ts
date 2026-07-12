import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { FinancialDataOrigin, Prisma } from "@prisma/client";
import { analyzeAuditRows, assertSafeDatabaseUrl } from "@/scripts/ai-forecast-readiness";

const decimal = (value: number) => new Prisma.Decimal(value);
const base = {
  businessIds: ["business-private-a", "business-private-b"],
  branchCount: 2,
  rows: [
    {
      businessId: "business-private-a",
      branchId: null,
      status: "COMPLETED",
      completedAt: new Date("2026-07-01T10:00:00.000Z"),
      financialDataOrigin: FinancialDataOrigin.LEGACY_UNKNOWN,
      items: [{ productId: "product-private-a", quantity: decimal(2), product: { businessId: "business-private-a", isActive: true, archivedAt: null, categoryId: null, category: null } }],
    },
    {
      businessId: "business-private-b",
      branchId: "branch-private-b",
      status: "COMPLETED",
      completedAt: new Date("2026-07-02T10:00:00.000Z"),
      financialDataOrigin: FinancialDataOrigin.NATIVE,
      items: [{ productId: "product-private-b", quantity: decimal(3), product: { businessId: "business-private-b", isActive: true, archivedAt: null, categoryId: "category-private", category: { id: "category-private" } } }],
    },
  ],
};

test("keeps Native and LEGACY_UNKNOWN demand separate", () => {
  const result = analyzeAuditRows(base, new Date("2026-07-03T00:00:00.000Z"));
  assert.equal(result.dataIntegrity.byFinancialDataOrigin.NATIVE.orderCount, 1);
  assert.equal(result.dataIntegrity.byFinancialDataOrigin.LEGACY_UNKNOWN.orderCount, 1);
  assert.equal(result.demandQuantityQuality.byFinancialDataOrigin.NATIVE.totalUnitsSold, 3);
  assert.equal(result.demandQuantityQuality.byFinancialDataOrigin.LEGACY_UNKNOWN.totalUnitsSold, 2);
});

test("returns no raw identifiers or private rows", () => {
  const output = JSON.stringify(analyzeAuditRows(base));
  for (const identifier of ["business-private-a", "business-private-b", "branch-private-b", "product-private-a", "category-private"]) {
    assert.equal(output.includes(identifier), false);
  }
  assert.match(output, /business_1/);
});

test("retains tenant separation and does not infer missing branches", () => {
  const result = analyzeAuditRows(base);
  assert.deepEqual(result.businessAndBranchReadiness.perBusiness.map((business) => business.orderCount), [1, 1]);
  assert.equal(result.businessAndBranchReadiness.totalOrdersWithNoBranch, 1);
  assert.match(result.businessAndBranchReadiness.branchForecasting, /must remain unassigned/);
});

test("uses a transaction marked read-only and excludes financial fields", () => {
  const source = readFileSync("scripts/ai-forecast-readiness.ts", "utf8");
  assert.match(source, /SET TRANSACTION READ ONLY/);
  assert.doesNotMatch(source, /\.(create|update|upsert|delete|executeRawUnsafe)\s*\(/);
  for (const financialField of ["basePrice", "unitPrice", "totalAmount", "subtotalAmount", "Payment"]) {
    assert.equal(source.includes(financialField), false);
  }
});

test("rejects production-like hosts unless explicitly confirmed as disposable local audit infrastructure", () => {
  assert.throws(() => assertSafeDatabaseUrl("postgresql://user:password@db.example.com:5432/cafeflow", []), /Refusing a non-local/);
  assert.throws(() => assertSafeDatabaseUrl("postgresql://user:password@project.supabase.co:5432/cafeflow", ["--local-audit-override=I_CONFIRM_LOCAL_DISPOSABLE_DATABASE"]), /Supabase/);
  assert.doesNotThrow(() => assertSafeDatabaseUrl("postgresql://user@localhost:55432/cafeflow", []));
});
