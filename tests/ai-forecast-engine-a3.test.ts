import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { rollingOriginBacktest } from "@/lib/ai/forecast/backtesting";
import { addDays, isoWeekday, normalizeDateOnly } from "@/lib/ai/forecast/date-utils";
import { generateAcademicDemoDemand } from "@/lib/ai/forecast/demo-data";
import { generateForecast } from "@/lib/ai/forecast/engine";
import { assessHistory } from "@/lib/ai/forecast/history-gates";
import { calculateMetrics } from "@/lib/ai/forecast/metrics";
import { crostonForecast } from "@/lib/ai/forecast/models/croston";
import { movingAverageForecast } from "@/lib/ai/forecast/models/moving-average";
import { seasonalNaiveForecast } from "@/lib/ai/forecast/models/seasonal-naive";
import type { DailyDemandPoint, DemandObservation, ForecastInput } from "@/lib/ai/forecast/types";

const generatedAt = "2026-05-01T00:00:00.000Z";

function dailySeries(days: number, quantity: (index: number) => number, start = "2026-01-01"): DailyDemandPoint[] {
  return Array.from({ length: days }, (_, index) => ({ date: addDays(start, index), quantity: quantity(index) }));
}

function observationsFrom(series: DailyDemandPoint[], source: "NATIVE_ONLY" | "DEMO_ONLY" = "DEMO_ONLY", options: Partial<DemandObservation> = {}): DemandObservation[] {
  return series.map((point) => ({ date: point.date, productKey: "demo-product-test", quantity: point.quantity, scopeReference: "academic-demo-scope", dataSource: source, ...options }));
}

function inputFrom(observations: DemandObservation[], overrides: Partial<ForecastInput> = {}): ForecastInput {
  return {
    forecastMode: "ACADEMIC_DEMO",
    dataSource: "DEMO_ONLY",
    scopeType: "BUSINESS",
    scopeReference: "academic-demo-scope",
    productKey: "demo-product-test",
    observations,
    horizonDays: 1,
    generatedAt,
    ...overrides,
  };
}

test("seasonal naive uses the latest matching weekday", () => {
  const history = dailySeries(14, (index) => index + 1);
  assert.equal(seasonalNaiveForecast(history, addDays(history[13].date, 1)), 8);
});

test("moving average computes the configured trailing mean", () => {
  assert.equal(movingAverageForecast(dailySeries(7, (index) => index + 1)), 4);
  assert.equal(movingAverageForecast(dailySeries(6, () => 1)), null);
});

test("Croston produces a finite intermittent-demand estimate", () => {
  const history = [0, 5, 0, 0, 5].map((quantity, index) => ({ date: addDays("2026-01-01", index), quantity }));
  assert.ok(Math.abs((crostonForecast(history) ?? 0) - (5 / 2.1)) < 0.000001);
});

test("engine forecasts and uncertainty bounds are finite, non-negative, and ordered", () => {
  const demo = generateAcademicDemoDemand();
  const output = generateForecast(inputFrom(demo.observations.filter((item) => item.productKey === "demo-product-1"), { productKey: "demo-product-1" }));
  assert.ok(output.results.length === 1);
  const result = output.results[0];
  assert.ok(Number.isFinite(result.predictedQuantity ?? NaN));
  assert.ok((result.lowerBound ?? -1) >= 0);
  assert.ok((result.lowerBound ?? Infinity) <= (result.predictedQuantity ?? -Infinity));
  assert.ok((result.predictedQuantity ?? Infinity) <= (result.upperBound ?? -Infinity));
});

test("rolling-origin folds pass only preceding observations to the forecaster", () => {
  const series = dailySeries(64, (index) => index % 7);
  const seenTrainingEnds: string[] = [];
  rollingOriginBacktest({
    history: series,
    horizonDays: 1,
    minimumTrainingDays: 56,
    forecaster: (training) => {
      seenTrainingEnds.push(training[training.length - 1].date);
      return training[training.length - 1].quantity;
    },
  });
  assert.ok(seenTrainingEnds.every((date) => date < "2026-03-05"));
  assert.ok(seenTrainingEnds.every((date, index) => index === 0 || date >= seenTrainingEnds[index - 1]));
});

