import { addDays, normalizeDateOnly } from "../date-utils";
import { generateAcademicDemoDemand } from "../demo-data";
import { generateForecast } from "../engine";
import type { DemandObservation, ForecastGeneration, ModelEvaluation } from "../types";
import { createInMemoryForecastComputationGuard } from "./guard";
import type { AuthorizedBranch, ClientForecastDto, ClientForecastError, ClientForecastProduct, ForecastBusinessContext, ForecastClientResponse, ForecastComputationGuard, ForecastReadRepository, ForecastReadinessDto, ForecastRequest, NativeDemandRecord } from "./types";

export const FORECAST_LIMITS = { maxHistoryDays: 180, maxOrders: 5_000, maxProducts: 20, supportedHorizons: [1, 7] as const };

type ServiceDependencies = {
  getCurrentUserId: () => Promise<string | null>;
  getBusinessContext: (userId: string) => Promise<ForecastBusinessContext | null>;
  canAccessBranch: (member: ForecastBusinessContext["member"], branchId: string) => boolean;
  repository: ForecastReadRepository;
  guard?: ForecastComputationGuard;
  now?: () => Date;
};

type ProductDemandGroup = { internalProductId: string; label: string; observations: DemandObservation[]; trustedBranchHistory: boolean };

function error(code: ClientForecastError["code"], message: string): ClientForecastError {
  return { ok: false, code, message };
}

function isManagerOrOwner(context: ForecastBusinessContext): boolean {
  return context.member.role === "OWNER" || context.member.role === "MANAGER";
}

function isSupportedHorizon(value: number): value is 1 | 7 {
  return FORECAST_LIMITS.supportedHorizons.includes(value as 1 | 7);
}

function validRequest(request: ForecastRequest): ClientForecastError | null {
  if ("businessId" in (request as Record<string, unknown>)) return error("INVALID_INPUT", "Business scope is derived securely on the server.");
  if (!isSupportedHorizon(request.horizonDays)) return error("INVALID_INPUT", "Only one-day and seven-day horizons are supported.");
  if (request.scopeType === "BRANCH" && (!request.branchReference || !request.branchReference.trim())) return error("INVALID_SCOPE", "A valid authorized branch is required.");
  if (request.scopeType === "BUSINESS" && request.branchReference) return error("INVALID_SCOPE", "Business scope cannot include a branch selector.");
  if (request.productReference && !/^product-\d+$/.test(request.productReference)) return error("INVALID_INPUT", "Product selection is invalid.");
  return null;
}

function toUtcDay(value: Date): string | null {
  if (Number.isNaN(value.getTime())) return null;
  return value.toISOString().slice(0, 10);
}

function isEligibleNativeRecord(record: NativeDemandRecord, context: ForecastBusinessContext, scopeType: ForecastRequest["scopeType"], branchId?: string): boolean {
  if (record.status !== "COMPLETED" || record.financialDataOrigin !== "NATIVE" || !record.completedAt || !toUtcDay(record.completedAt)) return false;
  if (!record.product || record.product.businessId !== context.businessId || !record.product.isActive || record.product.archivedAt !== null) return false;
  if (!Number.isFinite(record.quantity) || record.quantity <= 0) return false;
  if (scopeType === "BRANCH") return record.branchId === branchId && record.branchDataOrigin === "NATIVE";
  return true;
}

function labelForProduct(record: NativeDemandRecord): string {
  return record.product?.displayLabel.trim() || "Product";
}

function buildRealGroups(records: NativeDemandRecord[], context: ForecastBusinessContext, request: ForecastRequest, branchId?: string): ProductDemandGroup[] {
  const grouped = new Map<string, ProductDemandGroup>();
  for (const record of records) {
    if (!isEligibleNativeRecord(record, context, request.scopeType, branchId) || !record.product) continue;
    const date = toUtcDay(record.completedAt!);
    if (!date) continue;
    const group = grouped.get(record.product.id) ?? { internalProductId: record.product.id, label: labelForProduct(record), observations: [], trustedBranchHistory: request.scopeType !== "BRANCH" };
    group.observations.push({ date, productKey: record.product.id, quantity: record.quantity, scopeReference: "active-business", ...(request.scopeType === "BRANCH" ? { branchReference: "active-branch", trustedBranch: true } : {}), dataSource: "NATIVE_ONLY" });
    grouped.set(record.product.id, group);
  }
  return [...grouped.values()].sort((left, right) => left.label < right.label ? -1 : left.label > right.label ? 1 : left.internalProductId < right.internalProductId ? -1 : 1).slice(0, FORECAST_LIMITS.maxProducts);
}

