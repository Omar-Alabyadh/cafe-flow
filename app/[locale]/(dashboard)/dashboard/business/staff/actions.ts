"use server";

import { getCurrentUserId } from "@/lib/auth/session";
import { canManageUsers, getRoleBasePermissions, getRoleDefaultScope } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import {
  PERMISSION_TEMPLATES,
  isBusinessStaffAssignableRole,
  type PermissionKey,
  type PermissionTemplateKey,
  isPermissionKey,
  isPermissionTemplateKey,
} from "@/lib/authorization/permissions";
import {
  getServerActionTranslator,
  normalizeServerActionLocale,
  translateStaffLimitCheck,
  type ServerActionTranslator,
} from "@/lib/i18n/server-action-translator";
import { assertStaffLimitForBusiness } from "@/lib/subscription/business-subscription";
import { prisma } from "@/lib/prisma";
import { generateStaffInviteRawToken, hashStaffInviteToken } from "@/lib/staff/invite-token";
import { createUniquePublicInviteLabel } from "@/lib/staff/public-invite-label";
import { validateStaffRolePermissionSafety } from "@/lib/staff/staff-role-permission-safety";
import { revalidateStaffManagementPages } from "@/lib/cache/revalidate-tenant-ui";
import { MembershipRole, PermissionScope, StaffInviteStatus } from "@prisma/client";
import { headers } from "next/headers";
type StaffManagementContextResult =
  | { context: NonNullable<Awaited<ReturnType<typeof getCurrentBusinessMemberContext>>>; error?: never }
  | { error: string; context?: never };


export type AddStaffState = { error: string | null };
export type SaveStaffState = {
  error: string | null;
  success?: boolean;
  completedAt?: number;
  successKind?: "membership_linked" | "updated";
  successMessage?: string | null;
};

export type CreateStaffInviteState = {
  error: string | null;
  inviteUrl?: string | null;
  shareText?: string | null;
  /** Temporary owner-facing handle — not the employee login. */
  publicInviteLabel?: string | null;
  completedAt?: number;
};

export type ResendStaffInviteState = {
  error: string | null;
  inviteUrl?: string | null;
  shareText?: string | null;
  publicInviteLabel?: string | null;
  completedAt?: number;
};

/**
 * Business staff UI must never assign platform or legal ownership roles:
 * - SUPER_ADMIN is a platform-level concept (env-gated operator email), not a row you grant from tenant UI.
 * - OWNER is Business.ownerId; co-owner is not supported in V1 — do not create second OWNER memberships from here.
 *
 * Page guards alone are insufficient: every mutation must re-validate (forged POST / invite acceptance).
 */

function cleanOverrides(grantedRaw: string[], revokedRaw: string[]) {
  const granted = [...new Set(grantedRaw.filter(isPermissionKey))];
  const revoked = [...new Set(revokedRaw.filter(isPermissionKey).filter((p) => !granted.includes(p)))];
  return { granted, revoked };
}

function toOverridesFromEnabled(role: MembershipRole, enabled: PermissionKey[]) {
  const base = getRoleBasePermissions(role);
  const granted = enabled.filter((p) => !base.has(p));
  const revoked = [...base].filter((p) => !enabled.includes(p));
  return { granted, revoked };
}

function applyTemplateOverrides(
  role: MembershipRole,
  template: PermissionTemplateKey,
  current: { granted: PermissionKey[]; revoked: PermissionKey[] },
) {
  if (template === "CUSTOM") return current;
  if (template === "DEFAULT") return { granted: [], revoked: [] };
  const enabled = PERMISSION_TEMPLATES[template];
  return toOverridesFromEnabled(role, enabled);
}

/**
 * String-key map keeps labels compatible even if local `prisma generate` lags the schema on disk
 * (Windows file locks on the query engine should be resolved, then regenerate).
 */
/**
 * Human-readable role label for invite share text, resolved from `serverActions.staff.roles.*`
 * so English UI owners still get English role names in the generated message.
 */