test("MAE, WAPE, and bias are calculated correctly", () => {
  const metrics = calculateMetrics([2, 4], [1, 6]);
  assert.equal(metrics.mae, 1.5);
  assert.equal(metrics.wape, 0.5);
  assert.equal(metrics.bias, 1 / 6);
});

test("WAPE and bias remain safe for all-zero actual demand", () => {
  const metrics = calculateMetrics([0, 0], [1, 0]);
  assert.equal(metrics.mae, 0.5);
  assert.equal(metrics.wape, null);
  assert.equal(metrics.bias, null);
});

test("minimum fold enforcement rejects a too-short backtest", () => {
  const result = rollingOriginBacktest({ history: dailySeries(58, () => 2), horizonDays: 1, minimumTrainingDays: 56, forecaster: () => 2 });
  assert.equal(result.foldCount, 2);
  assert.ok(result.foldCount < 4);
});

test("ordinary insufficient history returns typed insufficient results", () => {
  const output = generateForecast(inputFrom(observationsFrom(dailySeries(10, () => 2))));
  assert.equal(output.results[0].quality, "INSUFFICIENT_HISTORY");
  assert.equal(output.results[0].predictedQuantity, null);
  assert.equal(output.results[0].modelFamily, "NONE");
});

test("branch forecasting without trusted history is rejected safely", () => {
  const observations = observationsFrom(dailySeries(90, () => 3), "DEMO_ONLY", { branchReference: "demo-branch", trustedBranch: false });
  const output = generateForecast(inputFrom(observations, { scopeType: "BRANCH", branchReference: "demo-branch", trustedBranchHistory: false }));
  assert.equal(output.results[0].quality, "INSUFFICIENT_HISTORY");
  assert.match(output.results[0].reason, /trusted branch history/);
});

test("seven-day forecasts use the extended history gate", () => {
  const output = generateForecast(inputFrom(observationsFrom(dailySeries(70, () => 3)), { horizonDays: 7 }));
  assert.equal(output.results.length, 7);
  assert.equal(output.results[0].quality, "INSUFFICIENT_HISTORY");
  assert.match(output.results[0].reason, /84/);
});

test("model selection remains deterministic for the same input", () => {
  const demo = generateAcademicDemoDemand();
  const request = inputFrom(demo.observations.filter((item) => item.productKey === "demo-product-1"), { productKey: "demo-product-1" });
  assert.deepEqual(generateForecast(request), generateForecast(request));
});

test("academic demo generation is deterministic", () => {
  assert.deepEqual(generateAcademicDemoDemand(), generateAcademicDemoDemand());
});

test("academic demo contains exactly 120 explicit calendar days", () => {
  const demo = generateAcademicDemoDemand();
  assert.equal(demo.calendarDays, 120);
  assert.equal(new Set(demo.observations.map((item) => item.date)).size, 120);
  assert.equal(demo.observations.length, 120 * demo.productKeys.length);
});

test("demo stable product has positive weekday-pattern demand", () => {
  const stable = generateAcademicDemoDemand().observations.filter((item) => item.productKey === "demo-product-1");
  assert.ok(stable.every((item) => item.quantity > 0));
  const weekdayMean = stable.filter((item) => [1, 2, 3, 4, 5].includes(isoWeekday(item.date))).reduce((sum, item) => sum + item.quantity, 0) / stable.filter((item) => [1, 2, 3, 4, 5].includes(isoWeekday(item.date))).length;
  const weekend = stable.filter((item) => ![1, 2, 3, 4, 5].includes(isoWeekday(item.date)));
  assert.ok(weekdayMean > weekend.reduce((sum, item) => sum + item.quantity, 0) / weekend.length);
});

test("demo intermittent product contains many zero-demand days", () => {
  const intermittent = generateAcademicDemoDemand().observations.filter((item) => item.productKey === "demo-product-2");
  assert.ok(intermittent.filter((item) => item.quantity === 0).length > intermittent.length / 2);
  assert.ok(intermittent.some((item) => item.quantity > 0));
});

