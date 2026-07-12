import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createForecastUiAction } from "@/lib/ai/forecast/ui/action-core";
import type { ForecastClientResponse } from "@/lib/ai/forecast/server/types";

const success = (mode: "REAL_PILOT" | "ACADEMIC_DEMO"): ForecastClientResponse => ({
  ok: true,
  state: "INSUFFICIENT_HISTORY",
  forecastMode: mode,
  dataSource: mode === "REAL_PILOT" ? "NATIVE_ONLY" : "DEMO_ONLY",
  scopeType: "BUSINESS",
  demo: { isDemo: mode === "ACADEMIC_DEMO", labelAr: mode === "ACADEMIC_DEMO" ? "توقع تجريبي" : null, labelEn: mode === "ACADEMIC_DEMO" ? "Demo Forecast" : null },
  products: [],
  reason: "safe",
});

function actionHarness(overrides: Partial<{
  resolveBranchSelection: (reference: string) => Promise<{ ok: true; branchId: string } | { ok: false; response: ForecastClientResponse }>;
  real: (input: { scopeType: "BUSINESS" | "BRANCH"; horizonDays: 1 | 7; branchReference?: string }) => Promise<ForecastClientResponse>;
  demo: (input: { scopeType: "BUSINESS" | "BRANCH"; horizonDays: 1 | 7; branchReference?: string }) => Promise<ForecastClientResponse>;
}> = {}) {
  const calls: Array<{ mode: string; input: { scopeType: "BUSINESS" | "BRANCH"; horizonDays: 1 | 7; branchReference?: string } }> = [];
  return {
    calls,
    run: createForecastUiAction({
      resolveAuthorizedBranch: overrides.resolveBranchSelection ?? (async (reference) => ({ ok: true, branchId: `internal-${reference}` })),
      generateRealPilotForecast: overrides.real ?? (async (input) => { calls.push({ mode: "REAL", input }); return success("REAL_PILOT"); }),
      generateAcademicDemoForecast: overrides.demo ?? (async (input) => { calls.push({ mode: "DEMO", input }); return success("ACADEMIC_DEMO"); }),
    }),
  };
}

function source(path: string) {
  return readFileSync(path, "utf8");
}

function messages(locale: "ar" | "en") {
  return JSON.parse(source(`messages/${locale}.json`)).dashboard.business.forecast;
}

test("Arabic and English AI Forecast navigation labels exist without changing report navigation", () => {
  assert.equal(JSON.parse(source("messages/ar.json")).dashboard.sidebar.items.forecast, "التوقع الذكي");
  assert.equal(JSON.parse(source("messages/en.json")).dashboard.sidebar.items.forecast, "AI Forecast");
  const sidebar = source("components/ui/foundations/dashboard-sidebar.tsx");
  assert.match(sidebar, /\$\{biz\}\/reports/);
  assert.match(sidebar, /\$\{biz\}\/ai-forecast/);
});

test("the action accepts only the approved mode, scope, horizon, and safe branch selector", async () => {
  const { run, calls } = actionHarness();
  await run({ forecastMode: "REAL_PILOT", scopeType: "BRANCH", horizonDays: "1", branchSelection: "branch-1" });
  assert.deepEqual(calls, [{ mode: "REAL", input: { scopeType: "BRANCH", horizonDays: 1, branchReference: "internal-branch-1" } }]);
  assert.equal((await run({ forecastMode: "REAL_PILOT", scopeType: "BUSINESS", horizonDays: "2" })).response?.ok, false);
});

test("client business and user identifiers are rejected before an A4 call", async () => {
  const { run, calls } = actionHarness();
  const result = await run({ forecastMode: "REAL_PILOT", scopeType: "BUSINESS", horizonDays: "1", businessId: "private-business", userId: "private-user" } as never);
  assert.equal(result.response?.ok, false);
  assert.equal(calls.length, 0);
});

test("cross-tenant or unauthorized branch mapping fails safely", async () => {
  const { run } = actionHarness({ resolveBranchSelection: async () => ({ ok: false, response: { ok: false, code: "INVALID_SCOPE", message: "safe" } }) });
  const result = await run({ forecastMode: "REAL_PILOT", scopeType: "BRANCH", horizonDays: "1", branchSelection: "branch-2" });
  assert.deepEqual(result.response, { ok: false, code: "INVALID_SCOPE", message: "safe" });
});

test("real and Demo action flows cannot mix", async () => {
  const { run, calls } = actionHarness();
  await run({ forecastMode: "REAL_PILOT", scopeType: "BUSINESS", horizonDays: "7" });
  await run({ forecastMode: "ACADEMIC_DEMO", scopeType: "BUSINESS", horizonDays: "1" });
  assert.deepEqual(calls.map((call) => call.mode), ["REAL", "DEMO"]);
  const invalid = await run({ forecastMode: "ACADEMIC_DEMO", scopeType: "BRANCH", horizonDays: "1", branchSelection: "branch-1" });
  assert.equal(invalid.response?.ok, false);
});