function membershipRoleLabel(role: MembershipRole, t: ServerActionTranslator): string {
  switch (role) {
    case MembershipRole.MANAGER:
      return t("staff.roles.MANAGER");
    case MembershipRole.ACCOUNTANT:
      return t("staff.roles.ACCOUNTANT");
    case MembershipRole.CASHIER:
      return t("staff.roles.CASHIER");
    case MembershipRole.BARISTA:
      return t("staff.roles.BARISTA");
    case MembershipRole.WAITER:
      return t("staff.roles.WAITER");
    case MembershipRole.KITCHEN_STAFF:
      return t("staff.roles.KITCHEN_STAFF");
    case MembershipRole.INVENTORY_MANAGER:
      return t("staff.roles.INVENTORY_MANAGER");
    case MembershipRole.JUICE_STAFF:
      return t("staff.roles.JUICE_STAFF");
    case MembershipRole.PURCHASING_MANAGER:
      return t("staff.roles.PURCHASING_MANAGER");
    default:
      return t("staff.roles.fallback", { role: String(role) });
  }
}

async function resolvePublicBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "";
}

const STAFF_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function assertStaffManagementContext(
  userId: string,
  t: ServerActionTranslator,
): Promise<StaffManagementContextResult> {
  let context;
  try {
    context = await getCurrentBusinessMemberContext(userId);
  } catch (error) {
    if (isBusinessContextSelectionError(error)) {
      return { error: t("staff.selectBusinessFirst") };
    }
    throw error;
  }
  if (!canManageUsers(context.member)) return { error: t("staff.cannotManageUsers") };
  return { context };
}

export async function addStaffMembership(_prev: AddStaffState, formData: FormData): Promise<AddStaffState> {
  const userId = await getCurrentUserId();
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  if (!userId) return { error: t("staff.mustSignIn") };
  return saveStaffMembership({ error: null }, formData);
}

/**
 * Save membership (create/update) while preserving existing ownership and role restrictions.
 */
