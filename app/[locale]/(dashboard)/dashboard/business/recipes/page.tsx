import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { EmptyState } from "@/components/ui/foundations/empty-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { hasPermission } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { RecipesWorkspace, type RecipeMaterialOption, type RecipeProductRow } from "./recipes-workspace";

type PageProps = { params: Promise<{ locale: string }> };

/**
 * Lists sellable products and whether a recipe (BOM) exists.
 * One recipe per product keeps the ERD easy to defend in viva.
 *
 * Data context: `getCurrentBusinessMemberContext` (active membership + selected business).
 * If the user lacks permission, this route renders UnauthorizedState.
 */
export default async function RecipesIndexPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.recipes.page");
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
  if (!hasPermission(context.member, "recipes.view")) {
    return (
      <UnauthorizedState
        locale={locale}
        title={t("unauthorizedTitle")}
        description={t("unauthorizedDescription")}
      />
    );
  }
  const businessId = context.business.id;

  const [productsRows, rawMaterials] = await Promise.all([
    prisma.product.findMany({
      where: { businessId, archivedAt: null },
      include: {
        recipe: {
          include: {
            items: {
              include: {
                rawMaterial: {
                  include: { unit: true },
                },
              },
              orderBy: { rawMaterial: { nameAr: "asc" } },
            },
          },
        },
      },
      orderBy: { nameAr: "asc" },
    }),
    prisma.rawMaterial.findMany({
      where: { businessId, archivedAt: null },
      include: { unit: true },
      orderBy: { nameAr: "asc" },
    }),
  ]);

  const products: RecipeProductRow[] = productsRows.map((p) => ({
    id: p.id,
    code: p.code,
    nameAr: p.nameAr,
    recipeId: p.recipe?.id ?? null,
    recipeItems:
      p.recipe?.items.map((item) => ({
        id: item.id,
        rawMaterialId: item.rawMaterialId,
        rawMaterialName: item.rawMaterial.nameAr,
        unitName: item.rawMaterial.unit.nameAr,
        quantity: item.quantity.toString(),
      })) ?? [],
  }));

  const materials: RecipeMaterialOption[] = rawMaterials.map((m) => ({
    id: m.id,
    nameAr: m.nameAr,
    unitName: m.unit.nameAr,
  }));

  return (
    <PageContainer>
      <SectionHeader
        title={t("title")}
        description={t("description")}
      />

      {products.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <RecipesWorkspace locale={locale} products={products} materials={materials} />
      )}
    </PageContainer>
  );
}