function buildDemoGroups(): ProductDemandGroup[] {
  const demo = generateAcademicDemoDemand();
  return demo.productKeys.map((productKey, index) => ({
    internalProductId: productKey,
    label: `Demo product ${index + 1}`,
    observations: demo.observations.filter((observation) => observation.productKey === productKey),
    trustedBranchHistory: false,
  }));
}

function chooseGroups(groups: ProductDemandGroup[], productReference?: string): Array<ProductDemandGroup & { productReference: string }> | null {
  const safeGroups = groups.map((group, index) => ({ ...group, productReference: `product-${index + 1}` }));
  if (!productReference) return safeGroups;
  const selected = safeGroups.find((group) => group.productReference === productReference);
  return selected ? [selected] : null;
}

function metricsFor(generation: ForecastGeneration): ClientForecastProduct["backtesting"] {
  const model = generation.results[0]?.modelFamily;
  const selected: ModelEvaluation | undefined = generation.evaluations.find((evaluation) => evaluation.modelFamily === model);
  if (!selected?.backtest) return null;
  return { foldCount: selected.backtest.foldCount, mae: selected.backtest.metrics.mae, wape: selected.backtest.metrics.wape, bias: selected.backtest.metrics.bias };
}

function mapProduct(group: ProductDemandGroup & { productReference: string }, request: ForecastRequest, generatedAt: string): ClientForecastProduct {
  const generation = generateForecast({
    forecastMode: request.forecastMode,
    dataSource: request.forecastMode === "REAL_PILOT" ? "NATIVE_ONLY" : "DEMO_ONLY",
    scopeType: request.scopeType,
    scopeReference: group.observations[0]?.scopeReference ?? "active-business",
    ...(request.scopeType === "BRANCH" ? { branchReference: "active-branch", trustedBranchHistory: group.trustedBranchHistory } : {}),
    productKey: group.internalProductId,
    observations: group.observations,
    horizonDays: request.horizonDays as 1 | 7,
    generatedAt,
  });
  return {
    productReference: group.productReference,
    productLabel: group.label,
    forecasts: generation.results.map((result) => ({
      forecastDate: result.forecastDate,
      predictedQuantity: result.predictedQuantity,
      lowerBound: result.lowerBound,
      upperBound: result.upperBound,
      quality: result.quality,
      modelFamily: result.modelFamily,
      trainingStartDate: result.trainingStartDate,
      trainingEndDate: result.trainingEndDate,
      observationCount: result.observationCount,
      activeSalesDays: result.activeSalesDays,
      generatedAt: result.generatedAt,
      reason: result.reason,
    })),
    backtesting: metricsFor(generation),
  };
}

function stateFor(products: ClientForecastProduct[]): "AVAILABLE" | "INSUFFICIENT_HISTORY" {
  return products.some((product) => product.forecasts.some((forecast) => forecast.quality !== "INSUFFICIENT_HISTORY")) ? "AVAILABLE" : "INSUFFICIENT_HISTORY";
}

function buildResponse(request: ForecastRequest, products: ClientForecastProduct[], branch?: AuthorizedBranch): ClientForecastDto {
  const isDemo = request.forecastMode === "ACADEMIC_DEMO";
  const state = stateFor(products);
  return {
    ok: true,
    state,
    forecastMode: request.forecastMode,
    dataSource: isDemo ? "DEMO_ONLY" : "NATIVE_ONLY",
    scopeType: request.scopeType,
    ...(branch ? { branchLabel: branch.displayLabel } : {}),
    demo: { isDemo, labelAr: isDemo ? "توقع تجريبي" : null, labelEn: isDemo ? "Demo Forecast" : null },
    products,
    reason: state === "INSUFFICIENT_HISTORY" ? "There is not enough trustworthy demand history for a reliable forecast." : null,
  };
}