test("Demo form owns exactly one enabled BUSINESS scope field while the visible selector is disabled", () => {
  const workspace = source("app/[locale]/(dashboard)/dashboard/business/ai-forecast/forecast-workspace.tsx");
  const scopeTypeNames = workspace.match(/name="scopeType"/g) ?? [];
  assert.equal(scopeTypeNames.length, 1);
  assert.match(workspace, /<input type="hidden" name="scopeType" value=\{scopeType\}/);
  assert.match(workspace, /<select value=\{scopeType\}/);
  assert.match(workspace, /disabled=\{pending \|\| mode === "ACADEMIC_DEMO"\}/);
  assert.doesNotMatch(workspace, /<select name="scopeType"/);
  assert.match(workspace, /setScopeType\("BUSINESS"\);\s*setBranchSelection\(""\);/);
});

test("ACADEMIC_DEMO BUSINESS submissions reach the Demo generator for one and seven days", async () => {
  const { run, calls } = actionHarness();
  const oneDay = await run({ forecastMode: "ACADEMIC_DEMO", scopeType: "BUSINESS", horizonDays: "1" });
  const sevenDays = await run({ forecastMode: "ACADEMIC_DEMO", scopeType: "BUSINESS", horizonDays: "7" });
  assert.equal(oneDay.response?.ok, true);
  assert.equal(sevenDays.response?.ok, true);
  assert.equal(oneDay.response?.ok && oneDay.response.dataSource, "DEMO_ONLY");
  assert.equal(sevenDays.response?.ok && sevenDays.response.dataSource, "DEMO_ONLY");
  assert.deepEqual(calls, [
    { mode: "DEMO", input: { scopeType: "BUSINESS", horizonDays: 1 } },
    { mode: "DEMO", input: { scopeType: "BUSINESS", horizonDays: 7 } },
  ]);
});

test("successful Demo submissions preserve one-day and seven-day control snapshots", async () => {
  const { run } = actionHarness();
  const oneDay = await run({ forecastMode: "ACADEMIC_DEMO", scopeType: "BUSINESS", horizonDays: "1" });
  const sevenDays = await run({ forecastMode: "ACADEMIC_DEMO", scopeType: "BUSINESS", horizonDays: "7" });
  assert.deepEqual(oneDay.submittedControls, { forecastMode: "ACADEMIC_DEMO", scopeType: "BUSINESS", horizonDays: "1" });
  assert.deepEqual(sevenDays.submittedControls, { forecastMode: "ACADEMIC_DEMO", scopeType: "BUSINESS", horizonDays: "7" });
});

test("successful Real Pilot submission preserves its selected seven-day horizon", async () => {
  const { run } = actionHarness();
  const result = await run({ forecastMode: "REAL_PILOT", scopeType: "BUSINESS", horizonDays: "7" });
  assert.deepEqual(result.submittedControls, { forecastMode: "REAL_PILOT", scopeType: "BUSINESS", horizonDays: "7" });
});

test("controlled form submission prevents native reset and dispatches the action transition", () => {
  const workspace = source("app/[locale]/(dashboard)/dashboard/business/ai-forecast/forecast-workspace.tsx");
  assert.match(workspace, /onSubmit=\{submitForecast\}/);
  assert.match(workspace, /onReset=\{\(event\) => event\.preventDefault\(\)\}/);
  assert.match(workspace, /event\.preventDefault\(\);\s*if \(pending\) return;\s*const formData = new FormData\(event\.currentTarget\);\s*startTransition\(\(\) => formAction\(formData\)\);/);
});

test("result horizon labels use the submitted snapshot in Arabic and English", () => {
  assert.equal(messages("en").controls.nextDay, "Next day");
  assert.equal(messages("en").controls.nextSevenDays, "Next 7 days");
  assert.equal(messages("ar").controls.nextDay, "اليوم التالي");
  assert.equal(messages("ar").controls.nextSevenDays, "الأيام السبعة التالية");
  const workspace = source("app/[locale]/(dashboard)/dashboard/business/ai-forecast/forecast-workspace.tsx");
  assert.match(workspace, /submittedControls\?\.horizonDays === "7" \? t\("controls\.nextSevenDays"\)/);
  assert.match(workspace, /submittedControls\?\.horizonDays === "1" \? t\("controls\.nextDay"\)/);
});

test("A4 authorization failures are forwarded as safe UI states for both modes", async () => {
  const forbidden: ForecastClientResponse = { ok: false, code: "FORBIDDEN", message: "safe" };
  const { run } = actionHarness({ real: async () => forbidden, demo: async () => forbidden });
  assert.equal((await run({ forecastMode: "REAL_PILOT", scopeType: "BUSINESS", horizonDays: "1" })).response?.ok, false);
  assert.equal((await run({ forecastMode: "ACADEMIC_DEMO", scopeType: "BUSINESS", horizonDays: "1" })).response?.ok, false);
});

