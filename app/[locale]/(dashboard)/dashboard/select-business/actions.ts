"use server";

import { getCurrentUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { setActiveBusinessCookie } from "@/lib/tenant/active-business-cookie";
import { BusinessStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDefaultRouteByRole } from "@/lib/authorization/role-access";

/**
 * Saves the operator-selected business context for users with multiple memberships.
 * This avoids ambiguous routing while keeping tenant checks server-side.
 */
export async function selectDashboardBusiness(formData: FormData) {
  const userId = await getCurrentUserId();
  const locale = String(formData.get("locale") ?? "ar");
  const businessId = String(formData.get("businessId") ?? "").trim();

  if (!userId || !businessId) {
    redirect(`/${locale}/dashboard/select-business`);
  }

  const allowed = await prisma.membership.findFirst({
    where: {
      userId,
      businessId,
      archivedAt: null,
      isActive: true,
      business: { archivedAt: null, status: { not: BusinessStatus.ARCHIVED } },
    },
    select: { businessId: true, role: true },
  });

  if (!allowed) {
    redirect(`/${locale}/dashboard/select-business`);
  }

  await setActiveBusinessCookie(businessId);
  /**
   * Switching the active tenant must drop any cached dashboard segments tied to the previous business,
   * otherwise KPIs and tables can briefly show stale numbers until a hard reload.
   */
  revalidatePath(`/${locale}/dashboard`, "layout");
  revalidatePath(`/${locale}/dashboard/business`, "layout");
  redirect(`/${locale}${getDefaultRouteByRole(allowed.role)}`);
}