export async function saveStaffMembership(
  _prev: SaveStaffState,
  formData: FormData,
): Promise<SaveStaffState> {
  const userId = await getCurrentUserId();
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  if (!userId) {
    return { error: t("staff.mustSignIn") };
  }

  const authz = await assertStaffManagementContext(userId, t);
  if (authz.error) return { error: authz.error };
  const context = authz.context;
  if (!context) return { error: t("staff.noWorkspaceContext") };
  const businessId = context.business.id;

  const membershipIdRaw = String(formData.get("membershipId") ?? "").trim();
  const membershipId = membershipIdRaw.length > 0 ? membershipIdRaw : null;
  const roleRaw = String(formData.get("role") ?? "");
  const role = roleRaw as MembershipRole;
  const scopeRaw = String(formData.get("scope") ?? "");
  const scope = (Object.values(PermissionScope) as string[]).includes(scopeRaw)
    ? (scopeRaw as PermissionScope)
    : getRoleDefaultScope(role);
  const templateRaw = String(formData.get("permissionTemplate") ?? "CUSTOM");
  const template: PermissionTemplateKey = isPermissionTemplateKey(templateRaw) ? templateRaw : "CUSTOM";
  const branchRaw = String(formData.get("branchId") ?? "").trim();
  let branchId = branchRaw.length > 0 ? branchRaw : null;
  const rawOverrides = cleanOverrides(
    formData.getAll("grantedPermissions").map((value) => String(value)),
    formData.getAll("revokedPermissions").map((value) => String(value)),
  );
  const overrideSets = applyTemplateOverrides(role, template, rawOverrides);

  if (role === MembershipRole.SUPER_ADMIN || role === MembershipRole.OWNER) {
    return {
      error: t("staff.cannotAssignOwnerRoles"),
    };
  }
  if (!isBusinessStaffAssignableRole(role)) {
    return { error: t("staff.roleNotAssignable") };
  }
  // Defense in depth: POST requests bypass the browser UI, so repeat permission checks here (same as platform vs business boundary).
  const actorMayAssignRolesAndOverrides = getRoleBasePermissions(context.member.role).has("users.assign_roles");
  if (!actorMayAssignRolesAndOverrides) {
    return { error: t("staff.cannotAssignPermissionOverrides") };
  }

  if (scope === PermissionScope.BRANCH_ONLY) {
    if (!branchId) return { error: t("staff.branchRequiredForScope") };
  } else {
    branchId = null;
  }

  if (branchId) {
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, businessId, archivedAt: null },
      select: { id: true },
    });
    if (!branch) {
      return { error: t("staff.branchNotFound") };
    }
  }

  const safety = validateStaffRolePermissionSafety(role, overrideSets.granted, overrideSets.revoked);
  if (safety) {
    return { error: t("staff.permissionSafety", { permissions: safety.violated.join(" ") }) };
  }

  const actor = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, email: true },
  });

  if (membershipId) {
    const existingMembership = await prisma.membership.findFirst({
      where: { id: membershipId, businessId, archivedAt: null },
      include: { business: { select: { ownerId: true } } },
    });
    if (!existingMembership) {
      return { error: t("staff.membershipNotFound") };
    }
    if (existingMembership.role === MembershipRole.OWNER && existingMembership.userId === existingMembership.business.ownerId) {
      return { error: t("staff.cannotEditPrimaryOwner") };
    }

    const duplicate = await prisma.membership.findFirst({
      where: {
        id: { not: membershipId },
        userId: existingMembership.userId,
        businessId,
        branchId,
        archivedAt: null,
      },
      select: { id: true },
    });
    if (duplicate) {
      return { error: t("staff.duplicateMembershipSameScope") };
    }
    const beforeSnapshot = {
      role: existingMembership.role,
      scope: existingMembership.scope,
      branchId: existingMembership.branchId,
      grantedPermissions: existingMembership.grantedPermissions,
      revokedPermissions: existingMembership.revokedPermissions,
    };

    await prisma.membership.update({
      where: { id: membershipId },
      data: {
        role,
        scope,
        branchId,
        grantedPermissions: overrideSets.granted,
        revokedPermissions: overrideSets.revoked,
      },
    });
    const afterSnapshot = {
      role,
      scope,
      branchId,
      grantedPermissions: overrideSets.granted,
      revokedPermissions: overrideSets.revoked,
      template,
    };
    await prisma.auditLog.create({
      data: {
        actorUserId: actor?.id ?? null,
        businessId,
        branchId,
        action: "authorization.membership.update",
        entityType: "Membership",
        entityId: membershipId,
        beforeSnapshot: JSON.stringify({
          actorName: actor?.fullName ?? actor?.email ?? "unknown",
          ...beforeSnapshot,
        }),
        afterSnapshot: JSON.stringify(afterSnapshot),
      },
    });
    revalidateStaffManagementPages(locale);
    return {
      error: null,
      success: true,
      completedAt: Date.now(),
      successKind: "updated",
      successMessage: t("staff.membershipUpdated"),
    };
  }

  // New members are onboarded via `createStaffInvite` (invite link); this action only updates existing rows.
  return {
    error: t("staff.newMembersViaInviteOnly"),
  };
}

/**
 * Creates a pending invite and returns the raw URL once. Staff limits count pending non-expired invites.
 * Re-checks RBAC and role-safety on the server because POST bodies can be forged.
 */
