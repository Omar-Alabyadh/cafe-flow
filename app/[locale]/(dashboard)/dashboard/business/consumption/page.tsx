import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { EmptyState } from "@/components/ui/foundations/empty-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { canManageInventory } from "@/lib/authorization/access";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ConsumeProductForm } from "./consume-product-form";

type PageProps = { params: Promise<{ locale: string }> };

/**
 * Internal Phase 7 page:
 * manual trigger for recipe-based stock deduction (not full order/POS).
 */
export default async function ConsumptionPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.consumption.page");
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
  if (!canManageInventory(context.member)) {
    return <UnauthorizedState locale={locale} title={t("unauthorizedTitle")} description={t("unauthorizedDescription")} />;
  }
  const businessId = context.business.id;

  const products = await prisma.product.findMany({
    where: { businessId, archivedAt: null, isActive: true },
    include: {
      recipe: {
        include: {
          _count: { select: { items: true } },
          items: {
            include: {
              rawMaterial: {
                include: {
                  unit: { select: { nameAr: true, symbol: true } },
                  stock: { select: { balance: true } },
                },
              },
            },
            orderBy: { rawMaterial: { nameAr: "asc" } },
          },
        },
      },
    },
    orderBy: { nameAr: "asc" },
  });

  const productSummaries = products.map((p) => ({
    id: p.id,
    name: p.nameAr,
    hasRecipe: Boolean(p.recipe),
    recipeItemsCount: p.recipe?._count.items ?? 0,
  }));

  const productPreviewData = products.map((p) => ({
    id: p.id,
    label: `${p.nameAr} (${p.code})`,
    name: p.nameAr,
    hasRecipe: Boolean(p.recipe),
    items:
      p.recipe?.items.map((item) => ({
        rawMaterialId: item.rawMaterialId,
        rawMaterialName: item.rawMaterial.nameAr,
        recipeQtyPerUnit: item.quantity.toString(),
        unit: item.rawMaterial.unit.symbol || item.rawMaterial.unit.nameAr,
        currentBalance: item.rawMaterial.stock?.balance.toString() ?? "0",
      })) ?? [],
  }));

  return (
    <PageContainer>
      <SectionHeader
        title={t("title")}
        description={t("description")}
      />

      <p className="mb-1 text-sm text-zinc-700 dark:text-zinc-300">
        {t("introLine1")}
      </p>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        {t("introLine2")}
      </p>

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-800/60 dark:bg-amber-950/20">
        <p className="mb-2 text-sm font-semibold text-amber-900 dark:text-amber-100">{t("rulesTitle")}</p>
        <ul className="grid gap-1 text-xs text-amber-900/90 dark:text-amber-100/90 md:grid-cols-2">
          <li>{t("rules.1")}</li>
          <li>{t("rules.2")}</li>
          <li>{t("rules.3")}</li>
          <li>{t("rules.4")}</li>
          <li>{t("rules.5")}</li>
        </ul>
      </div>

      {products.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <ConsumeProductForm locale={locale} products={productPreviewData} />

          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-2 font-medium">{t("productsCardTitle")}</p>
            <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
              {productSummaries.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</span>
                  {p.hasRecipe ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      {t("recipeReady", { count: p.recipeItemsCount })}
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800 dark:bg-red-900/40 dark:text-red-300">
                      {t("recipeMissing")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        {t("footer.beforeInventory")}{" "}
        <Link href={`/${locale}/dashboard/business/inventory`} className="underline">
          {t("footer.inventoryLink")}
        </Link>{" "}
        {t("footer.middle")}{" "}
        <Link href={`/${locale}/dashboard/business/stock-movements`} className="underline">
          {t("footer.stockMovementsLink")}
        </Link>{" "}
        {t("footer.afterStockMovements")}
      </p>
    </PageContainer>
  );
}

