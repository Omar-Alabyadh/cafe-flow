import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { hasPermission } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { UnitsWorkspace } from "./units-workspace";

type PageProps = { params: Promise<{ locale: string }> };

export default async function UnitsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.units.page");
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
  if (!hasPermission(context.member, "units.view")) {
    return (
      <UnauthorizedState
        locale={locale}
        title={t("unauthorizedTitle")}
        description={t("unauthorizedDescription")}
      />
    );
  }
  const businessId = context.business.id;

  const rows = await prisma.unit.findMany({
    where: { businessId, archivedAt: null },
    include: {
      _count: {
        select: { rawMaterials: { where: { archivedAt: null } } },
      },
    },
    orderBy: { nameAr: "asc" },
  });

  return (
    <PageContainer>
      <SectionHeader
        title={t("title")}
        description={t("description")}
      />

      <UnitsWorkspace
        locale={locale}
        units={rows.map((u) => ({
          id: u.id,
          code: u.code,
          nameAr: u.nameAr,
          nameEn: u.nameEn,
          symbol: u.symbol,
          linkedRawMaterialsCount: u._count.rawMaterials,
        }))}
      />
    </PageContainer>
  );
}
