import type { DailyDemandPoint } from "../types";

export function movingAverageForecast(history: DailyDemandPoint[], window = 7): number | null {
  if (!Number.isInteger(window) || window < 1) throw new Error("Moving-average window must be a positive integer.");
  if (history.length < window) return null;
  const values = history.slice(-window).map((point) => point.quantity);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
