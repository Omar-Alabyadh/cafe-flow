import { isoWeekday } from "../date-utils";
import type { DailyDemandPoint, DateOnly } from "../types";

/** Predicts a weekday from the most recent earlier matching weekday. */
export function seasonalNaiveForecast(history: DailyDemandPoint[], forecastDate: DateOnly): number | null {
  const targetWeekday = isoWeekday(forecastDate);
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (isoWeekday(history[index].date) === targetWeekday) return history[index].quantity;
  }
  return null;
}
