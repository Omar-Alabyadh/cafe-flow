"use server";

import { getCurrentUserId } from "@/lib/auth/session";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import { prisma } from "@/lib/prisma";
import { BusinessStatus, MembershipRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateBusinessState = {
  error: string | null;
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
