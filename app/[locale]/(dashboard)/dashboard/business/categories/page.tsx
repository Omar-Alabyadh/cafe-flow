import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { hasPermission } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { CategoriesWorkspace, type CategoryListItem } from "./categories-workspace";

type PageProps = { params: Promise<{ locale: string }> };

export default async function CategoriesPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.categories");
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
  if (!hasPermission(context.member, "categories.view")) {
    return <UnauthorizedState locale={locale} title={t("unauthorized.title")} description={t("unauthorized.description")} />;
  }
  const businessId = context.business.id;

  const rows = await prisma.category.findMany({
    where: { businessId, archivedAt: null },
    orderBy: { nameAr: "asc" },
    include: {
      _count: {
        select: {
          products: { where: { archivedAt: null } },
        },
      },
    },
  });

  const categories: CategoryListItem[] = rows.map((c) => ({
    id: c.id,
    code: c.code,
    nameAr: c.nameAr,
    nameEn: c.nameEn,
    description: c.description,
    productCount: c._count.products,
  }));

  return (
    <PageContainer>
      <SectionHeader title={t("title")} description={t("description")} />

      <CategoriesWorkspace locale={locale} categories={categories} />
    </PageContainer>
  );
}
