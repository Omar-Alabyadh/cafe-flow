import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { hasPermission } from "@/lib/authorization/access";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { ProductsWorkspace, type ProductListItem } from "./products-workspace";

type PageProps = { params: Promise<{ locale: string }> };

export default async function ProductsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.products");
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
  if (!hasPermission(context.member, "products.view")) {
    return <UnauthorizedState locale={locale} title={t("unauthorized.title")} description={t("unauthorized.description")} />;
  }
  const businessId = context.business.id;

  const [rows, categories] = await Promise.all([
    prisma.product.findMany({
      where: { businessId, archivedAt: null },
      include: { category: true },
      orderBy: { nameAr: "asc" },
    }),
    prisma.category.findMany({
      where: { businessId, archivedAt: null },
      orderBy: { nameAr: "asc" },
    }),
  ]);

  const categoryOptions = categories.map((c) => ({ id: c.id, label: c.nameAr }));

  const products: ProductListItem[] = rows.map((p) => ({
    id: p.id,
    code: p.code,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    categoryId: p.categoryId,
    categoryLabel: p.category?.nameAr ?? null,
    basePrice: p.basePrice.toString(),
  }));

  return (
    <PageContainer>
      <SectionHeader title={t("title")} description={t("description")} />

      <ProductsWorkspace locale={locale} categories={categoryOptions} products={products} />
    </PageContainer>
  );
}
