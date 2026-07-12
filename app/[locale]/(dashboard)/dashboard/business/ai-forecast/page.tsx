import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { canAccessBranch } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { localizedCatalogName } from "@/lib/i18n/localized-catalog-name";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ForecastWorkspace } from "./forecast-workspace";

type ForecastPageProps = { params: Promise<{ locale: string }> };

/** Localized, read-only A5 surface. Generation happens only after explicit Server Action submission. */
export default async function ForecastPage({ params }: ForecastPageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.forecast");
  const userId = await getCurrentUserId();
  if (!userId) redirect(`/${locale}/sign-in`);
  let context;
  try {
    context = await getCurrentBusinessMemberContext(userId);
  } catch (error) {
    if (isBusinessContextSelectionError(error)) redirect(`/${locale}/dashboard/select-business`);
    throw error;
  }
  if (context.member.role !== "OWNER" && context.member.role !== "MANAGER") {
    return <UnauthorizedState locale={locale} title={t("unauthorizedTitle")} description={t("unauthorizedDescription")} />;
  }
  const branches = await prisma.branch.findMany({
    where: { businessId: context.business.id, archivedAt: null, isActive: true },
    select: { id: true, nameAr: true, nameEn: true },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  const authorizedBranches = branches
    .filter((branch) => canAccessBranch(context.member, branch.id))
    .map((branch, index) => ({ reference: `branch-${index + 1}`, label: localizedCatalogName(locale, branch.nameAr, branch.nameEn) || t("controls.unnamedBranch") }));
  return <PageContainer><SectionHeader title={t("title")} description={t("description")} /><p className="mb-6 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm leading-6 text-sky-950 dark:text-sky-100">{t("planningDisclaimer")}</p><ForecastWorkspace locale={locale} branches={authorizedBranches} /></PageContainer>;
}
