import { MoneyValue } from "@/components/ui/foundations/money-value";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { StatCard } from "@/components/ui/foundations/stat-card";
import { TableDateTimeCell } from "@/components/ui/foundations/table-datetime-cell";
import { formatArabicLatnInteger } from "@/lib/format/numbers";
import { prisma } from "@/lib/prisma";
import { PaymentRequestStatus, Prisma, SubscriptionStatus } from "@prisma/client";
import { Banknote, CircleDollarSign, CreditCard, PiggyBank } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

type PageProps = { params: Promise<{ locale: string }> };

function num(v: unknown): number {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Operator finance console: subscription rows, payment requests, catalog plan prices,
 * and a coarse “tenant POS” GMV from completed order lines (quantity × product base price).
 * All figures are read-only snapshots for supervision and graduation demos.
 */
export default async function PlatformFinancePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("platform.finance");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [
    subscriptionByStatus,
    paymentByStatus,
    recentPayments,
    plans,
    activeSubCount,
    gmvAllTime,
    gmv30d,
  ] = await Promise.all([
    prisma.subscription.groupBy({
      by: ["status"],
      where: { archivedAt: null },
      _sum: { chargedAmount: true, monthlyPrice: true },
      _count: true,
    }),
    prisma.paymentRequest.groupBy({
      by: ["status"],
      where: { subscription: { archivedAt: null } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.paymentRequest.findMany({
      where: { subscription: { archivedAt: null } },
      orderBy: { createdAt: "desc" },
      take: 45,
      include: {
        subscription: {
          include: {
            business: { select: { nameAr: true, code: true } },
            plan: { select: { nameAr: true } },
          },
        },
      },
    }),
    prisma.plan.findMany({
      where: {},
      orderBy: { price: "asc" },
      include: {
        _count: {
          select: {
            subscriptions: { where: { archivedAt: null } },
          },
        },
      },
    }),
    prisma.subscription.count({ where: { archivedAt: null } }),
    prisma.$queryRaw<{ total: unknown }[]>(Prisma.sql`
      SELECT COALESCE(SUM(oi.quantity * p."basePrice"), 0) AS total
      FROM "OrderItem" oi
      INNER JOIN "Order" o ON oi."orderId" = o.id
      INNER JOIN "Product" p ON oi."productId" = p.id
      WHERE o.status = 'COMPLETED'
        AND o."archivedAt" IS NULL
        AND o."completedAt" IS NOT NULL
    `),
    prisma.$queryRaw<{ total: unknown }[]>(Prisma.sql`
      SELECT COALESCE(SUM(oi.quantity * p."basePrice"), 0) AS total
      FROM "OrderItem" oi
      INNER JOIN "Order" o ON oi."orderId" = o.id
      INNER JOIN "Product" p ON oi."productId" = p.id
      WHERE o.status = 'COMPLETED'
        AND o."archivedAt" IS NULL
        AND o."completedAt" IS NOT NULL
        AND o."completedAt" >= ${thirtyDaysAgo}
    `),
  ]);

  const totalChargedAcrossSubs = subscriptionByStatus.reduce((s, row) => s + num(row._sum.chargedAmount), 0);
  const totalMonthlyPriceActiveTrialing = subscriptionByStatus
    .filter((r) => r.status === SubscriptionStatus.ACTIVE || r.status === SubscriptionStatus.TRIALING)
    .reduce((s, r) => s + num(r._sum.monthlyPrice), 0);

  const paidPaymentsTotal = paymentByStatus
    .filter((r) => r.status === PaymentRequestStatus.PAID)
    .reduce((s, r) => s + num(r._sum.amount), 0);
  const pendingPaymentsTotal = paymentByStatus
    .filter((r) => r.status === PaymentRequestStatus.PENDING)
    .reduce((s, r) => s + num(r._sum.amount), 0);

  const subStatusLabel = (status: SubscriptionStatus) => {
    switch (status) {
      case "ACTIVE":
        return t("subscriptionStatus.ACTIVE");
      case "TRIALING":
        return t("subscriptionStatus.TRIALING");
      case "PENDING_PAYMENT":
        return t("subscriptionStatus.PENDING_PAYMENT");
      case "PAST_DUE":
        return t("subscriptionStatus.PAST_DUE");
      case "CANCELED":
        return t("subscriptionStatus.CANCELED");
      case "EXPIRED":
        return t("subscriptionStatus.EXPIRED");
      default:
        return status;
    }
  };

  const payStatusLabel = (status: PaymentRequestStatus) => {
    switch (status) {
      case "PAID":
        return t("paymentStatus.PAID");
      case "PENDING":
        return t("paymentStatus.PENDING");
      case "FAILED":
        return t("paymentStatus.FAILED");
      case "CANCELED":
        return t("paymentStatus.CANCELED");
      default:
        return status;
    }
  };

  return (
    <PageContainer>
      <SectionHeader title={t("title")} description={t("description")} />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={`/${locale}/dashboard/platform`}
          className="inline-flex rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
        >
          {t("backPlatform")}
        </Link>
        <Link
          href={`/${locale}/dashboard/platform/reports`}
          className="inline-flex rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
        >
          {t("openReports")}
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("cards.activeSubscriptions")}
          value={formatArabicLatnInteger(activeSubCount)}
          icon={<CircleDollarSign className="h-4 w-4" />}
        />
        <StatCard
          label={t("cards.recordedSubscriptionCharges")}
          value={<MoneyValue amount={totalChargedAcrossSubs} size="lg" />}
          helperText={t("cards.recordedSubscriptionChargesHint")}
          icon={<PiggyBank className="h-4 w-4" />}
        />
        <StatCard
          label={t("cards.pendingPaymentRequests")}
          value={<MoneyValue amount={pendingPaymentsTotal} size="lg" />}
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          label={t("cards.paidPaymentRequests")}
          value={<MoneyValue amount={paidPaymentsTotal} size="lg" />}
          helperText={t("cards.paidPaymentRequestsHint")}
          icon={<Banknote className="h-4 w-4" />}
        />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold">{t("gmv.title")}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("gmv.hint")}</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-950">
              <dt>{t("gmv.allTime")}</dt>
              <dd>
                <MoneyValue amount={num(gmvAllTime[0]?.total)} size="md" />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-950">
              <dt>{t("gmv.last30Days")}</dt>
              <dd>
                <MoneyValue amount={num(gmv30d[0]?.total)} size="md" />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-950">
              <dt>{t("gmv.mrrHintLabel")}</dt>
              <dd>
                <MoneyValue amount={totalMonthlyPriceActiveTrialing} size="md" />
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold">{t("paymentMix.title")}</p>
          <ul className="mt-3 space-y-2 text-sm">
            {paymentByStatus.map((row) => (
              <li
                key={row.status}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800"
              >
                <span>{payStatusLabel(row.status)}</span>
                <span className="font-medium">
                  <MoneyValue amount={num(row._sum.amount)} size="sm" /> · {formatArabicLatnInteger(row._count)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-3 text-sm font-semibold">{t("subscriptionsByStatus.title")}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">{t("subscriptionsByStatus.status")}</th>
                <th className="px-3 py-2 text-end font-semibold">{t("subscriptionsByStatus.count")}</th>
                <th className="px-3 py-2 text-end font-semibold">{t("subscriptionsByStatus.charged")}</th>
                <th className="px-3 py-2 text-end font-semibold">{t("subscriptionsByStatus.monthlyPrice")}</th>
              </tr>
            </thead>
            <tbody>
              {subscriptionByStatus.map((row) => (
                <tr key={row.status} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-3 py-2">{subStatusLabel(row.status)}</td>
                  <td className="px-3 py-2 text-end">{formatArabicLatnInteger(row._count)}</td>
                  <td className="px-3 py-2 text-end">
                    <MoneyValue amount={num(row._sum.chargedAmount)} size="sm" />
                  </td>
                  <td className="px-3 py-2 text-end">
                    <MoneyValue amount={num(row._sum.monthlyPrice)} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-3 text-sm font-semibold">{t("plans.title")}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">{t("plans.code")}</th>
                <th className="px-3 py-2 text-start font-semibold">{t("plans.name")}</th>
                <th className="px-3 py-2 text-end font-semibold">{t("plans.listPrice")}</th>
                <th className="px-3 py-2 text-end font-semibold">{t("plans.branchLimit")}</th>
                <th className="px-3 py-2 text-end font-semibold">{t("plans.staffLimit")}</th>
                <th className="px-3 py-2 text-end font-semibold">{t("plans.activeSubs")}</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-3 py-2 font-mono text-xs">{plan.code}</td>
                  <td className="px-3 py-2">{locale === "en" ? plan.nameEn : plan.nameAr}</td>
                  <td className="px-3 py-2 text-end">
                    <MoneyValue amount={Number(plan.price)} size="sm" />
                  </td>
                  <td className="px-3 py-2 text-end">{formatArabicLatnInteger(plan.branchLimit)}</td>
                  <td className="px-3 py-2 text-end">{formatArabicLatnInteger(plan.staffLimit)}</td>
                  <td className="px-3 py-2 text-end">{formatArabicLatnInteger(plan._count.subscriptions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cf-surface overflow-x-auto rounded-xl p-2">
        <p className="mb-2 px-2 text-sm font-semibold">{t("recentPayments.title")}</p>
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted text-foreground">
            <tr>
              <th className="px-3 py-2 text-start font-semibold">{t("recentPayments.when")}</th>
              <th className="px-3 py-2 text-start font-semibold">{t("recentPayments.business")}</th>
              <th className="px-3 py-2 text-start font-semibold">{t("recentPayments.plan")}</th>
              <th className="px-3 py-2 text-end font-semibold">{t("recentPayments.amount")}</th>
              <th className="px-3 py-2 text-start font-semibold">{t("recentPayments.status")}</th>
              <th className="px-3 py-2 text-start font-semibold">{t("recentPayments.provider")}</th>
            </tr>
          </thead>
          <tbody>
            {recentPayments.map((pr) => (
              <tr key={pr.id} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-3 py-2">
                  <TableDateTimeCell at={pr.createdAt} />
                </td>
                <td className="px-3 py-2">
                  {pr.subscription.business.nameAr}
                  <div className="text-xs text-zinc-500">{pr.subscription.business.code}</div>
                </td>
                <td className="px-3 py-2">{pr.subscription.plan.nameAr}</td>
                <td className="px-3 py-2 text-end">
                  <MoneyValue amount={Number(pr.amount)} size="sm" />
                </td>
                <td className="px-3 py-2">{payStatusLabel(pr.status)}</td>
                <td className="px-3 py-2 text-xs">{pr.provider}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {recentPayments.length === 0 ? <p className="px-2 py-4 text-sm text-zinc-500">{t("recentPayments.empty")}</p> : null}
      </div>
    </PageContainer>
  );
}