test("demo trend product grows across the generated window", () => {
  const trend = generateAcademicDemoDemand().observations.filter((item) => item.productKey === "demo-product-3");
  const first = trend.slice(0, 30).reduce((sum, item) => sum + item.quantity, 0) / 30;
  const last = trend.slice(-30).reduce((sum, item) => sum + item.quantity, 0) / 30;
  assert.ok(last > first);
});

test("demo outliers are controlled and documented", () => {
  const demo = generateAcademicDemoDemand();
  assert.equal(demo.outliers.length, 3);
  for (const outlier of demo.outliers) {
    const observation = demo.observations.find((item) => item.productKey === outlier.productKey && item.date === outlier.date);
    assert.ok(observation && observation.quantity >= outlier.additionalQuantity);
  }
});

test("demo quantities are non-negative integers and demo-only", () => {
  const demo = generateAcademicDemoDemand();
  assert.equal(demo.forecastMode, "ACADEMIC_DEMO");
  assert.equal(demo.dataSource, "DEMO_ONLY");
  assert.ok(demo.observations.every((item) => Number.isInteger(item.quantity) && item.quantity >= 0 && item.dataSource === "DEMO_ONLY"));
});

test("forecast contracts do not contain financial fields", () => {
  const observation = generateAcademicDemoDemand().observations[0] as Record<string, unknown>;
  const result = generateForecast(inputFrom([observation as unknown as DemandObservation], { productKey: String(observation.productKey) })).results[0] as Record<string, unknown>;
  for (const field of ["price", "subtotal", "total", "currency", "discount", "tax", "payment", "revenue"]) {
    assert.equal(field in observation, false);
    assert.equal(field in result, false);
  }
});

test("forecasting core has no database or Prisma dependency", () => {
  const source = ["types.ts", "date-utils.ts", "history-gates.ts", "backtesting.ts", "model-selection.ts", "engine.ts", "demo-data.ts"].map((file) => readFileSync(`lib/ai/forecast/${file}`, "utf8")).join("\n");
  assert.equal(source.includes("@prisma"), false);
  assert.equal(source.includes("PrismaClient"), false);
});

test("date-only handling is timezone-safe and rejects malformed dates", () => {
  assert.equal(addDays("2026-03-29", 1), "2026-03-30");
  assert.equal(normalizeDateOnly("2024-02-29"), "2024-02-29");
  assert.throws(() => normalizeDateOnly("2026-02-30"));
  assert.throws(() => normalizeDateOnly("2026-1-2"));
});

test("REAL_PILOT and ACADEMIC_DEMO cannot use the wrong mode/source pairing", () => {
  const observations = observationsFrom(dailySeries(60, () => 2), "NATIVE_ONLY");
  assert.throws(() => generateForecast(inputFrom(observations, { forecastMode: "ACADEMIC_DEMO", dataSource: "NATIVE_ONLY" })), /ACADEMIC_DEMO/);
  assert.throws(() => generateForecast(inputFrom(observations, { forecastMode: "REAL_PILOT", dataSource: "DEMO_ONLY" })), /REAL_PILOT/);
});

test("NATIVE_ONLY and DEMO_ONLY observations cannot be mixed", () => {
  const observations = observationsFrom(dailySeries(60, () => 2));
  observations[0] = { ...observations[0], dataSource: "NATIVE_ONLY" };
  assert.throws(() => generateForecast(inputFrom(observations)), /cannot mix data sources/);
});

test("history assessment reports insufficient weekday repetition and non-zero history", () => {
  const assessment = assessHistory({ history: dailySeries(20, (index) => index === 0 ? 1 : 0), horizonDays: 1, scopeType: "BUSINESS" });
  assert.equal(assessment.weekdayRepetitionsSufficient, false);
  assert.equal(assessment.nonZeroPeriods, 1);
  assert.equal(assessment.eligible, false);
});