test("Real Pilot and Demo translations explain their required limitations", () => {
  for (const locale of ["ar", "en"] as const) {
    const forecast = messages(locale);
    assert.ok(forecast.modes.real.title.includes(locale === "ar" ? "تجربة" : "Limited"));
    assert.match(forecast.modes.real.description, /LEGACY_UNKNOWN/);
    assert.ok(forecast.modes.demo.description.includes(locale === "ar" ? "اصطناعية" : "synthetic"));
  }
});

test("approved insufficient-history messages are localized and do not fabricate quantities", () => {
  assert.equal(messages("ar").insufficient.message, "لا توجد بيانات تاريخية كافية لإنشاء توقع موثوق");
  assert.equal(messages("en").insufficient.message, "There is not enough historical data to generate a reliable forecast.");
  const workspace = source("app/[locale]/(dashboard)/dashboard/business/ai-forecast/forecast-workspace.tsx");
  assert.match(workspace, /response\.state === "INSUFFICIENT_HISTORY"/);
  assert.match(workspace, /results\.unavailable/);
});

test("Demo banner is conditional on exact demo metadata", () => {
  const workspace = source("app/[locale]/(dashboard)/dashboard/business/ai-forecast/forecast-workspace.tsx");
  assert.match(workspace, /response\.demo\.isDemo \?/);
  assert.match(workspace, /demo\.banner/);
  assert.match(messages("en").demo.banner, /synthetic data/);
});

test("all quality labels and explainable model descriptions are localized", () => {
  for (const locale of ["ar", "en"] as const) {
    const forecast = messages(locale);
    for (const quality of ["HIGH", "MEDIUM", "LOW", "INSUFFICIENT_HISTORY"]) assert.ok(forecast.quality[quality].label);
    for (const model of ["SEASONAL_NAIVE", "MOVING_AVERAGE", "CROSTON"]) assert.ok(forecast.models[model].description);
    assert.ok(forecast.models.intro);
  }
});

test("metrics, finite values, and unavailable values are handled safely", () => {
  const workspace = source("app/[locale]/(dashboard)/dashboard/business/ai-forecast/forecast-workspace.tsx");
  assert.match(workspace, /Number\.isFinite/);
  assert.match(workspace, /metrics\.mae/);
  assert.match(workspace, /metrics\.wape/);
  assert.match(workspace, /metrics\.bias/);
  assert.match(workspace, /results\.unavailable/);
  assert.equal(workspace.includes("confidence"), false);
});

test("the Client Component has no Prisma, server-only, or financial field dependency", () => {
  const workspace = source("app/[locale]/(dashboard)/dashboard/business/ai-forecast/forecast-workspace.tsx");
  for (const forbidden of ["@prisma", "server-only", "Payment", "price", "revenue", "currency", "tax", "discount", "totalAmount"]) assert.equal(workspace.includes(forbidden), false);
});

test("safe references, not raw branch or business identifiers, are rendered by the UI", () => {
  const page = source("app/[locale]/(dashboard)/dashboard/business/ai-forecast/page.tsx");
  const workspace = source("app/[locale]/(dashboard)/dashboard/business/ai-forecast/forecast-workspace.tsx");
  assert.match(page, /reference: `branch-\$\{index \+ 1\}`/);
  assert.equal(workspace.includes("businessId"), false);
  assert.equal(workspace.includes("branchId"), false);
  assert.equal(workspace.includes("membershipId"), false);
  assert.equal(workspace.includes("orderId"), false);
  assert.equal(workspace.includes("paymentId"), false);
});

test("loading, initial, error, and result regions are accessible", () => {
  const workspace = source("app/[locale]/(dashboard)/dashboard/business/ai-forecast/forecast-workspace.tsx");
  assert.match(workspace, /aria-live="polite"/);
  assert.match(workspace, /role="alert"/);
  assert.match(workspace, /disabled=\{pending/);
  assert.match(workspace, /<fieldset disabled=\{pending\}/);
  assert.match(workspace, /<details/);
  assert.match(workspace, /<table/);
});

test("Arabic and English direction are inherited from the existing locale layout", () => {
  const layout = source("app/[locale]/layout.tsx");
  assert.match(layout, /getDirection\(locale\)/);
  assert.match(layout, /dir=\{direction\}/);
});

test("server boundary is read-only and contains no database write operation", () => {
  const actions = source("app/[locale]/(dashboard)/dashboard/business/ai-forecast/actions.ts");
  assert.match(actions, /"use server"/);
  assert.match(actions, /generateRealPilotForecast/);
  assert.match(actions, /generateAcademicDemoForecast/);
  assert.doesNotMatch(actions, /\.(create|update|upsert|delete|executeRaw)\s*\(/);
});

test("financial report and POS pages are untouched by A5", () => {
  const page = source("app/[locale]/(dashboard)/dashboard/business/ai-forecast/page.tsx");
  assert.equal(page.includes("financial"), false);
  assert.equal(page.includes("/pos"), false);
});
