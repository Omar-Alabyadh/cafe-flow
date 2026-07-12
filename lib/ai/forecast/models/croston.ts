import type { DailyDemandPoint } from "../types";

/** Classic Croston ratio estimate for intermittent non-negative demand. */
export function crostonForecast(history: DailyDemandPoint[], alpha = 0.1): number | null {
  if (!(alpha > 0 && alpha <= 1)) throw new Error("Croston alpha must be within (0, 1].");
  let demandEstimate: number | null = null;
  let intervalEstimate: number | null = null;
  let periodsSinceDemand = 0;
  for (const point of history) {
    periodsSinceDemand += 1;
    if (point.quantity <= 0) continue;
    if (demandEstimate === null || intervalEstimate === null) {
      demandEstimate = point.quantity;
      intervalEstimate = periodsSinceDemand;
    } else {
      demandEstimate += alpha * (point.quantity - demandEstimate);
      intervalEstimate += alpha * (periodsSinceDemand - intervalEstimate);
    }
    periodsSinceDemand = 0;
  }
  if (demandEstimate === null || intervalEstimate === null || intervalEstimate <= 0) return null;
  return demandEstimate / intervalEstimate;
}
