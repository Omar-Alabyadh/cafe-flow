import { prisma } from "@/lib/prisma";
import { isPlatformOperator } from "@/lib/platform/require-platform-operator";
import { BusinessStatus, MembershipRole } from "@prisma/client";
import { getDefaultRouteByRole } from "@/lib/authorization/role-access";

export type PostSignInRouteResolution =
  | { kind: "platform"; destination: string }
  | { kind: "owner-business"; destination: string }
  | { kind: "staff-single-membership"; destination: string }
  | { kind: "staff-multi-membership"; destination: string }
  | { kind: "owner-no-business"; destination: string }
  | { kind: "no-business-no-membership"; destination: string };

/**
 * Product-critical dashboard entry routing.
 * We separate owner/staff/platform states so staff users never fall into owner onboarding by mistake.
 */
export async function resolvePostSignInDestination(
  userId: string,
  locale: string,
  preferredBusinessId?: string | null,
): Promise<PostSignInRouteResolution> {
  const [platform, ownedBusiness, memberships] = await Promise.all([
    isPlatformOperator(userId),
    prisma.business.findFirst({
      where: {
        ownerId: userId,
        archivedAt: null,
        status: { not: BusinessStatus.ARCHIVED },
      },
      select: { id: true },
    }),
    prisma.membership.findMany({
      where: {
        userId,
        archivedAt: null,
        isActive: true,
        business: { archivedAt: null, status: { not: BusinessStatus.ARCHIVED } },
      },
      select: { businessId: true, role: true },
      distinct: ["businessId"],
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (platform) {
    return { kind: "platform", destination: `/${locale}/dashboard/platform` };
  }

  if (ownedBusiness) {
    return { kind: "owner-business", destination: `/${locale}${getDefaultRouteByRole(MembershipRole.OWNER)}` };
  }

  if (memberships.length === 1) {
    const roleLanding = getDefaultRouteByRole(memberships[0].role);
    return { kind: "staff-single-membership", destination: `/${locale}${roleLanding}` };
  }

  if (memberships.length > 1) {
    const hasPreferred = preferredBusinessId
      ? memberships.some((m) => m.businessId === preferredBusinessId)
      : false;
    if (hasPreferred) {
      const preferredMembership = memberships.find((m) => m.businessId === preferredBusinessId) ?? memberships[0];
      return { kind: "staff-single-membership", destination: `/${locale}${getDefaultRouteByRole(preferredMembership.role)}` };
    }
    return { kind: "staff-multi-membership", destination: `/${locale}/dashboard/select-business` };
  }

  const hasOwnerMembershipWithoutBusiness = memberships.some((m) => m.role === MembershipRole.OWNER);
  if (!hasOwnerMembershipWithoutBusiness) {
    return { kind: "owner-no-business", destination: `/${locale}/dashboard/business` };
  }

  return { kind: "no-business-no-membership", destination: `/${locale}/dashboard` };
}

export function sanitizeInternalCallback(callbackUrl: string, fallback: string): string {
  const raw = callbackUrl.trim();
  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }
  return raw;
}
