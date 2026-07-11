"use server";

import { getCurrentUserId } from "@/lib/auth/session";
import { hasPermission } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext } from "@/lib/authorization/context";
import { reconcileLegacyOrder } from "@/lib/finance/legacy-reconciliation";
import { revalidatePath } from "next/cache";

export type ReconciliationState = { error: string | null; success: string | null };
export const initialReconciliationState: ReconciliationState = { error: null, success: null };

export async function submitLegacyReconciliation(_previous: ReconciliationState, formData: FormData): Promise<ReconciliationState> {
  const locale = String(formData.get("locale") ?? "ar").replace(/[^\w-]/g, "") || "ar";
  const userId = await getCurrentUserId();
  if (!userId) return { error: "RECONCILIATION_UNAUTHORIZED", success: null };
  const context = await getCurrentBusinessMemberContext(userId);
  if (!hasPermission(context.member, "financial.legacy.reconcile")) return { error: "RECONCILIATION_UNAUTHORIZED", success: null };
  if (formData.get("confirmImmutable") !== "true") return { error: "RECONCILIATION_CONFIRMATION_REQUIRED", success: null };
  const orderId = String(formData.get("orderId") ?? "");
  const priceEntries = Array.from(formData.entries()).flatMap(([key, value]) => key.startsWith("price:") && typeof value === "string" ? [{ orderItemId: key.slice(6), unitPrice: value }] : []);
  try {
    const result = await reconcileLegacyOrder({
      orderId, branchId: String(formData.get("branchId") ?? ""), receiverUserId: String(formData.get("receiverUserId") ?? ""),
      method: String(formData.get("method") ?? "") as never, paidAt: new Date(String(formData.get("paidAt") ?? "")),
      evidenceDescription: String(formData.get("evidenceDescription") ?? ""), reason: String(formData.get("reason") ?? ""),
      reference: String(formData.get("reference") ?? "") || null, linePrices: priceEntries,
    }, { businessId: context.business.id, userId });
    revalidatePath(`/${locale}/dashboard/business/legacy-reconciliation`, "page");
    return { error: null, success: result.replayed ? "RECONCILIATION_ALREADY_COMPLETED" : "RECONCILIATION_SUCCESS" };
  } catch (error) {
    const code = error instanceof Error ? error.message : "RECONCILIATION_FAILED";
    return { error: code.startsWith("RECONCILIATION_") ? code : "RECONCILIATION_FAILED", success: null };
  }
}
