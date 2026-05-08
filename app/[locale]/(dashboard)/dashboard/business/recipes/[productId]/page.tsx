import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { EmptyState } from "@/components/ui/foundations/empty-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { hasPermission } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { prisma } from "@/lib/prisma";
import { formatArabicLatnQuantity } from "@/lib/format/numbers";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { removeRecipeItem } from "../actions";
import { AddRecipeItemForm } from "./add-recipe-item-form";
import { CreateRecipeForm } from "./create-recipe-form";

type PageProps = {
  params: Promise<{ locale: string; productId: string }>;
};

/**
 * Recipe detail is scoped to the currently selected business context.
 */
export default async function RecipeDetailPage({ params }: PageProps) {
  const { locale, productId } = await params;
  const t = await getTranslations("dashboard.business.recipes.detail");
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
    return <UnauthorizedState locale={locale} title={t("unauthorizedTitle")} description={t("unauthorizedDescription")} />;
  }
  const businessId = context.business.id;

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      businessId,
      archivedAt: null,
    },
    include: {
      recipe: {
        include: {
          items: {
            include: {
              rawMaterial: { include: { unit: true } },
            },
            orderBy: { rawMaterial: { nameAr: "asc" } },
          },
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const rawMaterials = await prisma.rawMaterial.findMany({
    where: { businessId, archivedAt: null },
    include: { unit: true },
    orderBy: { nameAr: "asc" },
  });

  const materialOptions = rawMaterials.map((m) => ({
    id: m.id,
    label: `${m.nameAr} (${m.unit.nameAr})`,
  }));

  return (
    <PageContainer>
      <div className="mb-4">
        <Link href={`/${locale}/dashboard/business/recipes`} className="text-sm text-zinc-600 underline dark:text-zinc-400">
          ← {t("backToList")}
        </Link>
      </div>

      <SectionHeader
        title={t("title", { name: product.nameAr })}
        description={t("description", { code: product.code })}
      />

      {!product.recipe ? (
        <CreateRecipeForm locale={locale} productId={product.id} />
      ) : (
        <>
          <AddRecipeItemForm locale={locale} recipeId={product.recipe.id} materials={materialOptions} />

          {product.recipe.items.length === 0 ? (
            <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-muted text-foreground">
                  <tr>
                    <th className="px-4 py-2 text-start font-medium">{t("table.material")}</th>
                    <th className="px-4 py-2 text-right font-medium">{t("table.quantityPerUnit")}</th>
                    <th className="px-4 py-2 text-start font-medium">{t("table.unit")}</th>
                    <th className="px-4 py-2 text-start font-medium">{t("table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {product.recipe.items.map((row) => (
                    <tr key={row.id} className="border-t border-zinc-200 dark:border-zinc-800">
                      <td className="px-4 py-2">{row.rawMaterial.nameAr}</td>
                      <td className="px-4 py-2 text-right font-mono tabular-nums">
                        {formatArabicLatnQuantity(row.quantity.toNumber())}
                      </td>
                      <td className="px-4 py-2">{row.rawMaterial.unit.nameAr}</td>
                      <td className="px-4 py-2">
                        <form action={removeRecipeItem}>
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="itemId" value={row.id} />
                          <button type="submit" className="text-red-600 underline dark:text-red-400">
                            {t("remove")}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