export async function createStaffInvite(
  _prev: CreateStaffInviteState,
  formData: FormData,
): Promise<CreateStaffInviteState> {
  const userId = await getCurrentUserId();
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  if (!userId) {
    return { error: t("staff.mustSignIn") };
  }

  const authz = await assertStaffManagementContext(userId, t);
  if (authz.error) return { error: authz.error };
  const context = authz.context;
  if (!context) return { error: t("staff.noWorkspaceContext") };
  const businessId = context.business.id;

  const roleRaw = String(formData.get("role") ?? "");
  const role = roleRaw as MembershipRole;
  const scopeRaw = String(formData.get("scope") ?? "");
  const scope = (Object.values(PermissionScope) as string[]).includes(scopeRaw)
    ? (scopeRaw as PermissionScope)
    : getRoleDefaultScope(role);
  const templateRaw = String(formData.get("permissionTemplate") ?? "CUSTOM");
  const template: PermissionTemplateKey = isPermissionTemplateKey(templateRaw) ? templateRaw : "CUSTOM";
  const branchRaw = String(formData.get("branchId") ?? "").trim();
  let branchId = branchRaw.length > 0 ? branchRaw : null;
  const rawOverrides = cleanOverrides(
    formData.getAll("grantedPermissions").map((value) => String(value)),
    formData.getAll("revokedPermissions").map((value) => String(value)),
  );
  const overrideSets = applyTemplateOverrides(role, template, rawOverrides);
  const noteRaw = String(formData.get("note") ?? "").trim();
  const note = noteRaw.length > 0 ? noteRaw.slice(0, 2000) : null;

  if (role === MembershipRole.SUPER_ADMIN || role === MembershipRole.OWNER) {
    return {
      error: t("staff.cannotAssignOwnerRoles"),
    };
  }
  if (!isBusinessStaffAssignableRole(role)) {
    return { error: t("staff.roleNotAssignable") };
  }

  const actorMayAssignRolesAndOverrides = getRoleBasePermissions(context.member.role).has("users.assign_roles");
  if (!actorMayAssignRolesAndOverrides) {
    return { error: t("staff.cannotAssignPermissionOverrides") };
  }

  if (scope === PermissionScope.BRANCH_ONLY) {
    if (!branchId) return { error: t("staff.branchRequiredForScope") };
  } else {
    branchId = null;
  }

  if (branchId) {
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, businessId, archivedAt: null },
      select: { id: true },
    });
    if (!branch) {
      return { error: t("staff.branchNotFound") };
    }
  }

  const safety = validateStaffRolePermissionSafety(role, overrideSets.granted, overrideSets.revoked);
  if (safety) {
    return { error: t("staff.permissionSafety", { permissions: safety.violated.join(" ") }) };
  }

  const contactEmailRaw = String(formData.get("contactEmail") ?? "").trim().toLowerCase();
  const contactEmail = contactEmailRaw.length > 0 ? contactEmailRaw : null;
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return { error: t("staff.invalidContactEmail") };
  }
  const contactPhoneRaw = String(formData.get("contactPhone") ?? "").trim();
  const contactPhone = contactPhoneRaw.length > 0 ? contactPhoneRaw.slice(0, 40) : null;

  const businessOwner = await prisma.business.findUnique({
    where: { id: businessId },
    select: { nameAr: true, ownerId: true, code: true, owner: { select: { email: true } } },
  });
  if (!businessOwner) {
    return { error: t("staff.businessNotFound") };
  }

  const now = new Date();
  if (contactEmail) {
    const pendingSameContact = await prisma.staffInvite.findFirst({
      where: {
        businessId,
        contactEmail,
        status: StaffInviteStatus.PENDING,
        expiresAt: { gt: now },
      },
      select: { id: true },
    });
    if (pendingSameContact) {
      return {
        error: t("staff.pendingInviteExistsForEmail"),
      };
    }
  }

  const limitCheck = await assertStaffLimitForBusiness(businessId);
  const staffLimitError = translateStaffLimitCheck(t, limitCheck);
  if (staffLimitError) {
    return { error: staffLimitError };
  }

  const rawToken = generateStaffInviteRawToken();
  const tokenHash = hashStaffInviteToken(rawToken);
  const expiresAt = new Date(now.getTime() + STAFF_INVITE_TTL_MS);

  const actor = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, email: true },
  });

  const publicInviteLabel = await createUniquePublicInviteLabel(prisma, role);

  const invite = await prisma.staffInvite.create({
    data: {
      businessId,
      email: null,
      contactEmail,
      contactPhone,
      publicInviteLabel,
      role,
      scope,
      branchId,
      grantedPermissions: overrideSets.granted,
      revokedPermissions: overrideSets.revoked,
      templateKey: template,
      note,
      tokenHash,
      invitedByUserId: userId,
      expiresAt,
      status: StaffInviteStatus.PENDING,
    },
  });

  const base = await resolvePublicBaseUrl();
  const path = `/${locale}/invite/${encodeURIComponent(rawToken)}`;
  const inviteUrl = base ? `${base.replace(/\/$/, "")}${path}` : path;

  const shareText = t("staff.shareInviteBody", {
    business: businessOwner.nameAr,
    role: membershipRoleLabel(role, t),
    url: inviteUrl,
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: actor?.id ?? null,
      businessId,
      branchId,
      action: "authorization.staff_invite.created",
      entityType: "StaffInvite",
      entityId: invite.id,
      beforeSnapshot: JSON.stringify({
        actorName: actor?.fullName ?? actor?.email ?? "unknown",
        publicInviteLabel,
        contactEmail,
      }),
      afterSnapshot: JSON.stringify({
        role,
        scope,
        branchId,
        grantedPermissions: overrideSets.granted,
        revokedPermissions: overrideSets.revoked,
        templateKey: template,
        expiresAt: expiresAt.toISOString(),
      }),
    },
  });

  revalidateStaffManagementPages(locale);
  return {
    error: null,
    inviteUrl,
    shareText,
    publicInviteLabel,
    completedAt: Date.now(),
  };
}

