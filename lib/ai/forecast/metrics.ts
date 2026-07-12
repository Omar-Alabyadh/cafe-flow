import type { ForecastMetrics } from "./types";

function assertComparable(actual: number[], predicted: number[]) {
  if (actual.length !== predicted.length) throw new Error("Actual and predicted arrays must have the same length.");
  if (actual.some((value) => !Number.isFinite(value)) || predicted.some((value) => !Number.isFinite(value))) {
    throw new Error("Metrics require finite values.");
  }
}

export function calculateMetrics(actual: number[], predicted: number[]): ForecastMetrics {
  assertComparable(actual, predicted);
  if (!actual.length) return { mae: null, wape: null, bias: null, sampleCount: 0 };
  const absoluteError = actual.reduce((sum, value, index) => sum + Math.abs(predicted[index] - value), 0);
  const signedError = actual.reduce((sum, value, index) => sum + (predicted[index] - value), 0);
  const actualTotal = actual.reduce((sum, value) => sum + value, 0);
  return {
    mae: absoluteError / actual.length,
    wape: actualTotal === 0 ? null : absoluteError / actualTotal,
    bias: actualTotal === 0 ? null : signedError / actualTotal,
    sampleCount: actual.length,
  };
}
