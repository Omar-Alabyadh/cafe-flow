import { prisma } from "@/lib/prisma";
import { BusinessStatus, MembershipRole, PermissionScope } from "@prisma/client";
import { ROLE_SCOPE_DEFAULT } from "./permissions";
import { getActiveBusinessCookie } from "@/lib/tenant/active-business-cookie";

/**
 * Tenant isolation (SaaS): every server action and data loader must scope queries by `businessId` from this context
 * (or an equivalent verified id). Hiding menu items in the UI is never sufficient — forged requests must not cross tenants.
 */

export type CurrentBusinessMemberContext = {
  business: { id: string; nameAr: string; nameEn: string | null; ownerId: string };
  member: {
    id: string;
    userId: string;
    businessId: string;
    branchId: string | null;
    role: MembershipRole;
    scope: PermissionScope;
    grantedPermissions: string[];
    revokedPermissions: string[];
  };
};

export class BusinessContextSelectionError extends Error {
  code:
    | "ACTIVE_BUSINESS_REQUIRED"
    | "ACTIVE_BUSINESS_INVALID"
    | "NO_ACTIVE_MEMBERSHIP";

  constructor(code: BusinessContextSelectionError["code"], message: string) {
    super(message);
    this.name = "BusinessContextSelectionError";
    this.code = code;
  }
}

export function isBusinessContextSelectionError(error: unknown): error is BusinessContextSelectionError {
  return error instanceof BusinessContextSelectionError;
}

/**
 * Loads the current business + membership used for authorization checks.
 * Priority:
 * 1) owner business (keeps old app behavior compatible),
 * 2) first active membership business for non-owners.
 */
export async function getCurrentBusinessMemberContext(
  userId: string,
): Promise<CurrentBusinessMemberContext> {
  const ownerBusiness = await prisma.business.findFirst({
    where: { ownerId: userId, archivedAt: null, status: { not: BusinessStatus.ARCHIVED } },
    select: { id: true, nameAr: true, nameEn: true, ownerId: true },
  });

  if (ownerBusiness) {
    const ownerMembership = await prisma.membership.findFirst({
      where: {
        userId,
        businessId: ownerBusiness.id,
        archivedAt: null,
        isActive: true,
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        userId: true,
        businessId: true,
        branchId: true,
        role: true,
        scope: true,
        grantedPermissions: true,
        revokedPermissions: true,
      },
    });

    return {
      business: ownerBusiness,
      member: ownerMembership ?? {
        id: `owner-${ownerBusiness.id}`,
        userId,
        businessId: ownerBusiness.id,
        branchId: null,
        role: MembershipRole.OWNER,
        scope: ROLE_SCOPE_DEFAULT.OWNER,
        grantedPermissions: [],
        revokedPermissions: [],
      },
    };
  }

  const membershipCount = await prisma.membership.count({
    where: {
      userId,
      archivedAt: null,
      isActive: true,
      business: { archivedAt: null, status: { not: BusinessStatus.ARCHIVED } },
    },
  });

  const selectedBusinessId = await getActiveBusinessCookie();
  if (!selectedBusinessId && membershipCount > 0) {
    throw new BusinessContextSelectionError(
      "ACTIVE_BUSINESS_REQUIRED",
      "You must select the current business before opening the business dashboard.",
    );
  }

  if (!selectedBusinessId && membershipCount === 0) {
    throw new BusinessContextSelectionError("NO_ACTIVE_MEMBERSHIP", "There is no active membership linked to this account.");
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId,
      archivedAt: null,
      isActive: true,
      businessId: selectedBusinessId!,
      business: { archivedAt: null, status: { not: BusinessStatus.ARCHIVED } },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      userId: true,
      businessId: true,
      branchId: true,
      role: true,
      scope: true,
      grantedPermissions: true,
      revokedPermissions: true,
      business: { select: { id: true, nameAr: true, nameEn: true, ownerId: true } },
    },
  });

  if (!membership) {
    // Do not call `clearActiveBusinessCookie()` here: this runs during RSC (e.g. sidebar identity).
    // Stale cookies are cleared via GET `/api/clear-active-business-cookie` from `dashboard/layout.tsx`.
    throw new BusinessContextSelectionError(
      "ACTIVE_BUSINESS_INVALID",
      "Current business context is invalid or you no longer have access to it.",
    );
  }

  return {
    business: membership.business,
    member: {
      id: membership.id,
      userId: membership.userId,
      businessId: membership.businessId,
      branchId: membership.branchId,
      role: membership.role,
      scope: membership.scope ?? ROLE_SCOPE_DEFAULT[membership.role],
      grantedPermissions: membership.grantedPermissions ?? [],
      revokedPermissions: membership.revokedPermissions ?? [],
    },
  };
}
