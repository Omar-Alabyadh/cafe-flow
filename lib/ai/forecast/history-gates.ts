import { addDays, daysBetween, enumerateDates, isoWeekKey, isoWeekday, normalizeDateOnly } from "./date-utils";
import type { DailyDemandPoint, DateOnly, ForecastScopeType, HistoryAssessment } from "./types";

export const HISTORY_GATES = {
  daily: { calendarDays: 56, activeSalesDays: 28, observations: 50, activeWeeks: 8 },
  sevenDay: { calendarDays: 84, activeSalesDays: 42, observations: 84, activeWeeks: 12 },
  croston: { calendarDays: 84, nonZeroPeriods: 20 },
  minimumBacktestFolds: 4,
} as const;

export function normalizeDailyDemand(points: DailyDemandPoint[]): DailyDemandPoint[] {
  if (!points.length) return [];
  const quantities = new Map<DateOnly, number>();
  for (const point of points) {
    const date = normalizeDateOnly(point.date);
    if (!Number.isFinite(point.quantity) || point.quantity < 0) throw new Error("Demand quantities must be finite and non-negative.");
    quantities.set(date, (quantities.get(date) ?? 0) + point.quantity);
  }
  const dates = [...quantities.keys()].sort();
  return enumerateDates(dates[0], dates[dates.length - 1]).map((date) => ({ date, quantity: quantities.get(date) ?? 0 }));
}

export function hasWeekdayRepetitions(history: DailyDemandPoint[], forecastStart: DateOnly, horizonDays: 1 | 7): boolean {
  const counts = new Map<number, number>();
  for (const point of history) counts.set(isoWeekday(point.date), (counts.get(isoWeekday(point.date)) ?? 0) + 1);
  return Array.from({ length: horizonDays }, (_, index) => isoWeekday(addDays(forecastStart, index))).every((weekday) => (counts.get(weekday) ?? 0) >= 3);
}

export function isIntermittentDemand(history: DailyDemandPoint[]): boolean {
  if (!history.length) return false;
  return history.filter((point) => point.quantity > 0).length / history.length <= 0.5;
}

export function isStableDenseDemand(history: DailyDemandPoint[]): boolean {
  if (!history.length) return false;
  const active = history.filter((point) => point.quantity > 0).length;
  if (active / history.length < 0.5) return false;
  const mean = history.reduce((sum, point) => sum + point.quantity, 0) / history.length;
  if (mean === 0) return false;
  const variance = history.reduce((sum, point) => sum + (point.quantity - mean) ** 2, 0) / history.length;
  return Math.sqrt(variance) / mean <= 1.5;
}

export function assessHistory(input: {
  history: DailyDemandPoint[];
  horizonDays: 1 | 7;
  scopeType: ForecastScopeType;
  trustedBranchHistory?: boolean;
}): HistoryAssessment {
  const history = normalizeDailyDemand(input.history);
  if (!history.length) {
    return { eligible: false, reasons: ["No daily demand observations are available."], trainingStartDate: null, trainingEndDate: null, observationCount: 0, activeSalesDays: 0, calendarDays: 0, activeWeeks: 0, nonZeroPeriods: 0, weekdayRepetitionsSufficient: false };
  }
  const trainingStartDate = history[0].date;
  const trainingEndDate = history[history.length - 1].date;
  const forecastStart = addDays(trainingEndDate, 1);
  const calendarDays = daysBetween(trainingStartDate, trainingEndDate) + 1;
  const activeSalesDays = history.filter((point) => point.quantity > 0).length;
  const activeWeeks = new Set(history.filter((point) => point.quantity > 0).map((point) => isoWeekKey(point.date))).size;
  const weekdayRepetitionsSufficient = hasWeekdayRepetitions(history, forecastStart, input.horizonDays);
  const nonZeroPeriods = activeSalesDays;
  const gate = input.horizonDays === 7 ? HISTORY_GATES.sevenDay : HISTORY_GATES.daily;
  const reasons: string[] = [];
  if (history.length < gate.observations) reasons.push(`Requires at least ${gate.observations} daily observations.`);
  if (calendarDays < gate.calendarDays) reasons.push(`Requires at least ${gate.calendarDays} calendar days of coverage.`);
  if (activeSalesDays < gate.activeSalesDays) reasons.push(`Requires at least ${gate.activeSalesDays} active sales days.`);
  if (activeWeeks < gate.activeWeeks) reasons.push(`Requires at least ${gate.activeWeeks} active sales weeks.`);
  if (!weekdayRepetitionsSufficient) reasons.push("Requires at least three historical observations for each forecast weekday.");
  if (input.scopeType === "BRANCH" && !input.trustedBranchHistory) reasons.push("Branch forecasting requires trusted branch history.");
  if (input.horizonDays === 7 && calendarDays < HISTORY_GATES.sevenDay.calendarDays) reasons.push("Seven-day forecasting requires the extended history gate.");
  return { eligible: reasons.length === 0, reasons, trainingStartDate, trainingEndDate, observationCount: history.length, activeSalesDays, calendarDays, activeWeeks, nonZeroPeriods, weekdayRepetitionsSufficient };
}
