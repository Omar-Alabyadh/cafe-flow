"use server";

import { getCurrentUserId } from "@/lib/auth/session";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { hasPermission } from "@/lib/authorization/access";
import { getServerActionTranslator, normalizeServerActionLocale, translateBranchLimitCheck } from "@/lib/i18n/server-action-translator";
import { assertBranchLimitForBusiness } from "@/lib/subscription/business-subscription";
import {
  revalidateBranchesPage,
  revalidateOperationalTimeZoneSurfaces,
  revalidateStaffManagementPages,
} from "@/lib/cache/revalidate-tenant-ui";
import { prisma } from "@/lib/prisma";
import { normalizeTimeZoneInput, validateTimeZone } from "@/lib/time-zone/validation";

export type CreateBranchState = { error: string | null };

/**
 * Creates a branch under the owner's single business.
 * Branch `code` is unique per business (not globally).
 */
export async function createBranch(
  _prev: CreateBranchState,
  formData: FormData,
): Promise<CreateBranchState> {
  const userId = await getCurrentUserId();
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  if (!userId) {
    return { error: t("branches.mustSignIn") };
  }

  let context;
  try {
    context = await getCurrentBusinessMemberContext(userId);
  } catch (error) {
    if (isBusinessContextSelectionError(error)) {
      return { error: t("branches.selectBusinessFirst") };
    }
    throw error;
  }
  const businessId = context.business.id;
  if (!hasPermission(context.member, "settings.branch.manage")) {
    return { error: t("branches.noPermission") };
  }

  const limitCheck = await assertBranchLimitForBusiness(businessId);
  const limitError = translateBranchLimitCheck(t, limitCheck);
  if (limitError) {
    return { error: limitError };
  }

  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-");
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const nameEnRaw = String(formData.get("nameEn") ?? "").trim();
  const nameEn = nameEnRaw.length > 0 ? nameEnRaw : null;
  const timeZoneRaw = normalizeTimeZoneInput(formData.get("timeZone"));
  const timeZone = timeZoneRaw ? validateTimeZone(timeZoneRaw) : null;

  if (code.length < 1 || code.length > 20) {
    return { error: t("branches.codeInvalid") };
  }
  if (nameAr.length < 2 || nameAr.length > 120) {
    return { error: t("branches.nameArLength") };
  }
  if (nameEn && nameEn.length > 120) {
    return { error: t("branches.nameEnLength") };
  }
  if (timeZone && !timeZone.ok) {
    return { error: t("branches.invalidTimeZone") };
  }

  try {
    await prisma.branch.create({
      data: {
        businessId,
        code,
        nameAr,
        nameEn,
        timeZone: timeZone?.ok ? timeZone.value : null,
      },
    });
  } catch {
    return { error: t("branches.saveFailed") };
  }

  revalidateBranchesPage(locale);
  revalidateStaffManagementPages(locale);
  return { error: null };
}

export type SaveBranchState = {
  error: string | null;
  success?: boolean;
  completedAt?: number;
};

/**
 * Save branch in create/update mode while keeping ownership and limit checks.
 */
export async function saveBranch(_prev: SaveBranchState, formData: FormData): Promise<SaveBranchState> {
  const userId = await getCurrentUserId();
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  if (!userId) {
    return { error: t("branches.mustSignIn") };
  }

  let context;
  try {
    context = await getCurrentBusinessMemberContext(userId);
  } catch (error) {
    if (isBusinessContextSelectionError(error)) {
      return { error: t("branches.selectBusinessFirst") };
    }
    throw error;
  }
  const businessId = context.business.id;
  if (!hasPermission(context.member, "settings.branch.manage")) {
    return { error: t("branches.noPermission") };
  }

  const branchIdRaw = String(formData.get("branchId") ?? "").trim();
  const branchId = branchIdRaw.length > 0 ? branchIdRaw : null;
  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-");
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const nameEnRaw = String(formData.get("nameEn") ?? "").trim();
  const nameEn = nameEnRaw.length > 0 ? nameEnRaw : null;
  const timeZoneRaw = normalizeTimeZoneInput(formData.get("timeZone"));
  const timeZone = timeZoneRaw ? validateTimeZone(timeZoneRaw) : null;

  if (code.length < 1 || code.length > 20) {
    return { error: t("branches.codeInvalid") };
  }
  if (nameAr.length < 2 || nameAr.length > 120) {
    return { error: t("branches.nameArLength") };
  }
  if (nameEn && nameEn.length > 120) {
    return { error: t("branches.nameEnLength") };
  }
  if (timeZone && !timeZone.ok) {
    return { error: t("branches.invalidTimeZone") };
  }

  const revalidate = () => {
    revalidateOperationalTimeZoneSurfaces(locale);
    revalidateStaffManagementPages(locale);
  };

  if (branchId) {
    const existing = await prisma.branch.findFirst({
      where: { id: branchId, businessId, archivedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return { error: t("branches.branchNotFound") };
    }

    try {
      await prisma.branch.update({
        where: { id: branchId },
        data: { code, nameAr, nameEn, timeZone: timeZone?.ok ? timeZone.value : null },
      });
    } catch {
      return { error: t("branches.updateFailed") };
    }

    revalidate();
    return { error: null, success: true, completedAt: Date.now() };
  }

  const limitCheck = await assertBranchLimitForBusiness(businessId);
  const limitErrorSave = translateBranchLimitCheck(t, limitCheck);
  if (limitErrorSave) {
    return { error: limitErrorSave };
  }

  try {
    await prisma.branch.create({
      data: { businessId, code, nameAr, nameEn, timeZone: timeZone?.ok ? timeZone.value : null },
    });
  } catch {
    return { error: t("branches.saveFailed") };
  }

  revalidate();
  return { error: null, success: true, completedAt: Date.now() };
}

/**
 * Soft-archive: we stop using the branch in lists but keep the row for history.
 */
export async function archiveBranch(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return;
  }

  const locale = String(formData.get("locale") ?? "ar");
  const branchId = String(formData.get("branchId") ?? "");
  if (!branchId) {
    return;
  }

  const branch = await prisma.branch.findFirst({
    where: { id: branchId, archivedAt: null },
    select: { id: true, businessId: true },
  });
  if (!branch) {
    return;
  }

  let context;
  try {
    context = await getCurrentBusinessMemberContext(userId);
  } catch {
    return;
  }
  if (context.business.id !== branch.businessId || !hasPermission(context.member, "settings.branch.manage")) {
    return;
  }

  await prisma.branch.update({
    where: { id: branchId },
    data: {
      archivedAt: new Date(),
      isActive: false,
    },
  });

  revalidateOperationalTimeZoneSurfaces(locale);
  revalidateStaffManagementPages(locale);
}