/**
 * Rotates the invite token (old links stop working) and extends expiry. Used when the owner needs a fresh link.
 */
export async function resendStaffInvite(
  _prev: ResendStaffInviteState,
  formData: FormData,
): Promise<ResendStaffInviteState> {
  const userId = await getCurrentUserId();
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  if (!userId) {
    return { error: t("staff.mustSignIn") };
  }

  const inviteId = String(formData.get("inviteId") ?? "").trim();
  if (!inviteId) {
    return { error: t("staff.missingInviteId") };
  }

  const authz = await assertStaffManagementContext(userId, t);
  if (authz.error) return { error: authz.error };
  const context = authz.context;
  if (!context) return { error: t("staff.noWorkspaceContext") };

  if (!getRoleBasePermissions(context.member.role).has("users.assign_roles")) {
    return { error: t("staff.cannotAssignRoles") };
  }

  const row = await prisma.staffInvite.findFirst({
    where: { id: inviteId, businessId: context.business.id },
    include: {
      business: { select: { nameAr: true } },
    },
  });
  if (!row) {
    return { error: t("staff.inviteNotFound") };
  }
  if (row.status === StaffInviteStatus.ACCEPTED) {
    return { error: t("staff.inviteAlreadyAccepted") };
  }
  if (row.status === StaffInviteStatus.CANCELLED) {
    return { error: t("staff.inviteCancelled") };
  }

  const rawToken = generateStaffInviteRawToken();
  const tokenHash = hashStaffInviteToken(rawToken);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + STAFF_INVITE_TTL_MS);

  await prisma.staffInvite.update({
    where: { id: row.id },
    data: {
      tokenHash,
      status: StaffInviteStatus.PENDING,
      expiresAt,
      acceptedAt: null,
      cancelledAt: null,
    },
  });

  const actor = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, email: true },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: actor?.id ?? null,
      businessId: context.business.id,
      branchId: row.branchId,
      action: "authorization.staff_invite.regenerated",
      entityType: "StaffInvite",
      entityId: row.id,
      beforeSnapshot: JSON.stringify({
        actorName: actor?.fullName ?? actor?.email ?? "unknown",
        publicInviteLabel: row.publicInviteLabel,
        contactEmail: row.contactEmail,
        previousStatus: row.status,
      }),
      afterSnapshot: JSON.stringify({
        role: row.role,
        scope: row.scope,
        branchId: row.branchId,
        expiresAt: expiresAt.toISOString(),
      }),
    },
  });

  const base = await resolvePublicBaseUrl();
  const path = `/${locale}/invite/${encodeURIComponent(rawToken)}`;
  const inviteUrl = base ? `${base.replace(/\/$/, "")}${path}` : path;
  const shareText = t("staff.shareInviteBody", {
    business: row.business.nameAr,
    role: membershipRoleLabel(row.role, t),
    url: inviteUrl,
  });

  revalidateStaffManagementPages(locale);
  return {
    error: null,
    inviteUrl,
    shareText,
    publicInviteLabel: row.publicInviteLabel,
    completedAt: Date.now(),
  };
}

/**
 * Cancel a pending staff invite (server-side only; UI must not imply email was sent).
 * Mutations must re-check permissions because POST can be forged independently of the staff page shell.
 */
