"use server";

import { getCurrentUserId } from "@/lib/auth/session";
import { hasPermission } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { revalidateOperationalTimeZoneSurfaces } from "@/lib/cache/revalidate-tenant-ui";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import { prisma } from "@/lib/prisma";
import { validateTimeZone } from "@/lib/time-zone/validation";
import { BusinessStatus, MembershipRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateBusinessState = {
  error: string | null;
};

export type SaveBusinessTimeZoneState = {
  error: string | null;
  success?: boolean;
  completedAt?: number;
};

/**
 * Creates one business for the current user and adds a business-wide OWNER membership.
 *
 * Why membership + ownerId: `ownerId` is the source of truth for ownership checks;
 * the Membership row makes the owner appear in staff lists and matches the ERD story.
 *
 * Phase 4 allows only one owned business per user (no multi-tenant switching yet).
 */
export async function createBusiness(
  _prev: CreateBusinessState,
  formData: FormData,
): Promise<CreateBusinessState> {
  const userId = await getCurrentUserId();
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  if (!userId) {
    return { error: t("business.create.mustSignIn") };
  }
  const codeRaw = String(formData.get("code") ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const nameEnRaw = String(formData.get("nameEn") ?? "").trim();
  const nameEn = nameEnRaw.length > 0 ? nameEnRaw : null;

  const alreadyOwns = await prisma.business.findFirst({
    where: {
      ownerId: userId,
      archivedAt: null,
      status: { not: BusinessStatus.ARCHIVED },
    },
    select: { id: true },
  });
  if (alreadyOwns) {
    return { error: t("business.create.alreadyOwnsBusiness") };
  }

  const hasStaffMembership = await prisma.membership.findFirst({
    where: {
      userId,
      archivedAt: null,
      isActive: true,
      role: { not: MembershipRole.OWNER },
    },
    select: { id: true },
  });
  if (hasStaffMembership) {
    /**
     * Business creation is an owner-only onboarding step.
     * Staff members operate within an existing tenant and must never create a separate business from this flow.
     */
    return { error: t("business.create.staffCannotCreate") };
  }

  if (codeRaw.length < 2 || codeRaw.length > 32) {
    return { error: t("business.create.codeLength") };
  }
  if (!/^[a-z0-9-]+$/.test(codeRaw)) {
    return { error: t("business.create.codeFormat") };
  }
  if (nameAr.length < 2 || nameAr.length > 120) {
    return { error: t("business.create.nameArLength") };
  }
  if (nameEn && nameEn.length > 120) {
    return { error: t("business.create.nameEnLength") };
  }

  const tAr = await getServerActionTranslator("ar");
  const tEn = await getServerActionTranslator("en");

  try {
    await prisma.$transaction(async (tx) => {
      // Phase 10 rule:
      // every new business starts with a 14-day TRIALING subscription.
      // We attach it to a simple active plan. If no plan exists yet, we create
      // one default starter plan to keep setup self-contained for demonstrations.
      let defaultPlan = await tx.plan.findFirst({
        where: { isActive: true },
        orderBy: { price: "asc" },
        select: { id: true },
      });
      if (!defaultPlan) {
        defaultPlan = await tx.plan.create({
          data: {
            code: "starter-default",
            nameAr: tAr("business.defaultPlanName"),
            nameEn: tEn("business.defaultPlanName"),
            price: 0,
            branchLimit: 3,
            staffLimit: 10,
            isActive: true,
          },
          select: { id: true },
        });
      }

      const business = await tx.business.create({
        data: {
          code: codeRaw,
          nameAr,
          nameEn,
          ownerId: userId,
        },
      });

      await tx.membership.create({
        data: {
          userId: userId,
          businessId: business.id,
          branchId: null,
          role: MembershipRole.OWNER,
        },
      });

      const startsAt = new Date();
      const trialEndsAt = new Date(startsAt.getTime() + 14 * 24 * 60 * 60 * 1000);

      await tx.subscription.create({
        data: {
          businessId: business.id,
          planId: defaultPlan.id,
          status: "TRIALING",
          startsAt,
          trialEndsAt,
        },
      });
    });
  } catch {
    return { error: t("business.create.createFailed") };
  }

  revalidatePath(`/${locale}/dashboard`, "layout");
  revalidatePath(`/${locale}/dashboard/business`, "page");
  redirect(`/${locale}/dashboard/business`);
}

export async function saveBusinessTimeZone(
  _prev: SaveBusinessTimeZoneState,
  formData: FormData,
): Promise<SaveBusinessTimeZoneState> {
  const userId = await getCurrentUserId();
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  if (!userId) return { error: t("business.timeZone.mustSignIn") };

  let context;
  try {
    context = await getCurrentBusinessMemberContext(userId);
  } catch (error) {
    if (isBusinessContextSelectionError(error)) return { error: t("business.timeZone.selectBusinessFirst") };
    throw error;
  }

  if (!hasPermission(context.member, "settings.business.manage")) {
    return { error: t("business.timeZone.noPermission") };
  }

  const result = validateTimeZone(formData.get("timeZone"));
  if (!result.ok) {
    return { error: t("business.timeZone.invalid") };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.business.update({
        where: { id: context.business.id },
        data: { timeZone: result.value },
      });

      if (context.business.timeZone !== result.value) {
        await tx.auditLog.create({
          data: {
            actorUserId: userId,
            businessId: context.business.id,
            branchId: null,
            action: "settings.business.time_zone.update",
            entityType: "Business",
            entityId: context.business.id,
            beforeSnapshot: JSON.stringify({ timeZone: context.business.timeZone }),
            afterSnapshot: JSON.stringify({ timeZone: result.value }),
          },
        });
      }
    });
  } catch {
    return { error: t("business.timeZone.saveFailed") };
  }

  revalidateOperationalTimeZoneSurfaces(locale);
  return { error: null, success: true, completedAt: Date.now() };
}
