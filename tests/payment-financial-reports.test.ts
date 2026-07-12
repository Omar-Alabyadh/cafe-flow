import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { getUtcRangeForLocalDate } from "@/lib/time-zone/day-boundaries";

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

test("financial report page enforces permission, tenant branch scope, and operational time zones", () => {
  const source = readFileSync("app/[locale]/(dashboard)/dashboard/business/reports/financial/page.tsx", "utf8");
  const permissionCheck = source.indexOf('hasPermission(context.member, "reports.financial.view")');
  const reportCall = source.indexOf("getPaymentFinancialReport({");
  assert.ok(permissionCheck >= 0 && permissionCheck < reportCall);
  assert.match(source, /const forcedBranch = context\.member\.branchId; const requestedBranch = forcedBranch \?\? query\.branch \?\? null/);
  assert.match(source, /branches = await prisma\.branch\.findMany\(\{ where: \{ businessId: context\.business\.id \}/);
  assert.match(source, /requestedBranch && !branches\.some[\s\S]*invalidBranch/);
  assert.match(source, /requestedBranch \? branches\.find[\s\S]*\.timeZone \?\? context\.business\.timeZone : context\.business\.timeZone/);
  assert.match(source, /\["today", "last7", "month", "custom"\]/);
  assert.match(source, /period === "last7" \? shiftedDay\(today, -6\) : period === "month" \? `\$\{today\.slice\(0, 8\)\}01` : period === "custom"/);
});

test("local reporting day ranges use inclusive starts and exclusive next-day boundaries", () => {
  const tripoli = getUtcRangeForLocalDate({ date: "2026-07-12", timeZone: "Africa/Tripoli" });
  const utc = getUtcRangeForLocalDate({ date: "2026-07-12", timeZone: "UTC" });
  assert.equal(tripoli?.startUtc.toISOString(), "2026-07-11T22:00:00.000Z");
  assert.equal(tripoli?.nextDayStartUtc.toISOString(), "2026-07-12T22:00:00.000Z");
  assert.equal(utc?.startUtc.toISOString(), "2026-07-12T00:00:00.000Z");
  assert.equal(utc?.nextDayStartUtc.toISOString(), "2026-07-13T00:00:00.000Z");
  assert.equal(getUtcRangeForLocalDate({ date: "2026-02-30", timeZone: "UTC" }), null);
});
