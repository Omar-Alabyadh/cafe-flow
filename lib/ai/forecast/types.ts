/** Server-safe, financial-independent contracts for daily product demand forecasting. */
export type ForecastMode = "REAL_PILOT" | "ACADEMIC_DEMO";
export type ForecastDataSource = "NATIVE_ONLY" | "DEMO_ONLY";
export type ForecastScopeType = "BUSINESS" | "BRANCH";
export type ForecastQuality = "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT_HISTORY";
export type ForecastModelFamily = "SEASONAL_NAIVE" | "MOVING_AVERAGE" | "CROSTON" | "NONE";
export type DateOnly = string;

/** A trusted daily quantity. It deliberately has no financial or database fields. */
export type DemandObservation = {
  date: DateOnly;
  productKey: string;
  quantity: number;
  scopeReference: string;
  branchReference?: string;
  trustedBranch?: boolean;
  dataSource: ForecastDataSource;
};

export type ForecastInput = {
  forecastMode: ForecastMode;
  dataSource: ForecastDataSource;
  scopeType: ForecastScopeType;
  scopeReference: string;
  branchReference?: string;
  trustedBranchHistory?: boolean;
  productKey: string;
  observations: DemandObservation[];
  horizonDays: 1 | 7;
  generatedAt?: string;
};

export type DailyDemandPoint = { date: DateOnly; quantity: number };

export type ForecastMetrics = {
  mae: number | null;
  wape: number | null;
  bias: number | null;
  sampleCount: number;
};

export type BacktestSummary = {
  foldCount: number;
  metrics: ForecastMetrics;
  stable: boolean;
};

export type ModelEvaluation = {
  modelFamily: Exclude<ForecastModelFamily, "NONE">;
  eligible: boolean;
  passed: boolean;
  reason: string;
  backtest: BacktestSummary | null;
};

export type HistoryAssessment = {
  eligible: boolean;
  reasons: string[];
  trainingStartDate: DateOnly | null;
  trainingEndDate: DateOnly | null;
  observationCount: number;
  activeSalesDays: number;
  calendarDays: number;
  activeWeeks: number;
  nonZeroPeriods: number;
  weekdayRepetitionsSufficient: boolean;
};

export type ForecastResult = {
  forecastMode: ForecastMode;
  scopeType: ForecastScopeType;
  scopeReference: string;
  branchReference?: string;
  productKey: string;
  forecastDate: DateOnly;
  predictedQuantity: number | null;
  lowerBound: number | null;
  upperBound: number | null;
  quality: ForecastQuality;
  modelFamily: ForecastModelFamily;
  trainingStartDate: DateOnly | null;
  trainingEndDate: DateOnly | null;
  observationCount: number;
  activeSalesDays: number;
  generatedAt: string;
  reason: string;
  dataSource: ForecastDataSource;
};

export type ForecastGeneration = {
  assessment: HistoryAssessment;
  evaluations: ModelEvaluation[];
  results: ForecastResult[];
};
