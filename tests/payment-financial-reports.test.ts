import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("payment report service keeps server-only and all banking methods", () => {
  const source = readFileSync("lib/finance/payment-financial-reports.ts", "utf8");
  assert.match(source, /import "server-only"/);
  assert.match(source, /filter\(\(method\) => method !== PosPaymentMethod\.CASH\)/);
  assert.match(source, /toISOString\(\)\.replace\("T", " "\)\.replace\("Z", ""\)/);
  assert.match(source, /Prisma\.sql`[\s\S]*p\."businessId"\s*=\s*\$\{input\.businessId\}[\s\S]*p\."paidAt"\s*>=\s*\$\{startUtc\}::timestamp[\s\S]*p\."paidAt"\s*<\s*\$\{endUtc\}::timestamp/);
  assert.match(source, /p\."branchId"\s*=\s*\$\{input\.branchId\}/);
  assert.match(source, /p\.currency\s*=\s*\$\{input\.currency\}/);
  assert.match(source, /SELECT\s+count\(\*\)\s+count\s+\$\{predicate\}/);
  assert.match(source, /ORDER BY p\."paidAt" DESC, p\.id DESC LIMIT \$\{pageSize\} OFFSET \$\{\(page - 1\) \* pageSize\}/);
  assert.doesNotMatch(source, /\$queryRawUnsafe|findMany\(|basePrice|PaymentRequest/);
  assert.match(source, /o\."financialDataOrigin" IN \('NATIVE'::"FinancialDataOrigin", 'MANUALLY_RECONCILED'::"FinancialDataOrigin"\)/);
});
