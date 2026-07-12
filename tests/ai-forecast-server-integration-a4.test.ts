import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { addDays } from "@/lib/ai/forecast/date-utils";
import { createForecastServerService, FORECAST_LIMITS } from "@/lib/ai/forecast/server/service";
import type { ForecastBusinessContext, ForecastComputationGuard, ForecastReadRepository, ForecastRequest, NativeDemandQuery, NativeDemandRecord } from "@/lib/ai/forecast/server/types";

const now = () => new Date("2026-05-01T12:00:00.000Z");
const managerContext: ForecastBusinessContext = {
  userId: "user-private-a",
  businessId: "business-private-a",
  member: { role: "MANAGER", scope: "ALL_BRANCHES", branchId: null, grantedPermissions: [], revokedPermissions: [] },
};

function nativeRecords(productId = "product-private-a", label = "Alpha product", branchId: string | null = "branch-private-a", branchDataOrigin = "NATIVE"): NativeDemandRecord[] {
  return Array.from({ length: 120 }, (_, index) => ({
    status: "COMPLETED",
    financialDataOrigin: "NATIVE",
    branchDataOrigin,
    branchId,
    completedAt: new Date(`${addDays("2026-01-01", index)}T12:00:00.000Z`),
    product: { id: productId, businessId: "business-private-a", displayLabel: label, isActive: true, archivedAt: null },
    quantity: 8 + (index % 7),
  }));
}

function createHarness(options: {
  userId?: string | null;
  context?: ForecastBusinessContext | null;
  records?: NativeDemandRecord[];
  branch?: { id: string; displayLabel: string } | null;
  branchAccess?: boolean;
  guard?: ForecastComputationGuard;
} = {}) {
  const calls: { queries: NativeDemandQuery[]; branchCalls: Array<{ businessId: string; branchId: string }> } = { queries: [], branchCalls: [] };
  const repository: ForecastReadRepository = {
    async findAuthorizedBranch(input) {
      calls.branchCalls.push(input);
      return options.branch === undefined ? { id: "branch-private-a", displayLabel: "Authorized branch" } : options.branch;
    },
    async readNativeDemand(query) {
      calls.queries.push(query);
      return options.records ?? nativeRecords();
    },
  };
  return {
    calls,
    service: createForecastServerService({
      getCurrentUserId: async () => options.userId === undefined ? managerContext.userId : options.userId,
      getBusinessContext: async () => options.context === undefined ? managerContext : options.context,
      canAccessBranch: () => options.branchAccess ?? true,
      repository,
      guard: options.guard,
      now,
    }),
  };
}

const realRequest: ForecastRequest = { forecastMode: "REAL_PILOT", scopeType: "BUSINESS", horizonDays: 1 };

test("rejects an unauthenticated forecast request", async () => {
  const response = await createHarness({ userId: null }).service.generateForecast(realRequest);
  assert.deepEqual(response, { ok: false, code: "UNAUTHENTICATED", message: "Sign in is required to use forecasting." });
});

test("rejects a missing active membership", async () => {
  const response = await createHarness({ context: null }).service.generateForecast(realRequest);
  assert.equal(response.ok, false);
  if (!response.ok) assert.equal(response.code, "FORBIDDEN");
});

test("client-provided business scope is rejected and never reaches the query", async () => {
  const harness = createHarness();
  const response = await harness.service.generateForecast({ ...realRequest, businessId: "business-private-other" } as ForecastRequest);
  assert.equal(response.ok, false);
  if (!response.ok) assert.equal(response.code, "INVALID_INPUT");
  assert.equal(harness.calls.queries.length, 0);
});

test("the real query always uses the authenticated active business", async () => {
  const harness = createHarness();
  await harness.service.generateForecast(realRequest);
  assert.equal(harness.calls.queries[0].businessId, managerContext.businessId);
  assert.equal(harness.calls.queries[0].maxOrders, FORECAST_LIMITS.maxOrders);
});

test("unauthorized branches are rejected before any demand query", async () => {
  const harness = createHarness({ branchAccess: false });
  const response = await harness.service.generateForecast({ forecastMode: "REAL_PILOT", scopeType: "BRANCH", branchReference: "branch-private-a", horizonDays: 1 });
  assert.equal(response.ok, false);
  if (!response.ok) assert.equal(response.code, "FORBIDDEN");
  assert.equal(harness.calls.queries.length, 0);
});

