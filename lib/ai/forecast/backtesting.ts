import { addDays } from "./date-utils";
import { normalizeDailyDemand } from "./history-gates";
import { calculateMetrics } from "./metrics";
import type { BacktestSummary, DailyDemandPoint, DateOnly } from "./types";

export type DemandForecaster = (history: DailyDemandPoint[], forecastDate: DateOnly) => number | null;

export function rollingOriginBacktest(input: {
  history: DailyDemandPoint[];
  forecaster: DemandForecaster;
  horizonDays: 1 | 7;
  minimumTrainingDays: number;
  maxFolds?: number;
}): BacktestSummary {
  const series = normalizeDailyDemand(input.history);
  if (!Number.isInteger(input.minimumTrainingDays) || input.minimumTrainingDays < 1) throw new Error("Minimum training days must be a positive integer.");
  const origins: number[] = [];
  for (let origin = input.minimumTrainingDays; origin + input.horizonDays <= series.length; origin += input.horizonDays) origins.push(origin);
  const selectedOrigins = origins.slice(-(input.maxFolds ?? 8));
  const actual: number[] = [];
  const predicted: number[] = [];
  let foldCount = 0;
  let stable = true;
  for (const origin of selectedOrigins) {
    const training = series.slice(0, origin);
    const evaluation = series.slice(origin, origin + input.horizonDays);
    const recursiveHistory = [...training];
    const foldPredictions: number[] = [];
    for (const point of evaluation) {
      const prediction = input.forecaster(recursiveHistory, point.date);
      if (prediction === null || !Number.isFinite(prediction) || prediction < 0) {
        stable = false;
        break;
      }
      foldPredictions.push(prediction);
      recursiveHistory.push({ date: point.date, quantity: prediction });
    }
    if (foldPredictions.length !== evaluation.length) continue;
    foldCount += 1;
    actual.push(...evaluation.map((point) => point.quantity));
    predicted.push(...foldPredictions);
  }
  const metrics = calculateMetrics(actual, predicted);
  return { foldCount, metrics, stable: stable && foldCount > 0 };
}

/** Predicts forward recursively and never inserts future actuals into history. */
export function forecastForward(history: DailyDemandPoint[], horizonDays: 1 | 7, forecaster: DemandForecaster): Array<{ date: DateOnly; quantity: number }> | null {
  const normalized = normalizeDailyDemand(history);
  if (!normalized.length) return null;
  const working = [...normalized];
  const output: Array<{ date: DateOnly; quantity: number }> = [];
  for (let index = 0; index < horizonDays; index += 1) {
    const date = addDays(working[working.length - 1].date, 1);
    const quantity = forecaster(working, date);
    if (quantity === null || !Number.isFinite(quantity) || quantity < 0) return null;
    output.push({ date, quantity });
    working.push({ date, quantity });
  }
  return output;
}
