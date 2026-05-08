import { BusinessStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getActiveBusinessCookie } from "@/lib/tenant/active-business-cookie";

/**
 * Returns the current user's owned business, if any.
 *
 * Phase 4 assumes one primary business per owner: we take the first active
 * business where this user is `ownerId`. This keeps the mental model simple
 * for supervisors and avoids multi-business switching UI.
 */
export async function getOwnerBusinessForUser(userId: string) {
  return prisma.business.findFirst({
    where: {
      ownerId: userId,
      archivedAt: null,
      status: { not: BusinessStatus.ARCHIVED },
    },
    include: {
      branches: {
        where: { archivedAt: null },
        orderBy: { createdAt: "asc" },
      },
      memberships: {
        where: { archivedAt: null },
        include: { user: true },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
}

/**
 * Loads the same business row without heavy relations (for permission checks).
 */
export async function getOwnerBusinessIdForUser(userId: string) {
  const b = await prisma.business.findFirst({
    where: {
      ownerId: userId,
      archivedAt: null,
      status: { not: BusinessStatus.ARCHIVED },
    },
    select: { id: true },
  });
  return b?.id ?? null;
}

/**
 * Returns one active business id for current user.
 * Priority keeps current shell behavior:
 * owner business first, then first active membership business.
 */
export async function getPrimaryBusinessIdForUser(userId: string) {
  const owned = await getOwnerBusinessIdForUser(userId);
  if (owned) return owned;

  const selectedBusinessId = await getActiveBusinessCookie();
  let matchedSelected = false;
  if (selectedBusinessId) {
    const selected = await prisma.membership.findFirst({
      where: {
        userId,
        businessId: selectedBusinessId,
        archivedAt: null,
        isActive: true,
        business: {
          archivedAt: null,
          status: { not: BusinessStatus.ARCHIVED },
        },
      },
      select: { businessId: true },
    });
    if (selected) {
      matchedSelected = true;
      return selected.businessId;
    }
  }

  // Stale cookie: do not delete here — may run during RSC. Layout redirects to `/api/clear-active-business-cookie`.

  // Fallback if cookie is stale/outdated.
  const membership = await prisma.membership.findFirst({
    where: {
      userId,
      archivedAt: null,
      isActive: true,
      business: {
        archivedAt: null,
        status: { not: BusinessStatus.ARCHIVED },
      },
    },
    orderBy: { createdAt: "asc" },
    select: { businessId: true },
  });

  return membership?.businessId ?? null;
}

/**
 * Ensures the user owns this business id. Used before branch/staff mutations.
 * Returns null if the user is not the owner (caller should show an error).
 */
export async function assertUserOwnsBusiness(userId: string, businessId: string) {
  const row = await prisma.business.findFirst({
    where: {
      id: businessId,
      ownerId: userId,
      archivedAt: null,
      status: { not: BusinessStatus.ARCHIVED },
    },
    select: { id: true },
  });
  return row;
}
