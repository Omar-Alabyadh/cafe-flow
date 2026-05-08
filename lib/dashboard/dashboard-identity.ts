import { cache } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { isPlatformOperator } from "@/lib/platform/require-platform-operator";
import { MembershipRole } from "@prisma/client";
import { localizedCatalogName } from "@/lib/i18n/localized-catalog-name";

type IdentityTranslator = Awaited<ReturnType<typeof getTranslations<"dashboard.identity">>>;

/**
 * Human-readable membership role for the dashboard (sidebar/header/POS shell).
 * Uses next-intl so Arabic routes show Arabic titles and English routes show English.
 * Not used for authorization — only display.
 */
export function membershipRoleDisplayLabel(t: IdentityTranslator, role: MembershipRole): string {
  switch (role) {
    case MembershipRole.SUPER_ADMIN:
      return t("roles.SUPER_ADMIN");
    case MembershipRole.OWNER:
      return t("roles.OWNER");
    case MembershipRole.MANAGER:
      return t("roles.MANAGER");
    case MembershipRole.ACCOUNTANT:
      return t("roles.ACCOUNTANT");
    case MembershipRole.CASHIER:
      return t("roles.CASHIER");
    case MembershipRole.BARISTA:
      return t("roles.BARISTA");
    case MembershipRole.WAITER:
      return t("roles.WAITER");
    case MembershipRole.KITCHEN_STAFF:
      return t("roles.KITCHEN_STAFF");
    case MembershipRole.INVENTORY_MANAGER:
      return t("roles.INVENTORY_MANAGER");
    case MembershipRole.PURCHASING_MANAGER:
      return t("roles.PURCHASING_MANAGER");
    case MembershipRole.JUICE_STAFF:
      return t("roles.JUICE_STAFF");
    default:
      return t("roles.MEMBER");
  }
}

/**
 * Branch line for identity: null branchId means access across all branches of the business.
 * Specific branch uses `nameAr` from the database (canonical Arabic branch name).
 */
export async function branchDisplayLabel(
  t: IdentityTranslator,
  businessId: string,
  branchId: string | null,
  locale: string,
): Promise<string> {
  if (!branchId) {
    return t("branches.all");
  }
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, businessId, archivedAt: null },
    select: { nameAr: true, nameEn: true },
  });
  if (!branch) {
    return t("branches.unnamed");
  }
  const label = localizedCatalogName(locale, branch.nameAr, branch.nameEn);
  return label || t("branches.unnamed");
}

export type DashboardIdentityDisplay = {
  fullName: string | null;
  fullNameEn: string | null;
  email: string | null;
  roleLabelAr: string | null;
  branchLabelAr: string | null;
  businessNameAr: string | null;
  isPlatformOperator: boolean;
};

/**
 * Bilingual display line for headers/sidebar: Arabic canonical name first in AR locale,
 * English/Latin first in EN locale when `fullNameEn` is set.
 */
export function formatDashboardUserDisplay(
  locale: string,
  fullName: string | null | undefined,
  fullNameEn: string | null | undefined,
): string {
  const ar = (fullName ?? "").trim();
  const en = (fullNameEn ?? "").trim();
  if (!ar && !en) {
    return "";
  }
  if (!en) {
    return ar;
  }
  if (!ar) {
    return en;
  }
  if (locale === "ar") {
    return `${ar} ، ${en}`;
  }
  return `${en} — ${ar}`;
}

/**
 * Reads optional `User.fullNameEn` with a tagged raw query so the app keeps working when
 * the running `PrismaClient` was generated **before** that column existed (dev hot reload
 * or a failed `prisma generate`). Prisma's typed `select` would throw `Unknown field` in
 * that mismatch; SQL only fails if the column is missing from PostgreSQL, which we treat
 * as "no English name" for display.
 */
async function readUserFullNameEnRaw(userId: string): Promise<string | null> {
  try {
    const rows = await prisma.$queryRaw<{ fullNameEn: string | null }[]>(
      Prisma.sql`SELECT "fullNameEn" FROM "User" WHERE "id" = ${userId} LIMIT 1`,
    );
    const v = rows[0]?.fullNameEn;
    return v && String(v).trim() ? String(v).trim() : null;
  } catch {
    return null;
  }
}

/**
 * Loads session identity for header/sidebar display: user name from the users table,
 * role, business, and branch from active membership context, without wrong fallbacks.
 * Role and "all branches" strings follow the active UI locale (next-intl request locale).
 * Cached via `cache()` to merge repeated calls in the same server request.
 */
export const loadDashboardIdentityForUser = cache(async (userId: string): Promise<DashboardIdentityDisplay> => {
  const [user, platformOp, t, locale] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true, archivedAt: true },
    }),
    isPlatformOperator(userId),
    getTranslations("dashboard.identity"),
    getLocale(),
  ]);

  if (!user || user.archivedAt) {
    return {
      fullName: null,
      fullNameEn: null,
      email: null,
      roleLabelAr: null,
      branchLabelAr: null,
      businessNameAr: null,
      isPlatformOperator: platformOp,
    };
  }

  const fullNameEn = await readUserFullNameEnRaw(userId);

  let roleLabelAr: string | null = null;
  let branchLabelAr: string | null = null;
  let businessNameAr: string | null = null;

  try {
    const ctx = await getCurrentBusinessMemberContext(userId);
    roleLabelAr = membershipRoleDisplayLabel(t, ctx.member.role);
    businessNameAr = localizedCatalogName(locale, ctx.business.nameAr, ctx.business.nameEn);
    branchLabelAr = await branchDisplayLabel(t, ctx.business.id, ctx.member.branchId, locale);
  } catch (error) {
    if (!isBusinessContextSelectionError(error)) {
      throw error;
    }
  }

  return {
    fullName: user.fullName,
    fullNameEn,
    email: user.email,
    roleLabelAr,
    branchLabelAr,
    businessNameAr,
    isPlatformOperator: platformOp,
  };
});
