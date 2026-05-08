import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { hasPermission } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { prisma } from "@/lib/prisma";
import { localizedCatalogName } from "@/lib/i18n/localized-catalog-name";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { BranchesWorkspace } from "./branches-workspace";

type BranchesPageProps = {
  params: Promise<{ locale: string }>;
};

/** Branch list + create form guarded by business permissions. */
export default async function BranchesPage({ params }: BranchesPageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.branches.page");
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(`/${locale}/sign-in`);
  }

  let context;
  try {
    context = await getCurrentBusinessMemberContext(userId);
  } catch (error) {
    if (isBusinessContextSelectionError(error)) redirect(`/${locale}/dashboard/select-business`);
    throw error;
  }
  if (!hasPermission(context.member, "branches.view")) {
    return (
      <UnauthorizedState
        locale={locale}
        title={t("unauthorizedTitle")}
        description={t("unauthorizedDescription")}
      />
    );
  }
  const business = await prisma.business.findFirst({
    where: { id: context.business.id, archivedAt: null },
    include: { branches: { where: { archivedAt: null }, orderBy: { createdAt: "asc" } } },
  });
  if (!business) {
    redirect(`/${locale}/dashboard/select-business`);
  }

  return (
    <PageContainer>
      <SectionHeader
        title={t("title")}
        description={t("description", {
          business: localizedCatalogName(locale, business.nameAr, business.nameEn),
        })}
      />

      <BranchesWorkspace
        locale={locale}
        branches={business.branches.map((b) => ({
          id: b.id,
          code: b.code,
          nameAr: b.nameAr,
          nameEn: b.nameEn,
          isActive: b.isActive,
        }))}
      />
    </PageContainer>
  );
}