function historyStart(now: Date): Date {
  const today = normalizeDateOnly(now.toISOString().slice(0, 10));
  return new Date(`${addDays(today, -(FORECAST_LIMITS.maxHistoryDays - 1))}T00:00:00.000Z`);
}

export function createForecastServerService(dependencies: ServiceDependencies) {
  const guard = dependencies.guard ?? createInMemoryForecastComputationGuard();
  const now = dependencies.now ?? (() => new Date());

  async function resolve(request: ForecastRequest): Promise<{ context: ForecastBusinessContext; branch?: AuthorizedBranch } | ClientForecastError> {
    const invalid = validRequest(request);
    if (invalid) return invalid;
    const userId = await dependencies.getCurrentUserId();
    if (!userId) return error("UNAUTHENTICATED", "Sign in is required to use forecasting.");
    let context: ForecastBusinessContext | null;
    try {
      context = await dependencies.getBusinessContext(userId);
    } catch {
      return error("FORBIDDEN", "An active business membership is required.");
    }
    if (!context) return error("FORBIDDEN", "An active business membership is required.");
    if (!isManagerOrOwner(context)) return error("FORBIDDEN", "Forecasting is currently available to Owners and Managers only.");
    if (request.forecastMode === "ACADEMIC_DEMO" && request.scopeType === "BRANCH") return error("INVALID_SCOPE", "Academic Demo supports business scope only.");
    if (request.scopeType !== "BRANCH") return { context };
    const branchId = request.branchReference!;
    if (!dependencies.canAccessBranch(context.member, branchId)) return error("FORBIDDEN", "The selected branch is not authorized.");
    const branch = await dependencies.repository.findAuthorizedBranch({ businessId: context.businessId, branchId });
    if (!branch) return error("INVALID_SCOPE", "The selected branch is not available in the active business.");
    return { context, branch };
  }

  async function generate(request: ForecastRequest): Promise<ForecastClientResponse> {
    const resolved = await resolve(request);
    if ("ok" in resolved) return resolved;
    const key = `${resolved.context.userId}:${resolved.context.businessId}:${request.forecastMode}:${request.scopeType}:${request.branchReference ?? "business"}:${request.horizonDays}:${request.productReference ?? "all"}`;
    if (!guard.tryAcquire(key)) return error("COMPUTATION_LIMIT", "Forecast generation is already in progress. Please try again shortly.");
    try {
      let groups: ProductDemandGroup[];
      if (request.forecastMode === "ACADEMIC_DEMO") {
        groups = buildDemoGroups();
      } else {
        const records = await dependencies.repository.readNativeDemand({ businessId: resolved.context.businessId, scopeType: request.scopeType, ...(request.scopeType === "BRANCH" ? { branchId: resolved.branch!.id } : {}), historyStart: historyStart(now()), maxOrders: FORECAST_LIMITS.maxOrders });
        groups = buildRealGroups(records, resolved.context, request, resolved.branch?.id);
      }
      const selected = chooseGroups(groups, request.productReference);
      if (!selected) return error("INVALID_INPUT", "The selected product is not eligible for this forecast.");
      if (!selected.length) return buildResponse(request, [], resolved.branch);
      const generatedAt = now().toISOString();
      return buildResponse(request, selected.map((group) => mapProduct(group, request, generatedAt)), resolved.branch);
    } catch {
      return error("INTERNAL_ERROR", "Forecast generation is temporarily unavailable.");
    } finally {
      guard.release(key);
    }
  }

  return {
    generateForecast: generate,
    generateRealPilotForecast: (request: Omit<ForecastRequest, "forecastMode">) => generate({ ...request, forecastMode: "REAL_PILOT" }),
    generateAcademicDemoForecast: (request: Omit<ForecastRequest, "forecastMode">) => generate({ ...request, forecastMode: "ACADEMIC_DEMO" }),
    async getForecastReadiness(request: ForecastRequest): Promise<ForecastReadinessDto> {
      const response = await generate(request);
      if (!response.ok) return response;
      return { ok: true, forecastMode: response.forecastMode, dataSource: response.dataSource, scopeType: response.scopeType, state: response.state, eligibleProductCount: response.products.length, demo: response.demo };
    },
  };
}

export { buildRealGroups, isEligibleNativeRecord };