test("a branch from another business is rejected by the server repository", async () => {
  const harness = createHarness({ branch: null });
  const response = await harness.service.generateForecast({ forecastMode: "REAL_PILOT", scopeType: "BRANCH", branchReference: "branch-private-other", horizonDays: 1 });
  assert.equal(response.ok, false);
  if (!response.ok) assert.equal(response.code, "INVALID_SCOPE");
  assert.deepEqual(harness.calls.branchCalls[0], { businessId: managerContext.businessId, branchId: "branch-private-other" });
});

test("Demo mode is restricted to Owner and Manager", async () => {
  const cashier = { ...managerContext, member: { ...managerContext.member, role: "CASHIER" } };
  const response = await createHarness({ context: cashier }).service.generateForecast({ forecastMode: "ACADEMIC_DEMO", scopeType: "BUSINESS", horizonDays: 1 });
  assert.equal(response.ok, false);
  if (!response.ok) assert.equal(response.code, "FORBIDDEN");
});

test("real mode filters to Native completed records only", async () => {
  const records = [
    ...nativeRecords(),
    { ...nativeRecords()[0], financialDataOrigin: "LEGACY_UNKNOWN" },
    { ...nativeRecords()[1], status: "CANCELED" },
    { ...nativeRecords()[2], quantity: 0 },
  ];
  const response = await createHarness({ records }).service.generateForecast(realRequest);
  assert.equal(response.ok, true);
  if (response.ok) assert.equal(response.products.length, 1);
});

test("LEGACY_UNKNOWN, non-completed, invalid timestamp, and inactive-product rows are excluded", async () => {
  const invalid = nativeRecords().slice(0, 4).map((record, index) => index === 0 ? { ...record, financialDataOrigin: "LEGACY_UNKNOWN" } : index === 1 ? { ...record, status: "DRAFT" } : index === 2 ? { ...record, completedAt: null } : { ...record, product: { ...record.product!, isActive: false } });
  const response = await createHarness({ records: invalid }).service.generateForecast(realRequest);
  assert.equal(response.ok, true);
  if (response.ok) {
    assert.equal(response.state, "INSUFFICIENT_HISTORY");
    assert.equal(response.products.length, 0);
  }
});

test("missing branch values are never inferred for branch forecasts", async () => {
  const response = await createHarness({ records: nativeRecords("product-private-a", "Alpha product", null) }).service.generateForecast({ forecastMode: "REAL_PILOT", scopeType: "BRANCH", branchReference: "branch-private-a", horizonDays: 1 });
  assert.equal(response.ok, true);
  if (response.ok) assert.equal(response.state, "INSUFFICIENT_HISTORY");
});

test("branch demand requires trusted native branch attribution", async () => {
  const response = await createHarness({ records: nativeRecords("product-private-a", "Alpha product", "branch-private-a", "LEGACY_UNKNOWN") }).service.generateForecast({ forecastMode: "REAL_PILOT", scopeType: "BRANCH", branchReference: "branch-private-a", horizonDays: 1 });
  assert.equal(response.ok, true);
  if (response.ok) assert.equal(response.state, "INSUFFICIENT_HISTORY");
});

test("business aggregation preserves product separation and deterministic labels", async () => {
  const records = [...nativeRecords("product-private-b", "Bravo product"), ...nativeRecords("product-private-a", "Alpha product")].reverse();
  const response = await createHarness({ records }).service.generateForecast(realRequest);
  assert.equal(response.ok, true);
  if (response.ok) assert.deepEqual(response.products.map((product) => product.productLabel), ["Alpha product", "Bravo product"]);
});

test("one-day horizon is accepted", async () => {
  const response = await createHarness().service.generateForecast(realRequest);
  assert.equal(response.ok, true);
  if (response.ok) assert.equal(response.products[0].forecasts.length, 1);
});

test("seven-day horizon is accepted only when A3 gates pass", async () => {
  const ready = await createHarness().service.generateForecast({ ...realRequest, horizonDays: 7 });
  assert.equal(ready.ok, true);
  if (ready.ok) assert.equal(ready.products[0].forecasts.length, 7);
  const insufficient = await createHarness({ records: nativeRecords().slice(0, 70) }).service.generateForecast({ ...realRequest, horizonDays: 7 });
  assert.equal(insufficient.ok, true);
  if (insufficient.ok) assert.equal(insufficient.state, "INSUFFICIENT_HISTORY");
});

