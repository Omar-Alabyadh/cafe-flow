"use server";

import { hashPassword } from "@/lib/auth/password";
import { getCurrentUserId } from "@/lib/auth/session";
import {
  isBusinessStaffAssignableRole,
  isPermissionKey,
  type BusinessStaffAssignableRole,
} from "@/lib/authorization/permissions";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import { hashStaffInviteToken } from "@/lib/staff/invite-token";
import { allocateStaffSystemLoginEmail, normalizeLoginNameSegment } from "@/lib/staff/staff-login-identifier";
import { validateStaffRolePermissionSafety } from "@/lib/staff/staff-role-permission-safety";
import { revalidateBusinessHub } from "@/lib/cache/revalidate-tenant-ui";
import { prisma } from "@/lib/prisma";
import { Prisma, StaffInviteStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type RegisterInviteState = {
  error: string | null;
  success?: boolean;
  /** Full internal identifier (unique key; sign-in uses this value). */
  systemLoginEmail?: string | null;
  /** Local part only for onboarding UI emphasis (before `@`). */
  systemLoginLocalPart?: string | null;
  /** Arabic display name on success (same as `User.fullName` just created). */
  registeredFullNameAr?: string | null;
  /** Arabic role title for success screen only. */
  registeredRoleTitleAr?: string | null;
};

/**
 * Employee completes **identity + password** on the invite page only.
 * Role/scope/branch/permissions are frozen on the invite row — cannot be escalated from the client.
 *
 * Tenant safety: invite is loaded by `tokenHash` uniquely; every mutation re-checks `invite.businessId`
 * so a token cannot attach a user to a different tenant. Membership is always created for `invite.businessId` only.
 */
export async function completeStaffInviteRegistration(
  _prev: RegisterInviteState,
  formData: FormData,
): Promise<RegisterInviteState> {
  const token = String(formData.get("token") ?? "").trim();
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  if (!token) {
    return { error: t("invite.completeStaff.missingToken") };
  }

  const existingSession = await getCurrentUserId();
  if (existingSession) {
    return {
      error: t("invite.completeStaff.alreadySignedIn"),
    };
  }

  const firstNameAr = String(formData.get("firstNameAr") ?? "").trim();
  const lastNameAr = String(formData.get("lastNameAr") ?? "").trim();
  const firstNameEnRaw = String(formData.get("firstNameEn") ?? "");
  const lastNameEnRaw = String(formData.get("lastNameEn") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!firstNameAr || !lastNameAr) {
    return { error: t("invite.completeStaff.missingArabicNames") };
  }

  const firstNameEn = normalizeLoginNameSegment(firstNameEnRaw);
  const lastNameEn = normalizeLoginNameSegment(lastNameEnRaw);
  if (firstNameEn.length < 1 || lastNameEn.length < 1) {
    return {
      error: t("invite.completeStaff.invalidEnglishNameParts"),
    };
  }

  if (password.length < 8) {
    return { error: t("invite.completeStaff.passwordTooShort") };
  }
  if (password !== confirmPassword) {
    return { error: t("invite.completeStaff.passwordMismatch") };
  }

  const tokenHash = hashStaffInviteToken(token);

  const invite = await prisma.staffInvite.findUnique({
    where: { tokenHash },
    include: {
      business: { select: { id: true, nameAr: true, code: true, archivedAt: true } },
    },
  });

  if (!invite || invite.business.archivedAt) {
    return { error: t("invite.completeStaff.invalidInvite") };
  }

  if (invite.status !== StaffInviteStatus.PENDING) {
    if (invite.status === StaffInviteStatus.ACCEPTED) {
      return { error: t("invite.completeStaff.inviteAlreadyAccepted") };
    }
    if (invite.status === StaffInviteStatus.CANCELLED) {
      return { error: t("invite.completeStaff.inviteCancelled") };
    }
    return { error: t("invite.completeStaff.inviteInvalidStatus") };
  }

  const now = new Date();
  if (invite.expiresAt < now) {
    await prisma.staffInvite.update({
      where: { id: invite.id },
      data: { status: StaffInviteStatus.EXPIRED },
    });
    return { error: t("invite.completeStaff.inviteExpired") };
  }

  if (!isBusinessStaffAssignableRole(invite.role)) {
    return { error: t("invite.completeStaff.roleNotAssignable") };
  }

  if (invite.branchId) {
    const branchOk = await prisma.branch.findFirst({
      where: { id: invite.branchId, businessId: invite.businessId, archivedAt: null },
      select: { id: true },
    });
    if (!branchOk) {
      return { error: t("invite.completeStaff.inviteBranchMissing") };
    }
  }

  const granted = (invite.grantedPermissions ?? []).filter(isPermissionKey);
  const revoked = (invite.revokedPermissions ?? []).filter(isPermissionKey);
  const safety = validateStaffRolePermissionSafety(invite.role, granted, revoked);
  if (safety) {
    return { error: t("staff.permissionSafety", { permissions: safety.violated.join(" ") }) };
  }

  let systemLoginEmail: string;
  try {
    systemLoginEmail = await allocateStaffSystemLoginEmail(prisma, {
      firstNameEn,
      lastNameEn,
      role: invite.role,
      businessCode: invite.business.code,
    });
  } catch {
    return { error: t("invite.completeStaff.systemLoginAllocationFailed") };
  }

  const at = systemLoginEmail.indexOf("@");
  const systemLoginLocalPart = at > 0 ? systemLoginEmail.slice(0, at) : systemLoginEmail;

  const fullName = `${firstNameAr} ${lastNameAr}`.trim();
  const passwordHash = await hashPassword(password);

  try {
    await prisma.$transaction(async (tx) => {
      const locked = await tx.staffInvite.findFirst({
        where: {
          id: invite.id,
          status: StaffInviteStatus.PENDING,
          tokenHash,
          businessId: invite.businessId,
        },
      });
      if (!locked) {
        throw new Error("INVITE_NOT_PENDING");
      }
      if (locked.expiresAt < new Date()) {
        await tx.staffInvite.update({
          where: { id: locked.id },
          data: { status: StaffInviteStatus.EXPIRED },
        });
        throw new Error("INVITE_EXPIRED");
      }

      const user = await tx.user.create({
        data: {
          fullName,
          email: systemLoginEmail,
          passwordHash,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          businessId: invite.businessId,
          branchId: invite.branchId,
          role: invite.role,
          scope: invite.scope,
          grantedPermissions: invite.grantedPermissions ?? [],
          revokedPermissions: invite.revokedPermissions ?? [],
        },
      });

      await tx.staffInvite.update({
        where: { id: invite.id },
        data: {
          status: StaffInviteStatus.ACCEPTED,
          acceptedAt: now,
          email: systemLoginEmail,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: user.id,
          businessId: invite.businessId,
          branchId: invite.branchId,
          action: "authorization.staff_invite.registered",
          entityType: "StaffInvite",
          entityId: invite.id,
          beforeSnapshot: JSON.stringify({
            publicInviteLabel: invite.publicInviteLabel,
            role: invite.role,
            scope: invite.scope,
          }),
          afterSnapshot: JSON.stringify({
            systemLoginEmail,
            membershipCreated: true,
          }),
        },
      });
    });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "INVITE_NOT_PENDING") {
      return { error: t("invite.completeStaff.notPendingAfterLock") };
    }
    if (code === "INVITE_EXPIRED") {
      return { error: t("invite.completeStaff.expiredAfterLock") };
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: t("invite.completeStaff.duplicateUser") };
    }
    throw e;
  }

  revalidatePath(`/${locale}/dashboard`, "layout");
  revalidatePath(`/${locale}/dashboard/business/staff`, "page");
  revalidateBusinessHub(locale);

  const tAr = await getServerActionTranslator("ar");
  const registeredRoleTitleAr = isBusinessStaffAssignableRole(invite.role)
    ? tAr(`staff.roles.${invite.role as BusinessStaffAssignableRole}`)
    : String(invite.role);

  return {
    error: null,
    success: true,
    systemLoginEmail,
    systemLoginLocalPart,
    registeredFullNameAr: fullName,
    registeredRoleTitleAr,
  };
}
