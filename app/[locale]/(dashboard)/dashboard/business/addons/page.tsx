import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { hasPermission } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { AddonsWorkspace } from "./addons-workspace";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AddonsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.addons");
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
  if (!hasPermission(context.member, "addons.view")) {
    return <UnauthorizedState locale={locale} title={t("unauthorized.title")} description={t("unauthorized.description")} />;
  }
  const businessId = context.business.id;

  const rows = await prisma.addon.findMany({
    where: { businessId, archivedAt: null },
    orderBy: { nameAr: "asc" },
  });

  return (
    <PageContainer>
      <SectionHeader title={t("title")} description={t("description")} />
      <AddonsWorkspace
        locale={locale}
        addons={rows.map((a) => ({
          id: a.id,
          code: a.code,
          nameAr: a.nameAr,
          nameEn: a.nameEn,
          extraPrice: a.extraPrice.toString(),
        }))}
      />
    </PageContainer>
  );
}