export async function cancelStaffInvite(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return;
  }

  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  const inviteId = String(formData.get("inviteId") ?? "").trim();
  if (!inviteId) {
    return;
  }

  const authz = await assertStaffManagementContext(userId, t);
  if (authz.error) return;
  const context = authz.context;
  if (!context) return;

  const invite = await prisma.staffInvite.findFirst({
    where: {
      id: inviteId,
      businessId: context.business.id,
      status: StaffInviteStatus.PENDING,
    },
    select: {
      id: true,
      publicInviteLabel: true,
      contactEmail: true,
      role: true,
      scope: true,
      branchId: true,
      grantedPermissions: true,
      revokedPermissions: true,
    },
  });
  if (!invite) {
    return;
  }

  const actor = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, email: true },
  });

  await prisma.staffInvite.update({
    where: { id: invite.id },
    data: { status: StaffInviteStatus.CANCELLED, cancelledAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: actor?.id ?? null,
      businessId: context.business.id,
      branchId: invite.branchId,
      action: "authorization.staff_invite.cancelled",
      entityType: "StaffInvite",
      entityId: invite.id,
      beforeSnapshot: JSON.stringify({
        actorName: actor?.fullName ?? actor?.email ?? "unknown",
        publicInviteLabel: invite.publicInviteLabel,
        contactEmail: invite.contactEmail,
        role: invite.role,
        scope: invite.scope,
        branchId: invite.branchId,
        grantedPermissions: invite.grantedPermissions,
        revokedPermissions: invite.revokedPermissions,
      }),
      afterSnapshot: JSON.stringify({ status: StaffInviteStatus.CANCELLED }),
    },
  });

  revalidateStaffManagementPages(locale);
}

/**
 * Soft-archive a membership. Cannot remove the owner's OWNER membership row.
 */
export async function archiveStaffMembership(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return;
  }

  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  const membershipId = String(formData.get("membershipId") ?? "");
  if (!membershipId) {
    return;
  }

  const authz = await assertStaffManagementContext(userId, t);
  if (authz.error) return;
  const context = authz.context;
  if (!context) return;

  const row = await prisma.membership.findFirst({
    where: { id: membershipId, archivedAt: null },
    include: {
      business: { select: { id: true, ownerId: true } },
    },
  });
  if (!row) {
    return;
  }

  if (row.businessId !== context.business.id) {
    return;
  }

  if (row.role === MembershipRole.OWNER && row.userId === row.business.ownerId) {
    return;
  }

  await prisma.membership.update({
    where: { id: membershipId },
    data: {
      archivedAt: new Date(),
      isActive: false,
    },
  });

  revalidateStaffManagementPages(locale);
}

export async function resetStaffPermissions(_prev: SaveStaffState, formData: FormData): Promise<SaveStaffState> {
  const userId = await getCurrentUserId();
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  if (!userId) return { error: t("staff.mustSignIn") };

  const membershipId = String(formData.get("membershipId") ?? "").trim();
  if (!membershipId) return { error: t("staff.missingMembershipId") };

  const authz = await assertStaffManagementContext(userId, t);
  if (authz.error) return { error: authz.error };
  const context = authz.context;
  if (!context) return { error: t("staff.noWorkspaceContext") };
  if (!getRoleBasePermissions(context.member.role).has("users.assign_roles")) {
    return { error: t("staff.cannotAssignRoles") };
  }

  const row = await prisma.membership.findFirst({
    where: { id: membershipId, businessId: context.business.id, archivedAt: null },
    select: { id: true, role: true, scope: true, branchId: true, grantedPermissions: true, revokedPermissions: true },
  });
  if (!row) return { error: t("staff.membershipNotFoundReset") };

  const actor = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, email: true },
  });
  await prisma.membership.update({
    where: { id: membershipId },
    data: {
      grantedPermissions: [],
      revokedPermissions: [],
      scope: getRoleDefaultScope(row.role),
    },
  });
  await prisma.auditLog.create({
    data: {
      actorUserId: actor?.id ?? null,
      businessId: context.business.id,
      branchId: row.branchId,
      action: "authorization.membership.reset_to_role_default",
      entityType: "Membership",
      entityId: row.id,
      beforeSnapshot: JSON.stringify({
        actorName: actor?.fullName ?? actor?.email ?? "unknown",
        role: row.role,
        scope: row.scope,
        branchId: row.branchId,
        grantedPermissions: row.grantedPermissions,
        revokedPermissions: row.revokedPermissions,
      }),
      afterSnapshot: JSON.stringify({
        role: row.role,
        scope: getRoleDefaultScope(row.role),
        branchId: row.branchId,
        grantedPermissions: [],
        revokedPermissions: [],
        template: "DEFAULT",
      }),
    },
  });

  revalidateStaffManagementPages(locale);
  return { error: null, success: true, completedAt: Date.now() };
}
