import { EmptyState } from "@/components/ui/foundations/empty-state";
import { OrdersWeekChart } from "@/components/dashboard/orders-week-chart";
import { MoneyValue } from "@/components/ui/foundations/money-value";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { StatCard } from "@/components/ui/foundations/stat-card";
import { getCurrentUserId } from "@/lib/auth/session";
import { resolvePostSignInDestination } from "@/lib/auth/post-sign-in-route";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { formatDateLine } from "@/lib/format/arabic-datetime";
import { formatArabicLatnInteger } from "@/lib/format/numbers";
import { getUtcRangeForLocalDate } from "@/lib/time-zone/day-boundaries";
import { formatDateInputValueInTimeZone } from "@/lib/time-zone/format";
import { prisma } from "@/lib/prisma";
import { localizedCatalogName } from "@/lib/i18n/localized-catalog-name";
import { getPaymentFinancialReport } from "@/lib/finance/payment-financial-reports";
import { getCurrentBusinessSubscription } from "@/lib/subscription/business-subscription";
import { getActiveBusinessCookie } from "@/lib/tenant/active-business-cookie";
import { Coffee, ShoppingCart, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";


type DashboardHomeProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardHomePage({ params }: DashboardHomeProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard");
  const homeT = await getTranslations("dashboard.home");

  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(`/${locale}/sign-in?callbackUrl=/${locale}/dashboard`);
  }

  const preferredBusinessId = await getActiveBusinessCookie();
  const routing = await resolvePostSignInDestination(userId, locale, preferredBusinessId);
  if (routing.destination !== `/${locale}/dashboard`) {
    redirect(routing.destination);
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

  const business = await prisma.business.findFirst({
    where: { id: context.business.id, archivedAt: null },
    select: { id: true, nameAr: true, nameEn: true },
  });

  if (!business) {
    return (
      <PageContainer>
        <SectionHeader title={t("title")} description={t("description")} />
        <EmptyState
          title={t("emptyNoContextTitle")}
          description={t("emptyNoContextDescription")}
          action={
            <Link
              href={`/${locale}/dashboard`}
              className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              {t("emptyNoContextAction")}
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const operationalTimeZone = context.operationalTimeZone;
  const todayKey = formatDateInputValueInTimeZone(new Date(), operationalTimeZone);
  const todayRange = getUtcRangeForLocalDate({ date: todayKey, timeZone: operationalTimeZone });
  const todayStart = todayRange?.startUtc ?? new Date(0);
  const tomorrowStart = todayRange?.nextDayStartUtc ?? new Date();
  const chartDateKeys = Array.from({ length: 7 }).map((_, index) => {
    const base = new Date(`${todayKey}T12:00:00Z`);
    base.setUTCDate(base.getUTCDate() - (6 - index));
    return base.toISOString().slice(0, 10);
  });
  const firstChartRange = getUtcRangeForLocalDate({ date: chartDateKeys[0], timeZone: operationalTimeZone });
  const startOfWeek = firstChartRange?.startUtc ?? todayStart;

  const [staffCount, totalOrdersToday, totalOrdersAllTime, totalProductsCount, lowStockRows, currentSubscription, ordersLastWeek, recentOrders] =
    await Promise.all([
      prisma.membership.count({ where: { businessId: business.id, archivedAt: null } }),
      prisma.order.count({
        where: {
          businessId: business.id,
          archivedAt: null,
          createdAt: { gte: todayStart, lt: tomorrowStart },
        },
      }),
      prisma.order.count({ where: { businessId: business.id, archivedAt: null } }),
      prisma.product.count({ where: { businessId: business.id, archivedAt: null } }),
      prisma.rawMaterial.findMany({ where: { businessId: business.id, archivedAt: null }, include: { stock: true } }),
      getCurrentBusinessSubscription(business.id),
      prisma.order.findMany({
        where: { businessId: business.id, archivedAt: null, createdAt: { gte: startOfWeek } },
        select: { createdAt: true },
      }),
      prisma.order.findMany({
        where: { businessId: business.id, archivedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { items: true } } },
      }),
    ]);

  const todayFinancialReport = await getPaymentFinancialReport({ businessId: context.business.id, currency: context.business.defaultCurrency, startUtc: todayStart, endUtc: tomorrowStart });
  const totalRevenueToday = todayFinancialReport.totalSales.toString();

  const lowStockCount = lowStockRows.filter((material) => {
    if (material.minimumQuantity <= 0) return false;
    const balance = material.stock ? Number(material.stock.balance) : 0;
    return balance < material.minimumQuantity;
  }).length;

  const weekDays = [
    homeT("weekdays.sunday"),
    homeT("weekdays.monday"),
    homeT("weekdays.tuesday"),
    homeT("weekdays.wednesday"),
    homeT("weekdays.thursday"),
    homeT("weekdays.friday"),
    homeT("weekdays.saturday"),
  ];

  const weeklyOrdersData = Array.from({ length: 7 }).map((_, index) => {
    const dateKey = chartDateKeys[index];
    const range = getUtcRangeForLocalDate({ date: dateKey, timeZone: operationalTimeZone });
    const dayStart = range?.startUtc ?? new Date(0);
    const nextDayStart = range?.nextDayStartUtc ?? new Date(0);
    const weekday = new Date(`${dateKey}T12:00:00Z`).getUTCDay();

    const ordersCount = ordersLastWeek.filter((row) => row.createdAt >= dayStart && row.createdAt < nextDayStart).length;
    return { day: weekDays[weekday], orders: ordersCount };
  });

  const weeklyOrdersTotal = weeklyOrdersData.reduce((sum, row) => sum + row.orders, 0);
  const avgRevenuePerOrderToday = totalOrdersToday > 0 ? Number(todayFinancialReport.totalSales.div(totalOrdersToday).toString()) : 0;

  return (
    <PageContainer>
      <SectionHeader
        title={homeT("heading", { business: localizedCatalogName(locale, business.nameAr, business.nameEn) })}
        description={homeT("subheading")}
      />

      <div className="mb-6 grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label={homeT("cards.ordersToday")} value={formatArabicLatnInteger(totalOrdersToday)} helperText={homeT("cards.ordersTodayHint")} icon={<ShoppingCart className="h-4 w-4" />} />
        <StatCard label={homeT("cards.revenueToday")} value={<MoneyValue amount={totalRevenueToday} size="lg" />} helperText={homeT("cards.revenueTodayHint")} icon={<Coffee className="h-4 w-4" />} />
        <StatCard label={homeT("cards.totalOrders")} value={formatArabicLatnInteger(totalOrdersAllTime)} helperText={homeT("cards.totalOrdersHint")} icon={<ShoppingCart className="h-4 w-4" />} />
        <StatCard label={homeT("cards.products")} value={formatArabicLatnInteger(totalProductsCount)} helperText={homeT("cards.productsHint")} icon={<Coffee className="h-4 w-4" />} />
        <StatCard label={homeT("cards.lowStock")} value={formatArabicLatnInteger(lowStockCount)} helperText={lowStockCount > 0 ? homeT("cards.lowStockWarn") : homeT("cards.lowStockOk")} />
        <StatCard label={homeT("cards.staff")} value={formatArabicLatnInteger(staffCount)} helperText={homeT("cards.staffHint")} icon={<Users className="h-4 w-4" />} />
      </div>

      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <div>
            <p className="text-sm font-semibold">{homeT("weeklyChart.title")}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{homeT("weeklyChart.hint")}</p>
          </div>
          <p className="text-sm font-medium">{homeT("weeklyChart.total", { total: formatArabicLatnInteger(weeklyOrdersTotal) })}</p>
        </div>

        {ordersLastWeek.length > 0 ? (
          <OrdersWeekChart data={weeklyOrdersData} />
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            {homeT("weeklyChart.empty")}
          </div>
        )}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-sm font-semibold">{homeT("insights.title")}</p>
          <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li className="rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-950">{homeT("insights.ordersToday", { count: formatArabicLatnInteger(totalOrdersToday) })}</li>
            <li className="rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-950">{homeT("insights.avgOrderValue")} <MoneyValue amount={avgRevenuePerOrderToday} size="sm" /></li>
            <li className="rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-950">{homeT("insights.lowStock", { count: formatArabicLatnInteger(lowStockCount) })}</li>
          </ul>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold">{homeT("subscription.title")}</p>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">{homeT("subscription.status")}: {currentSubscription ? currentSubscription.status : "-"}</p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{homeT("subscription.plan")}: {currentSubscription?.planNameAr ?? "-"}</p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{homeT("subscription.trialEnds")}: {currentSubscription?.trialEndsAt ? formatDateLine(currentSubscription.trialEndsAt, operationalTimeZone, locale) : "-"}</p>
          <Link href={`/${locale}/pricing`} className="mt-3 inline-flex rounded-md border border-zinc-300 px-4 py-1.5 text-sm dark:border-zinc-700">
            {homeT("subscription.manage")}
          </Link>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-3 text-sm font-semibold">{homeT("recentOrders.title")}</p>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-zinc-500">{homeT("recentOrders.empty")}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {recentOrders.map((order) => (
              <li key={order.id} className="rounded-lg border border-zinc-200 p-2.5 dark:border-zinc-800">
                <p className="font-mono text-xs text-zinc-600 dark:text-zinc-300">#{order.id.slice(0, 10)}</p>
                <p>{homeT("recentOrders.items", { count: formatArabicLatnInteger(order._count.items) })}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium">{homeT("quickLinks.title")}</p>
        <ul className="mt-2 flex flex-wrap gap-4 text-sm">
          <li><Link className="underline" href={`/${locale}/dashboard/business/reports`}>{homeT("quickLinks.reports")}</Link></li>
          <li><Link className="underline" href={`/${locale}/dashboard/business`}>{homeT("quickLinks.business")}</Link></li>
          {routing.kind === "platform" ? (
            <li><Link className="underline" href={`/${locale}/dashboard/platform`}>{homeT("quickLinks.platform")}</Link></li>
          ) : null}
        </ul>
      </div>
    </PageContainer>
  );
}
