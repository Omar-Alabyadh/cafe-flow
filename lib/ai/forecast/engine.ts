import { addDays } from "./date-utils";
import { forecastForward } from "./backtesting";
import { assessHistory, normalizeDailyDemand } from "./history-gates";
import { classifyForecastQuality, evaluateForecastModels, forecasterFor, selectForecastModel } from "./model-selection";
import type { DailyDemandPoint, ForecastGeneration, ForecastInput, ForecastResult } from "./types";

function roundQuantity(value: number): number {
  if (!Number.isFinite(value)) throw new Error("Forecast values must be finite.");
  return Math.round(Math.max(0, value) * 100) / 100;
}

function validateInput(input: ForecastInput): void {
  if (!input.scopeReference.trim() || !input.productKey.trim()) throw new Error("A server-internal scope and product reference are required.");
  if (input.forecastMode === "REAL_PILOT" && input.dataSource !== "NATIVE_ONLY") throw new Error("REAL_PILOT accepts NATIVE_ONLY demand only.");
  if (input.forecastMode === "ACADEMIC_DEMO" && input.dataSource !== "DEMO_ONLY") throw new Error("ACADEMIC_DEMO accepts DEMO_ONLY demand only.");
  if (input.scopeType === "BRANCH" && !input.branchReference) throw new Error("Branch scope requires a branch reference.");
  for (const observation of input.observations) {
    if (observation.productKey !== input.productKey) throw new Error("Forecast input cannot mix products.");
    if (observation.scopeReference !== input.scopeReference) throw new Error("Forecast input cannot mix scopes.");
    if (observation.dataSource !== input.dataSource) throw new Error("Forecast input cannot mix data sources.");
    if (!Number.isFinite(observation.quantity) || observation.quantity < 0) throw new Error("Demand quantities must be finite and non-negative.");
    if (input.scopeType === "BRANCH" && observation.branchReference !== input.branchReference) throw new Error("Branch history must match the requested branch.");
  }
}

function insufficientResults(input: ForecastInput, history: DailyDemandPoint[], assessmentReason: string, generatedAt: string): ForecastResult[] {
  if (!history.length) return [];
  const endDate = history[history.length - 1].date;
  return Array.from({ length: input.horizonDays }, (_, index) => ({
    forecastMode: input.forecastMode,
    scopeType: input.scopeType,
    scopeReference: input.scopeReference,
    ...(input.branchReference ? { branchReference: input.branchReference } : {}),
    productKey: input.productKey,
    forecastDate: addDays(endDate, index + 1),
    predictedQuantity: null,
    lowerBound: null,
    upperBound: null,
    quality: "INSUFFICIENT_HISTORY" as const,
    modelFamily: "NONE" as const,
    trainingStartDate: history[0].date,
    trainingEndDate: endDate,
    observationCount: history.length,
    activeSalesDays: history.filter((point) => point.quantity > 0).length,
    generatedAt,
    reason: assessmentReason,
    dataSource: input.dataSource,
  }));
}

/**
 * Generates explainable quantity forecasts from trusted, financial-independent daily demand.
 * Invalid source/mode mixing fails closed; ordinary data insufficiency returns typed results.
 */
export function generateForecast(input: ForecastInput): ForecastGeneration {
  validateInput(input);
  const history = normalizeDailyDemand(input.observations.map((observation) => ({ date: observation.date, quantity: observation.quantity })));
  const trustedBranchHistory = input.scopeType !== "BRANCH" || (input.trustedBranchHistory === true && input.observations.every((observation) => observation.trustedBranch === true));
  const assessment = assessHistory({ history, horizonDays: input.horizonDays, scopeType: input.scopeType, trustedBranchHistory });
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(generatedAt))) throw new Error("generatedAt must be a valid ISO timestamp.");
  if (!assessment.eligible) return { assessment, evaluations: [], results: insufficientResults(input, history, assessment.reasons.join(" "), generatedAt) };

  const evaluations = evaluateForecastModels(history, assessment, input.horizonDays);
  const selection = selectForecastModel(evaluations);
  if (selection.modelFamily === "NONE" || !selection.evaluation) {
    return { assessment, evaluations, results: insufficientResults(input, history, selection.reason, generatedAt) };
  }
  const quality = classifyForecastQuality(assessment, selection.evaluation);
  if (quality === "INSUFFICIENT_HISTORY") {
    return { assessment, evaluations, results: insufficientResults(input, history, "No model reached the minimum quality rules.", generatedAt) };
  }
  const projected = forecastForward(history, input.horizonDays, forecasterFor(selection.modelFamily));
  if (!projected) return { assessment, evaluations, results: insufficientResults(input, history, "The selected model could not produce finite non-negative forecasts.", generatedAt) };
  const mae = selection.evaluation.backtest?.metrics.mae ?? 0;
  const interval = Math.max(1, mae * 1.96);
  const results = projected.map((point) => {
    const predictedQuantity = roundQuantity(point.quantity);
    const lowerBound = Math.min(predictedQuantity, roundQuantity(Math.max(0, point.quantity - interval)));
    const upperBound = Math.max(predictedQuantity, roundQuantity(point.quantity + interval));
    return {
      forecastMode: input.forecastMode,
      scopeType: input.scopeType,
      scopeReference: input.scopeReference,
      ...(input.branchReference ? { branchReference: input.branchReference } : {}),
      productKey: input.productKey,
      forecastDate: point.date,
      predictedQuantity,
      lowerBound,
      upperBound,
      quality,
      modelFamily: selection.modelFamily,
      trainingStartDate: assessment.trainingStartDate,
      trainingEndDate: assessment.trainingEndDate,
      observationCount: assessment.observationCount,
      activeSalesDays: assessment.activeSalesDays,
      generatedAt,
      reason: selection.reason,
      dataSource: input.dataSource,
    } satisfies ForecastResult;
  });
  return { assessment, evaluations, results };
}

export { evaluateForecastModels } from "./model-selection";
