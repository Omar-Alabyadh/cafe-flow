import { prisma } from "@/lib/prisma";
import { Prisma, StaffInviteStatus, SubscriptionStatus } from "@prisma/client";

type TxOrClient = Prisma.TransactionClient | typeof prisma;

export const USABLE_SUBSCRIPTION_STATES: SubscriptionStatus[] = [
  SubscriptionStatus.TRIALING,
  SubscriptionStatus.ACTIVE,
];

export type BusinessSubscriptionSnapshot = {
  subscriptionId: string;
  status: SubscriptionStatus;
  planCode: string;
  planNameAr: string;
  planNameEn: string;
  trialEndsAt: Date | null;
  branchLimit: number;
  staffLimit: number;
};

/** Structured guard failures so UI/server actions can translate with `next-intl` (no English literals in actions). */
export type SubscriptionGuardFailure =
  | { code: "NO_SUBSCRIPTION" }
  | { code: "SUBSCRIPTION_NOT_USABLE"; status: string };

export type BranchLimitResult =
  | { ok: true }
  | { ok: false; failure: SubscriptionGuardFailure | { code: "BRANCH_LIMIT"; limit: number } };

export type StaffLimitResult =
  | { ok: true }
  | { ok: false; failure: SubscriptionGuardFailure | { code: "STAFF_LIMIT"; limit: number } };

/**
 * Returns the latest non-archived subscription row for a business.
 * In this project stage we treat "latest row" as the current subscription snapshot.
 */
export async function getCurrentBusinessSubscription(
  businessId: string,
  db: TxOrClient = prisma,
): Promise<BusinessSubscriptionSnapshot | null> {
  const row = await db.subscription.findFirst({
    where: {
      businessId,
      archivedAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: { plan: true },
  });

  if (!row) {
    return null;
  }

  return {
    subscriptionId: row.id,
    status: row.status,
    planCode: row.plan.code,
    planNameAr: row.plan.nameAr,
    planNameEn: row.plan.nameEn,
    trialEndsAt: row.trialEndsAt ?? null,
    branchLimit: row.plan.branchLimit,
    staffLimit: row.plan.staffLimit,
  };
}

/**
 * Operational actions are allowed only when subscription status is usable.
 */
export async function assertBusinessOperationalAccess(
  businessId: string,
): Promise<
  { ok: true; subscription: BusinessSubscriptionSnapshot } | { ok: false; failure: SubscriptionGuardFailure }
> {
  const current = await getCurrentBusinessSubscription(businessId);
  if (!current) {
    return { ok: false, failure: { code: "NO_SUBSCRIPTION" } };
  }

  if (!USABLE_SUBSCRIPTION_STATES.includes(current.status)) {
    return {
      ok: false,
      failure: { code: "SUBSCRIPTION_NOT_USABLE", status: String(current.status) },
    };
  }

  return { ok: true, subscription: current };
}

/**
 * Simple limit check for creating branches.
 */
export async function assertBranchLimitForBusiness(businessId: string): Promise<BranchLimitResult> {
  const access = await assertBusinessOperationalAccess(businessId);
  if (!access.ok) {
    return access;
  }

  const currentBranches = await prisma.branch.count({
    where: { businessId, archivedAt: null },
  });

  if (currentBranches >= access.subscription.branchLimit) {
    return {
      ok: false,
      failure: { code: "BRANCH_LIMIT", limit: access.subscription.branchLimit },
    };
  }

  return { ok: true };
}

/**
 * Simple limit check for staff memberships (includes owner row for clarity).
 */
export async function assertStaffLimitForBusiness(businessId: string): Promise<StaffLimitResult> {
  const access = await assertBusinessOperationalAccess(businessId);
  if (!access.ok) {
    return access;
  }

  const currentMemberships = await prisma.membership.count({
    where: { businessId, archivedAt: null },
  });

  // Pending (non-expired) invites reserve a seat so owners cannot bypass plan limits via invitations.
  const pendingInvites = await prisma.staffInvite.count({
    where: {
      businessId,
      status: StaffInviteStatus.PENDING,
      expiresAt: { gt: new Date() },
    },
  });

  const used = currentMemberships + pendingInvites;

  if (used >= access.subscription.staffLimit) {
    return {
      ok: false,
      failure: { code: "STAFF_LIMIT", limit: access.subscription.staffLimit },
    };
  }

  return { ok: true };
}