test("unsupported horizons are rejected safely", async () => {
  const response = await createHarness().service.generateForecast({ ...realRequest, horizonDays: 2 });
  assert.equal(response.ok, false);
  if (!response.ok) assert.equal(response.code, "INVALID_INPUT");
});

test("empty eligible history returns the typed insufficient-history state", async () => {
  const response = await createHarness({ records: [] }).service.generateForecast(realRequest);
  assert.equal(response.ok, true);
  if (response.ok) assert.equal(response.state, "INSUFFICIENT_HISTORY");
});

test("Demo uses only deterministic in-memory data and never reads demand", async () => {
  const harness = createHarness();
  const response = await harness.service.generateForecast({ forecastMode: "ACADEMIC_DEMO", scopeType: "BUSINESS", horizonDays: 1 });
  assert.equal(response.ok, true);
  if (response.ok) {
    assert.equal(response.dataSource, "DEMO_ONLY");
    assert.deepEqual(response.demo, { isDemo: true, labelAr: "توقع تجريبي", labelEn: "Demo Forecast" });
    assert.equal(harness.calls.queries.length, 0);
  }
});

test("Demo and real results remain source-separated", async () => {
  const harness = createHarness();
  const real = await harness.service.generateForecast(realRequest);
  const demo = await harness.service.generateForecast({ forecastMode: "ACADEMIC_DEMO", scopeType: "BUSINESS", horizonDays: 1 });
  assert.equal(real.ok && real.dataSource, "NATIVE_ONLY");
  assert.equal(demo.ok && demo.dataSource, "DEMO_ONLY");
});

test("client-safe errors do not expose private identifiers or Prisma details", async () => {
  const response = await createHarness({ context: { ...managerContext, businessId: "business-private-secret" }, branch: null }).service.generateForecast({ forecastMode: "REAL_PILOT", scopeType: "BRANCH", branchReference: "branch-private-secret", horizonDays: 1 });
  const serialized = JSON.stringify(response);
  assert.equal(serialized.includes("business-private-secret"), false);
  assert.equal(serialized.includes("branch-private-secret"), false);
  assert.equal(serialized.toLowerCase().includes("prisma"), false);
});

test("product and history computations are bounded", async () => {
  const records = Array.from({ length: 25 }, (_, index) => nativeRecords(`product-private-${index}`, `Product ${String(index).padStart(2, "0")}`)).flat();
  const harness = createHarness({ records });
  const response = await harness.service.generateForecast(realRequest);
  assert.equal(response.ok, true);
  if (response.ok) assert.equal(response.products.length, FORECAST_LIMITS.maxProducts);
  assert.ok(harness.calls.queries[0].historyStart >= new Date("2025-11-03T00:00:00.000Z"));
});

test("computation guard safely rejects a duplicate generation", async () => {
  const guard: ForecastComputationGuard = { tryAcquire: () => false, release: () => {} };
  const response = await createHarness({ guard }).service.generateForecast(realRequest);
  assert.equal(response.ok, false);
  if (!response.ok) assert.equal(response.code, "COMPUTATION_LIMIT");
});

test("readiness returns a DTO without internal scope identifiers", async () => {
  const response = await createHarness().service.getForecastReadiness(realRequest);
  assert.equal(response.ok, true);
  const serialized = JSON.stringify(response);
  assert.equal(serialized.includes(managerContext.businessId), false);
  assert.equal(serialized.includes("product-private-a"), false);
});

test("integration query source contains no financial amounts or Payment access", () => {
  const source = readFileSync("lib/ai/forecast/server/forecast-server.ts", "utf8");
  for (const forbidden of ["unitPrice", "subtotalAmount", "totalAmount", "taxTotal", "discountTotal", "prisma.payment"]) assert.equal(source.includes(forbidden), false);
});

test("integration is read-only and contains no write operation", () => {
  const source = readFileSync("lib/ai/forecast/server/forecast-server.ts", "utf8");
  assert.doesNotMatch(source, /\.(create|update|upsert|delete|executeRaw)\s*\(/);
});

test("real queries use only a bounded Native completed-order window", () => {
  const source = readFileSync("lib/ai/forecast/server/forecast-server.ts", "utf8");
  assert.match(source, /status: OrderStatus\.COMPLETED/);
  assert.match(source, /financialDataOrigin: FinancialDataOrigin\.NATIVE/);
  assert.match(source, /take: query\.maxOrders/);
  assert.match(source, /completedAt: \{ not: null, gte: query\.historyStart \}/);
});
