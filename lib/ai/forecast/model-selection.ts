import { rollingOriginBacktest, type DemandForecaster } from "./backtesting";
import { HISTORY_GATES, isIntermittentDemand, isStableDenseDemand } from "./history-gates";
import { crostonForecast } from "./models/croston";
import { movingAverageForecast } from "./models/moving-average";
import { seasonalNaiveForecast } from "./models/seasonal-naive";
import type { DailyDemandPoint, ForecastModelFamily, ForecastQuality, HistoryAssessment, ModelEvaluation } from "./types";

const FORECASTERS: Record<Exclude<ForecastModelFamily, "NONE">, DemandForecaster> = {
  SEASONAL_NAIVE: seasonalNaiveForecast,
  MOVING_AVERAGE: (history) => movingAverageForecast(history),
  CROSTON: (history) => crostonForecast(history),
};

export type ModelSelection = { modelFamily: Exclude<ForecastModelFamily, "NONE">; reason: string; evaluation: ModelEvaluation } | { modelFamily: "NONE"; reason: string; evaluation: null };

function passesBacktest(evaluation: ModelEvaluation): boolean {
  const backtest = evaluation.backtest;
  return Boolean(backtest && backtest.stable && backtest.foldCount >= HISTORY_GATES.minimumBacktestFolds && backtest.metrics.wape !== null && backtest.metrics.wape <= 0.5 && backtest.metrics.bias !== null && Math.abs(backtest.metrics.bias) <= 0.25);
}

function evaluateCandidate(modelFamily: Exclude<ForecastModelFamily, "NONE">, eligible: boolean, reason: string, history: DailyDemandPoint[], horizonDays: 1 | 7): ModelEvaluation {
  if (!eligible) return { modelFamily, eligible: false, passed: false, reason, backtest: null };
  const minimumTrainingDays = horizonDays === 7 ? HISTORY_GATES.sevenDay.calendarDays : HISTORY_GATES.daily.calendarDays;
  const backtest = rollingOriginBacktest({ history, forecaster: FORECASTERS[modelFamily], horizonDays, minimumTrainingDays, maxFolds: 8 });
  const provisional: ModelEvaluation = { modelFamily, eligible: true, passed: false, reason, backtest };
  return { ...provisional, passed: passesBacktest(provisional), reason: passesBacktest(provisional) ? `${reason} Backtest passed the fold, WAPE, and bias rules.` : `${reason} Backtest did not pass the fold, WAPE, or bias rules.` };
}

export function evaluateForecastModels(history: DailyDemandPoint[], assessment: HistoryAssessment, horizonDays: 1 | 7): ModelEvaluation[] {
  if (!assessment.eligible) return [];
  const seasonal = evaluateCandidate("SEASONAL_NAIVE", assessment.weekdayRepetitionsSufficient, "Seasonal naive has sufficient weekday repetition.", history, horizonDays);
  const moving = evaluateCandidate("MOVING_AVERAGE", isStableDenseDemand(history), "Moving average requires stable dense demand.", history, horizonDays);
  const crostonEligible = isIntermittentDemand(history) && assessment.calendarDays >= HISTORY_GATES.croston.calendarDays && assessment.nonZeroPeriods >= HISTORY_GATES.croston.nonZeroPeriods;
  const croston = evaluateCandidate("CROSTON", crostonEligible, "Croston requires sufficiently long intermittent demand.", history, horizonDays);
  return [seasonal, moving, croston];
}

export function selectForecastModel(evaluations: ModelEvaluation[]): ModelSelection {
  const baseline = evaluations.find((evaluation) => evaluation.modelFamily === "SEASONAL_NAIVE");
  if (!baseline?.passed || baseline.backtest?.metrics.wape === null || baseline.backtest?.metrics.wape === undefined) return { modelFamily: "NONE", reason: "No approved seasonal-naive baseline passed backtesting.", evaluation: null };
  let selected = baseline;
  for (const candidate of evaluations) {
    if (candidate.modelFamily === "SEASONAL_NAIVE" || !candidate.passed || candidate.backtest?.metrics.wape === null || candidate.backtest?.metrics.wape === undefined || candidate.backtest.metrics.mae === null || baseline.backtest.metrics.mae === null) continue;
    const improvesWape = candidate.backtest.metrics.wape <= baseline.backtest.metrics.wape * 0.95;
    const noWorseMae = candidate.backtest.metrics.mae <= baseline.backtest.metrics.mae;
    if (improvesWape && noWorseMae) selected = candidate;
  }
  if (selected === baseline) return { modelFamily: baseline.modelFamily, reason: "Seasonal naive remained the approved baseline after rolling-origin comparison.", evaluation: baseline };
  return { modelFamily: selected.modelFamily, reason: `${selected.modelFamily} improved WAPE by at least 5% without worsening MAE.`, evaluation: selected };
}

export function classifyForecastQuality(assessment: HistoryAssessment, evaluation: ModelEvaluation | null): ForecastQuality {
  const backtest = evaluation?.backtest;
  if (!assessment.eligible || !evaluation?.passed || !backtest || backtest.metrics.wape === null || backtest.metrics.bias === null) return "INSUFFICIENT_HISTORY";
  const absoluteBias = Math.abs(backtest.metrics.bias);
  if (backtest.foldCount >= 8 && backtest.metrics.wape <= 0.25 && absoluteBias <= 0.1) return "HIGH";
  if (backtest.foldCount >= 6 && backtest.metrics.wape <= 0.35 && absoluteBias <= 0.15) return "MEDIUM";
  if (backtest.foldCount >= 4 && backtest.metrics.wape <= 0.5 && absoluteBias <= 0.25) return "LOW";
  return "INSUFFICIENT_HISTORY";
}

export function forecasterFor(modelFamily: Exclude<ForecastModelFamily, "NONE">): DemandForecaster {
  return FORECASTERS[modelFamily];
}
