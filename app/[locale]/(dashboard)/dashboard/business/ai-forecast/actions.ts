"use server";

import { getCurrentUserId } from "@/lib/auth/session";
import { canAccessBranch } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { generateAcademicDemoForecast, generateRealPilotForecast } from "@/lib/ai/forecast/server/forecast-server";
import { createForecastUiAction, type ForecastUiActionState } from "@/lib/ai/forecast/ui/action-core";
import { prisma } from "@/lib/prisma";

function safeFailure(code: "UNAUTHENTICATED" | "FORBIDDEN" | "INVALID_SCOPE" | "INTERNAL_ERROR", message: string): ForecastUiActionState {
  return { response: { ok: false, code, message }, submittedControls: null };
}

const runForecast = createForecastUiAction({
  async resolveAuthorizedBranch(safeReference) {
    const userId = await getCurrentUserId();
    if (!userId) return { ok: false, response: safeFailure("UNAUTHENTICATED", "Sign in is required to use forecasting.").response! };
    let context;
    try {
      context = await getCurrentBusinessMemberContext(userId);
    } catch (error) {
      if (isBusinessContextSelectionError(error)) return { ok: false, response: safeFailure("FORBIDDEN", "An active business membership is required.").response! };
      return { ok: false, response: safeFailure("INTERNAL_ERROR", "Forecast generation is temporarily unavailable.").response! };
    }
    const branches = await prisma.branch.findMany({
      where: { businessId: context.business.id, archivedAt: null, isActive: true },
      select: { id: true },
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    const index = Number(safeReference.slice("branch-".length)) - 1;
    const branch = Number.isInteger(index) ? branches[index] : null;
    if (!branch || !canAccessBranch(context.member, branch.id)) {
      return { ok: false, response: safeFailure("INVALID_SCOPE", "The selected branch is not available in the active business.").response! };
    }
    return { ok: true, branchId: branch.id };
  },
  generateRealPilotForecast,
  generateAcademicDemoForecast,
});

/** Minimal authenticated boundary for the A5 Client Component. It accepts no tenant identity. */
export async function requestForecast(
  _previous: ForecastUiActionState,
  formData: FormData,
): Promise<ForecastUiActionState> {
  try {
    return await runForecast({
      forecastMode: String(formData.get("forecastMode") ?? ""),
      scopeType: String(formData.get("scopeType") ?? ""),
      horizonDays: String(formData.get("horizonDays") ?? ""),
      branchSelection: String(formData.get("branchSelection") ?? ""),
    });
  } catch {
    return safeFailure("INTERNAL_ERROR", "Forecast generation is temporarily unavailable.");
  }
}

export type { ForecastUiActionState } from "@/lib/ai/forecast/ui/action-core";
