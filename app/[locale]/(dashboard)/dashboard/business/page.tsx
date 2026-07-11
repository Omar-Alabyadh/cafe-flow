import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { StatCard } from "@/components/ui/foundations/stat-card";
import { getCurrentUserId } from "@/lib/auth/session";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { getOwnerBusinessForUser } from "@/lib/business/current-business";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@prisma/client";
import Link from "next/link";
import { AlertTriangle, Boxes, Coffee, MonitorPlay, PackagePlus, ShoppingCart, UserPlus } from "lucide-react";
import { redirect } from "next/navigation";
import { FadeIn } from "@/components/ui/motion/fade-in";
import { CreateBusinessForm } from "./create-business-form";
import { BusinessTimeZoneForm } from "./business-time-zone-form";
import { MoneyValue } from "@/components/ui/foundations/money-value";
import { TableDateTimeCell } from "@/components/ui/foundations/table-datetime-cell";
import { formatArabicLatnInteger } from "@/lib/format/numbers";
import { getUtcRangeForLocalDate } from "@/lib/time-zone/day-boundaries";
import { formatDateInputValueInTimeZone } from "@/lib/time-zone/format";
import { getDefaultRouteByRole } from "@/lib/authorization/role-access";
import { isPlatformOperator } from "@/lib/platform/require-platform-operator";
import { getTranslations } from "next-intl/server";
import { localizedCatalogName } from "@/lib/i18n/localized-catalog-name";
import { getPaymentFinancialReport } from "@/lib/finance/payment-financial-reports";

type BusinessPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.page");
  const userId = await getCurrentUserId();
  if (!userId) redirect(`/${locale}/sign-in`);

  const business = await getOwnerBusinessForUser(userId);
  if (!business) {
    try {
      const staffContext = await getCurrentBusinessMemberContext(userId);
      /**
       * Owner onboarding must never appear to staff users.
       * If a staff user opens `/dashboard/business` directly, send them to a real work page.
       */
      redirect(`/${locale}${getDefaultRouteByRole(staffContext.member.role)}`);
    } catch (error) {
      if (isBusinessContextSelectionError(error)) {
        /**
         * `NO_ACTIVE_MEMBERSHIP` means a new account with no active staff membership (owner onboarding path).
         * Other business selection errors redirect to the selection page to avoid showing owner onboarding to staff users.
         */
        if (error.code === "NO_ACTIVE_MEMBERSHIP") {
          /**
           * SaaS platform owners authenticate with the same app but must not use the tenant
           * “create business” onboarding — their console lives under `/dashboard/platform`.
           */
          if (await isPlatformOperator(userId)) {
            redirect(`/${locale}/dashboard/platform`);
          }
          return (
            <PageContainer>
              <SectionHeader title={t("onboardingTitle")} description={t("onboardingDescription")} />
              <CreateBusinessForm locale={locale} />
            </PageContainer>
          );
        }
        redirect(`/${locale}/dashboard/select-business`);
      }
      throw error;
    }
  }

  const businessId = business.id;
  const businessDisplayName = localizedCatalogName(locale, business.nameAr, business.nameEn);
  const operationalTimeZone = business.timeZone;

  const todayRange = getUtcRangeForLocalDate({
    date: formatDateInputValueInTimeZone(new Date(), operationalTimeZone),
    timeZone: operationalTimeZone,
  });
  const todayStart = todayRange?.startUtc ?? new Date(0);
  const tomorrowStart = todayRange?.nextDayStartUtc ?? new Date();

  const [
    staffCount,
    activeSellableProductsCount,
    lowStockRows,
    topProducts,
    activeOrdersCount,
    activeOrdersRows,
    todayOrdersCount,
    completedOrdersCount,
    emptyDraftOrdersCount,
  ] = await Promise.all([
    prisma.membership.count({ where: { businessId, archivedAt: null } }),
    // Business meaning: this counts products available for sale now.
    prisma.product.count({ where: { businessId, archivedAt: null, isActive: true } }),
    prisma.rawMaterial.findMany({
      where: { businessId, archivedAt: null },
      include: { stock: true },
    }),
    // Business meaning: top-selling uses completed sales only.
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: { businessId, archivedAt: null, status: "COMPLETED" } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    /**
     * Metric definition:
     * "active orders" = all incomplete orders (empty draft, draft with items, or in-progress).
     */
    prisma.order.count({
      where: {
        businessId,
        archivedAt: null,
        status: { in: [OrderStatus.DRAFT, OrderStatus.IN_PROGRESS] },
      },
    }),
    prisma.order.findMany({
      where: {
        businessId,
        archivedAt: null,
        status: { in: [OrderStatus.DRAFT, OrderStatus.IN_PROGRESS] },
      },
      include: {
        _count: { select: { items: true } },
        items: {
          include: {
            product: {
              include: {
                recipe: { include: { items: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    // Metric definition: all orders created today regardless of status.
    prisma.order.count({
      where: { businessId, archivedAt: null, createdAt: { gte: todayStart, lt: tomorrowStart } },
    }),
    // Metric definition: completed orders only (all time).
    prisma.order.count({
      where: { businessId, archivedAt: null, status: "COMPLETED" },
    }),
    prisma.order.count({
      where: { businessId, archivedAt: null, status: "DRAFT", items: { none: {} } },
    }),
  ]);

  const topProductIds = topProducts.map((p) => p.productId);
  const topProductRows = topProductIds.length
    ? await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, nameAr: true },
      })
    : [];
  const topProductMap = new Map(topProductRows.map((p) => [p.id, p.nameAr]));

  const todayFinancialReport = await getPaymentFinancialReport({ businessId, currency: business.defaultCurrency, startUtc: todayStart, endUtc: tomorrowStart });
  const todayRevenueAmount = todayFinancialReport.totalSales.toString();

  const lowStockCount = lowStockRows.filter((m) => {
    if (m.minimumQuantity <= 0) return false;
    const balance = m.stock ? new Prisma.Decimal(m.stock.balance.toString()) : new Prisma.Decimal(0);
    return balance.lt(new Prisma.Decimal(m.minimumQuantity));
  }).length;

  /**
   * Operational alert logic:
   * detects draft orders that cannot be completed due to insufficient stock
   * based on recipe material requirements and current stock balances.
   */
  const stockByMaterialId = new Map(
    lowStockRows.map((m) => [
      m.id,
      m.stock ? new Prisma.Decimal(m.stock.balance.toString()) : new Prisma.Decimal(0),
    ]),
  );

  let draftOrdersBlockedByStock = 0;
  for (const order of activeOrdersRows) {
    if (order.items.length === 0) continue;

    const requiredByMaterial = new Map<string, Prisma.Decimal>();
    let orderHasStockIssue = false;

    for (const item of order.items) {
      const recipeItems = item.product.recipe?.items ?? [];
      for (const recipeItem of recipeItems) {
        const required = new Prisma.Decimal(recipeItem.quantity.toString()).mul(
          new Prisma.Decimal(item.quantity.toString()),
        );
        const current = requiredByMaterial.get(recipeItem.rawMaterialId) ?? new Prisma.Decimal(0);
        requiredByMaterial.set(recipeItem.rawMaterialId, current.add(required));
      }
    }

    for (const [materialId, required] of requiredByMaterial.entries()) {
      const available = stockByMaterialId.get(materialId) ?? new Prisma.Decimal(0);
      if (required.gt(available)) {
        orderHasStockIssue = true;
        break;
      }
    }

    if (orderHasStockIssue) draftOrdersBlockedByStock += 1;
  }

  const hasOperationalIssue = draftOrdersBlockedByStock > 0 || emptyDraftOrdersCount > 0;
  const operationalAlertText =
    draftOrdersBlockedByStock > 0
      ? t("operationalAlertBlockedStock")
      : emptyDraftOrdersCount > 0
        ? t("operationalAlertEmptyDraft")
        : t("operationalAlertOk");

  return (
    <PageContainer>
      <FadeIn>
        <div className="cf-surface mb-3 rounded-xl p-4">
          <SectionHeader title={businessDisplayName} description={t("heroDescription")} />
        </div>
      </FadeIn>

      <div className="mb-5">
        <p className="mb-2 text-sm font-semibold">{t("quickActionsTitle")}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Link
            className="inline-flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40"
            href={`/${locale}/dashboard/business/pos`}
          >
            <span className="flex items-center gap-2">
              <MonitorPlay className="h-4 w-4 text-emerald-600" />
              {t("actions.posTitle")}
            </span>
            <span className="text-xs text-zinc-600 dark:text-zinc-300">{t("actions.posHint")}</span>
          </Link>
          <Link
            className="inline-flex items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            href={`/${locale}/dashboard/business/orders`}
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-emerald-500" />
              {t("actions.ordersTitle")}
            </span>
            <span className="text-xs text-zinc-600 dark:text-zinc-300">{t("actions.ordersHint")}</span>
          </Link>
          <Link
            className="inline-flex items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            href={`/${locale}/dashboard/business/products`}
          >
            <span className="flex items-center gap-2">
              <PackagePlus className="h-4 w-4 text-emerald-500" />
              {t("actions.productsTitle")}
            </span>
            <span className="text-xs text-zinc-600 dark:text-zinc-300">{t("actions.productsHint")}</span>
          </Link>
          <Link
            className="inline-flex items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            href={`/${locale}/dashboard/business/raw-materials`}
          >
            <span className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-emerald-500" />
              {t("actions.rawMaterialsTitle")}
            </span>
            <span className="text-xs text-zinc-600 dark:text-zinc-300">{t("actions.rawMaterialsHint")}</span>
          </Link>
          <Link
            className="inline-flex items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            href={`/${locale}/dashboard/business/staff`}
          >
            <span className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-emerald-500" />
              {t("actions.staffTitle")}
            </span>
            <span className="text-xs text-zinc-600 dark:text-zinc-300">{t("actions.staffHint")}</span>
          </Link>
        </div>
      </div>

      <div className="mb-5">
        <BusinessTimeZoneForm locale={locale} currentTimeZone={operationalTimeZone} />
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("stats.todayOrdersLabel")}
          value={formatArabicLatnInteger(todayOrdersCount)}
          helperText={t("stats.todayOrdersHelper")}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatCard
          label={t("stats.activeOrdersLabel")}
          value={formatArabicLatnInteger(activeOrdersCount)}
          helperText={t("stats.activeOrdersHelper")}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatCard
          label={t("stats.completedOrdersLabel")}
          value={formatArabicLatnInteger(completedOrdersCount)}
          helperText={t("stats.completedOrdersHelper")}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatCard
          label={t("stats.todayRevenueLabel")}
          value={<MoneyValue amount={todayRevenueAmount} size="lg" />}
          helperText={t("stats.todayRevenueHelper")}
          icon={<Coffee className="h-4 w-4" />}
        />
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label={t("stats.sellableProductsLabel")}
          value={formatArabicLatnInteger(activeSellableProductsCount)}
          helperText={t("stats.sellableProductsHelper")}
        />
        <StatCard
          label={t("stats.staffMembersLabel")}
          value={formatArabicLatnInteger(staffCount)}
          helperText={t("stats.activeStaffHelper", { count: staffCount })}
        />
        <div
          className={`rounded-xl border p-1 ${
            lowStockCount > 0
              ? "border-red-300 bg-red-50/80 dark:border-red-800 dark:bg-red-950/30"
              : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          }`}
        >
          <StatCard
            label={t("stats.inventoryAlertsLabel")}
            value={formatArabicLatnInteger(lowStockCount)}
            helperText={
              lowStockCount > 0 ? t("stats.inventoryAlertsHelperHigh") : t("stats.inventoryAlertsHelperOk")
            }
            icon={
              <AlertTriangle
                className={`h-4 w-4 ${lowStockCount > 0 ? "text-red-500" : "text-zinc-400"}`}
              />
            }
          />
        </div>
      </div>

      <div
        className={`mb-5 rounded-xl border p-4 ${
          hasOperationalIssue
            ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
            : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        }`}
      >
        <p className="text-sm font-semibold">{t("operationalAlertsTitle")}</p>
        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{operationalAlertText}</p>
      </div>

      <div className="mb-5 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-3 text-sm font-semibold">{t("ordersInProgressTitle")}</p>
        <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">{t("ordersInProgressHint")}</p>
        {activeOrdersRows.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("ordersInProgressEmpty")}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-muted text-foreground">
                <tr>
                  <th className="px-3 py-2 text-start font-semibold">{t("table.orderId")}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t("table.operationalStatus")}</th>
                  <th className="px-3 py-2 text-right font-semibold">{t("table.items")}</th>
                  <th className="px-3 py-2 text-right font-semibold">{t("table.createdAt")}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t("table.action")}</th>
                </tr>
              </thead>
              <tbody>
                {activeOrdersRows.map((o) => {
                  const rowLabel = o._count.items === 0 ? t("rowEmptyDraft") : t("rowPreparing");
                  const rowBadgeClass =
                    o._count.items === 0
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                      : "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300";

                  return (
                    <tr key={o.id} className="border-t border-zinc-200 dark:border-zinc-800">
                      <td className="px-3 py-2 font-mono text-xs">{o.id.slice(0, 10)}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${rowBadgeClass}`}>
                          {rowLabel}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatArabicLatnInteger(o._count.items)}</td>
                      <td className="px-3 py-2">
                        <TableDateTimeCell at={o.createdAt} timeZone={operationalTimeZone} locale={locale} />
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/${locale}/dashboard/business/orders/${o.id}`}
                          className="inline-flex rounded-md border border-zinc-300 px-2 py-1 text-xs transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        >
                          {t("openOrder")}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-3 text-sm font-semibold">{t("topSellingTitle")}</p>
        {topProducts.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("topSellingEmpty")}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {topProducts.map((row) => {
              const soldCount = Number(row._sum.quantity ?? 0);
              return (
                <li
                  key={row.productId}
                  className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-950"
                >
                  <span className="tabular-nums">
                    {topProductMap.get(row.productId) ?? t("unavailableProduct")} —{" "}
                    {t("soldUnitsLabel", { count: soldCount })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PageContainer>
  );
}
