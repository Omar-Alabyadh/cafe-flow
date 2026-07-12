import type { ForecastClientResponse } from "../server/types";

export type ForecastUiInput = {
  forecastMode: string;
  scopeType: string;
  horizonDays: string;
  branchSelection?: string;
};

export type ForecastUiActionState = { response: ForecastClientResponse | null };

type BranchResolution = { ok: true; branchId: string } | { ok: false; response: ForecastClientResponse };
type ForecastUiActionDependencies = {
  resolveAuthorizedBranch: (safeReference: string) => Promise<BranchResolution>;
  generateRealPilotForecast: (request: { scopeType: "BUSINESS" | "BRANCH"; horizonDays: 1 | 7; branchReference?: string }) => Promise<ForecastClientResponse>;
  generateAcademicDemoForecast: (request: { scopeType: "BUSINESS" | "BRANCH"; horizonDays: 1 | 7; branchReference?: string }) => Promise<ForecastClientResponse>;
};

function invalid(message: string): ForecastUiActionState {
  return { response: { ok: false, code: "INVALID_INPUT", message } };
}

/** Validates only small UI choices; all tenant authorization remains enforced again by A4. */
export function createForecastUiAction(dependencies: ForecastUiActionDependencies) {
  return async function runForecast(input: ForecastUiInput): Promise<ForecastUiActionState> {
    if ("businessId" in (input as Record<string, unknown>) || "userId" in (input as Record<string, unknown>)) {
      return invalid("Business and user scope are derived securely on the server.");
    }
    if (input.forecastMode !== "REAL_PILOT" && input.forecastMode !== "ACADEMIC_DEMO") return invalid("Forecast mode is invalid.");
    if (input.scopeType !== "BUSINESS" && input.scopeType !== "BRANCH") return invalid("Forecast scope is invalid.");
    if (input.horizonDays !== "1" && input.horizonDays !== "7") return invalid("Forecast horizon is invalid.");
    if (input.forecastMode === "ACADEMIC_DEMO" && input.scopeType === "BRANCH") {
      return { response: { ok: false, code: "INVALID_SCOPE", message: "Academic Demo supports business scope only." } };
    }
    let branchReference: string | undefined;
    if (input.scopeType === "BRANCH") {
      if (!input.branchSelection || !/^branch-\d+$/.test(input.branchSelection)) return invalid("Branch selection is invalid.");
      const branch = await dependencies.resolveAuthorizedBranch(input.branchSelection);
      if (!branch.ok) return { response: branch.response };
      branchReference = branch.branchId;
    }
    const request = { scopeType: input.scopeType as "BUSINESS" | "BRANCH", horizonDays: Number(input.horizonDays) as 1 | 7, ...(branchReference ? { branchReference } : {}) };
    const response = input.forecastMode === "REAL_PILOT"
      ? await dependencies.generateRealPilotForecast(request)
      : await dependencies.generateAcademicDemoForecast(request);
    return { response };
  };
}
