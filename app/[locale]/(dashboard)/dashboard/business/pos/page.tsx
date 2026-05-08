import { PosLayout } from "@/components/pos/pos-layout";
import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/session";
import { formatDashboardUserDisplay, loadDashboardIdentityForUser } from "@/lib/dashboard/dashboard-identity";
import { localizedCatalogName } from "@/lib/i18n/localized-catalog-name";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { canUsePOS } from "@/lib/authorization/access";
import { OrderStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

type PosPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Real POS page for fast in-cafe operations.
 * It loads categories + active products for the owner's current business
 * then renders a dedicated real-time cashier UI.
 */
export default async function PosPage({ params }: PosPageProps) {
  const { locale } = await params;
  const t = await getTranslations("pos");
  const tCommon = await getTranslations("common");
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
  if (!canUsePOS(context.member)) {
    return (
      <UnauthorizedState
        locale={locale}
        title={t("unauthorized.title")}
        description={t("unauthorized.description")}
      />
    );
  }
  const businessId = context.business.id;

  const sessionIdentityRow = await loadDashboardIdentityForUser(userId);
  const dash = (v: string | null | undefined) => (v && v.trim() ? v.trim() : tCommon("emDash"));
  const sessionIdentity = {
    userFullName: dash(formatDashboardUserDisplay(locale, sessionIdentityRow.fullName, sessionIdentityRow.fullNameEn)),
    roleLabelAr: dash(sessionIdentityRow.roleLabelAr),
    branchLabelAr: dash(sessionIdentityRow.branchLabelAr),
    businessNameAr: dash(sessionIdentityRow.businessNameAr),
  };

  const categories = await prisma.category.findMany({
    where: { businessId, archivedAt: null },
    select: { id: true, nameAr: true, nameEn: true },
    orderBy: { nameAr: "asc" },
  });

  const products = await prisma.product.findMany({
    where: { businessId, archivedAt: null, isActive: true },
    select: {
      id: true,
      nameAr: true,
      nameEn: true,
      basePrice: true,
      categoryId: true,
    },
    orderBy: [{ category: { nameAr: "asc" } }, { nameAr: "asc" }],
  });

  const popularRows = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      order: {
        businessId,
        status: OrderStatus.COMPLETED,
        archivedAt: null,
      },
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });
  const popularProductIds = popularRows.map((row) => row.productId);

  const recipes = await prisma.recipe.findMany({
    where: { businessId, productId: { in: products.map((product) => product.id) } },
    include: {
      items: {
        include: {
          rawMaterial: {
            select: {
              minimumQuantity: true,
              stock: { select: { balance: true } },
            },
          },
        },
      },
    },
  });

  /**
   * POS stock status for UX only:
   * - out of stock if recipe exists and at least one required material cannot produce one unit.
   * - low stock if estimated producible units are small, or a material is near minimum.
   *
   * This does NOT replace the transactional server-side stock checks at checkout.
   */
  const productStockStatus = new Map<
    string,
    {
      outOfStock: boolean;
      lowStock: boolean;
    }
  >();

  for (const recipe of recipes) {
    if (recipe.items.length === 0) {
      productStockStatus.set(recipe.productId, { outOfStock: false, lowStock: false });
      continue;
    }

    let minProducibleUnits = Number.POSITIVE_INFINITY;
    let hasLowMaterialSignal = false;

    for (const item of recipe.items) {
      const requiredPerProduct = Number(item.quantity);
      const availableBalance = Number(item.rawMaterial.stock?.balance ?? 0);

      if (availableBalance <= item.rawMaterial.minimumQuantity) {
        hasLowMaterialSignal = true;
      }
      if (requiredPerProduct <= 0) {
        continue;
      }

      const producibleUnits = Math.floor(availableBalance / requiredPerProduct);
      minProducibleUnits = Math.min(minProducibleUnits, producibleUnits);
    }

    const normalizedUnits = Number.isFinite(minProducibleUnits) ? minProducibleUnits : 999999;
    productStockStatus.set(recipe.productId, {
      outOfStock: normalizedUnits <= 0,
      lowStock: normalizedUnits > 0 && (normalizedUnits <= 3 || hasLowMaterialSignal),
    });
  }

  return (
    <PosLayout
      locale={locale}
      sessionIdentity={sessionIdentity}
      categories={categories.map((category) => ({
        id: category.id,
        label: localizedCatalogName(locale, category.nameAr, category.nameEn) || t("categories.fallback"),
      }))}
      products={products.map((product) => ({
        id: product.id,
        displayName: localizedCatalogName(locale, product.nameAr, product.nameEn),
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        price: Number(product.basePrice),
        categoryId: product.categoryId,
        imageUrl: null,
        isPopular: popularProductIds.includes(product.id),
        outOfStock: productStockStatus.get(product.id)?.outOfStock ?? false,
        lowStock: productStockStatus.get(product.id)?.lowStock ?? false,
      }))}
    />
  );
}
