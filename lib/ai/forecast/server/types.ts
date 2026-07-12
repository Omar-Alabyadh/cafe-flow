import type { ForecastDataSource, ForecastMode, ForecastModelFamily, ForecastQuality } from "../types";

export type ForecastServerErrorCode = "UNAUTHENTICATED" | "FORBIDDEN" | "INVALID_SCOPE" | "INVALID_INPUT" | "INSUFFICIENT_HISTORY" | "COMPUTATION_LIMIT" | "INTERNAL_ERROR";
export type ForecastRequest = {
  forecastMode: ForecastMode;
  scopeType: "BUSINESS" | "BRANCH";
  branchReference?: string;
  horizonDays: number;
  productReference?: string;
};

export type ForecastMemberContext = {
  role: string;
  scope: string;
  branchId: string | null;
  grantedPermissions: string[];
  revokedPermissions: string[];
};

/** Internal-only context. Its identifiers must not be placed in the client DTO. */
export type ForecastBusinessContext = {
  userId: string;
  businessId: string;
  member: ForecastMemberContext;
};

export type AuthorizedBranch = { id: string; displayLabel: string };

/** Internal read-model values, intentionally excluding all financial fields and Payment data. */
export type NativeDemandRecord = {
  status: string;
  financialDataOrigin: string | null;
  branchDataOrigin: string | null;
  branchId: string | null;
  completedAt: Date | null;
  product: {
    id: string;
    businessId: string;
    displayLabel: string;
    isActive: boolean;
    archivedAt: Date | null;
  } | null;
  quantity: number;
};

export type NativeDemandQuery = {
  businessId: string;
  scopeType: "BUSINESS" | "BRANCH";
  branchId?: string;
  historyStart: Date;
  maxOrders: number;
};

export interface ForecastReadRepository {
  findAuthorizedBranch(input: { businessId: string; branchId: string }): Promise<AuthorizedBranch | null>;
  readNativeDemand(query: NativeDemandQuery): Promise<NativeDemandRecord[]>;
}

export interface ForecastComputationGuard {
  tryAcquire(key: string): boolean;
  release(key: string): void;
}

export type ClientBacktestingMetrics = { foldCount: number; mae: number | null; wape: number | null; bias: number | null };
export type ClientForecastPoint = {
  forecastDate: string;
  predictedQuantity: number | null;
  lowerBound: number | null;
  upperBound: number | null;
  quality: ForecastQuality;
  modelFamily: ForecastModelFamily;
  trainingStartDate: string | null;
  trainingEndDate: string | null;
  observationCount: number;
  activeSalesDays: number;
  generatedAt: string;
  reason: string;
};

export type ClientForecastProduct = {
  productReference: string;
  productLabel: string;
  forecasts: ClientForecastPoint[];
  backtesting: ClientBacktestingMetrics | null;
};

export type ClientForecastDto = {
  ok: true;
  state: "AVAILABLE" | "INSUFFICIENT_HISTORY";
  forecastMode: ForecastMode;
  dataSource: ForecastDataSource;
  scopeType: "BUSINESS" | "BRANCH";
  branchLabel?: string;
  demo: { isDemo: boolean; labelAr: string | null; labelEn: string | null };
  products: ClientForecastProduct[];
  reason: string | null;
};

export type ClientForecastError = { ok: false; code: ForecastServerErrorCode; message: string };
export type ForecastClientResponse = ClientForecastDto | ClientForecastError;

export type ForecastReadinessDto =
  | ClientForecastError
  | { ok: true; forecastMode: ForecastMode; dataSource: ForecastDataSource; scopeType: "BUSINESS" | "BRANCH"; state: "AVAILABLE" | "INSUFFICIENT_HISTORY"; eligibleProductCount: number; demo: ClientForecastDto["demo"] };
