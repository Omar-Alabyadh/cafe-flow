import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { hasPermission } from "@/lib/authorization/access";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { SuppliersWorkspace } from "./suppliers-workspace";

type PageProps = { params: Promise<{ locale: string }> };

export default async function SuppliersPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.suppliers.page");
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(`/${locale}/sign-in`);
  }

  let context;
  try {
    context = await getCurrentBusinessMemberContext(userId);
  } catch (error) {
    if (isBusinessContextSelectionError(error)) {
      redirect(`/${locale}/dashboard/select-business`);
    }
    throw error;
  }
  if (!hasPermission(context.member, "suppliers.view")) {
    return (
      <UnauthorizedState
        locale={locale}
        title={t("unauthorizedTitle")}
        description={t("unauthorizedDescription")}
      />
    );
  }
  const businessId = context.business.id;

  const rows = await prisma.supplier.findMany({
    where: { businessId, archivedAt: null },
    include: {
      _count: {
        select: {
          rawMaterials: { where: { archivedAt: null } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <PageContainer>
      <SectionHeader
        title={t("title")}
        description={t("description")}
      />
      <SuppliersWorkspace
        locale={locale}
        suppliers={rows.map((s) => ({
          id: s.id,
          name: s.name,
          phone: s.phone,
          email: s.email,
          notes: s.notes,
          linkedRawMaterialsCount: s._count.rawMaterials,
        }))}
      />
    </PageContainer>
  );
}
