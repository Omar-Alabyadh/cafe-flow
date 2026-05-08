import "server-only";

import { prisma } from "@/lib/prisma";
import { BusinessStatus } from "@prisma/client";
import { getActiveBusinessCookie } from "@/lib/tenant/active-business-cookie";

/**
 * Detects `cafeflow_active_business_id` cookie that no longer matches an active membership
 * (e.g. removed from business, archived membership). Cookie **must not** be cleared during
 * Server Component render — only from a Route Handler or Server Action (Next.js 16+).
 *
 * When this returns a path, the dashboard layout redirects there; the route handler clears
 * the cookie then redirects to `next` (usually select-business).
 */
export async function getStaleActiveBusinessCookieRedirectPath(
  userId: string,
  locale: string,
): Promise<string | null> {
  const ownerBusiness = await prisma.business.findFirst({
    where: { ownerId: userId, archivedAt: null, status: { not: BusinessStatus.ARCHIVED } },
    select: { id: true },
  });
  if (ownerBusiness) {
    return null;
  }

  const selectedBusinessId = await getActiveBusinessCookie();
  if (!selectedBusinessId) {
    return null;
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId,
      archivedAt: null,
      isActive: true,
      businessId: selectedBusinessId,
      business: { archivedAt: null, status: { not: BusinessStatus.ARCHIVED } },
    },
    select: { id: true },
  });
  if (membership) {
    return null;
  }

  const encLocale = encodeURIComponent(locale);
  const nextPath = `/${locale}/dashboard/select-business`;
  const encNext = encodeURIComponent(nextPath);
  return `/api/clear-active-business-cookie?locale=${encLocale}&next=${encNext}`;
}
