import { MoneyValue } from "@/components/ui/foundations/money-value";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { StatCard } from "@/components/ui/foundations/stat-card";
import { TableDateTimeCell } from "@/components/ui/foundations/table-datetime-cell";
import { formatDateLine } from "@/lib/format/arabic-datetime";
import { formatArabicLatnInteger } from "@/lib/format/numbers";
import { prisma } from "@/lib/prisma";
import { requestTimeMs } from "@/lib/time/request-ms";
import { SubscriptionStatus } from "@prisma/client";
import { Activity, BarChart3, Building2, CircleDollarSign, ShieldCheck, Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

type PageProps = { params: Promise<{ locale: string }> };

export default async function PlatformDashboardPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("platform.dashboard");

  const [totalBusinesses, totalSubscriptions, businesses, businessesWithoutPlan] = await Promise.all([
    prisma.business.count({ where: { archivedAt: null } }),
    prisma.subscription.count({ where: { archivedAt: null } }),
    prisma.business.findMany({
      where: { archivedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { fullName: true, email: true } },
        subscriptions: {
          where: { archivedAt: null },
          include: {
            plan: true,
            paymentRequests: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      take: 100,
    }),
    prisma.business.count({ where: { archivedAt: null, subscriptions: { none: { archivedAt: null } } } }),
  ]);

  const byState: Record<SubscriptionStatus, number> = {
    TRIALING: 0,
    ACTIVE: 0,
    PENDING_PAYMENT: 0,
    EXPIRED: 0,
    CANCELED: 0,
    PAST_DUE: 0,
  };

  for (const business of businesses) {
    const current = business.subscriptions[0];
    if (current) byState[current.status] += 1;
  }

  const requestNowMs = requestTimeMs();
  const statusLabel = (status: SubscriptionStatus) => t(`status.${status}`);

  const trialSummary = (trialEndsAt: Date | null): string => {
    if (!trialEndsAt) return t("trial.none");
    const end = trialEndsAt.getTime();
    if (end < requestNowMs) return t("trial.expired", { date: formatDateLine(trialEndsAt) });
    const daysLeft = Math.max(0, Math.ceil((end - requestNowMs) / 86_400_000));
    return t("trial.active", { date: formatDateLine(trialEndsAt), days: formatArabicLatnInteger(daysLeft) });
  };

  return (
    <PageContainer>
      <SectionHeader title={t("title")} description={t("description")} />

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Link
          href={`/${locale}/dashboard/platform/finance`}
          className="cf-surface flex flex-col gap-2 rounded-xl border border-emerald-200/80 p-4 transition hover:border-emerald-400 dark:border-emerald-900/40 dark:hover:border-emerald-700"
        >
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
            <Wallet className="h-3.5 w-3.5" aria-hidden />
            {t("quickNav.financeTitle")}
          </span>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("quickNav.financeDescription")}</p>
          <span className="text-sm font-semibold text-emerald-800 underline-offset-2 hover:underline dark:text-emerald-300">
            {t("quickNav.financeCta")}
          </span>
        </Link>
        <Link
          href={`/${locale}/dashboard/platform/reports`}
          className="cf-surface flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
        >
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
            <BarChart3 className="h-3.5 w-3.5" aria-hidden />
            {t("quickNav.reportsTitle")}
          </span>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("quickNav.reportsDescription")}</p>
          <span className="text-sm font-semibold text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100">
            {t("quickNav.reportsCta")}
          </span>
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("cards.businesses")} value={formatArabicLatnInteger(totalBusinesses)} icon={<Building2 className="h-4 w-4" />} />
        <StatCard label={t("cards.subscriptions")} value={formatArabicLatnInteger(totalSubscriptions)} icon={<CircleDollarSign className="h-4 w-4" />} />
        <StatCard label={t("cards.trialing")} value={formatArabicLatnInteger(byState.TRIALING)} icon={<Activity className="h-4 w-4" />} />
        <StatCard label={t("cards.active")} value={formatArabicLatnInteger(byState.ACTIVE)} icon={<ShieldCheck className="h-4 w-4" />} />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label={t("cards.pastDue")} value={formatArabicLatnInteger(byState.PAST_DUE)} />
        <StatCard label={t("cards.expired")} value={formatArabicLatnInteger(byState.EXPIRED)} />
        <StatCard label={t("cards.canceled")} value={formatArabicLatnInteger(byState.CANCELED)} />
        <StatCard label={t("cards.withoutPlan")} value={formatArabicLatnInteger(businessesWithoutPlan)} />
      </div>

      <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("landingManager.title")}</p>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{t("landingManager.description")}</p>
        <Link href={`/${locale}/dashboard/platform/content/landing`} className="mt-3 inline-flex rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700">
          {t("landingManager.action")}
        </Link>
      </div>

      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">{t("listHint")}</p>

      <div className="mb-8 grid gap-4">
        {businesses.slice(0, 12).map((business) => {
          const current = business.subscriptions[0];
          if (!current) {
            return (
              <div key={business.id} className="cf-surface rounded-xl p-4">
                <p className="text-sm font-semibold">{business.nameAr}</p>
                <p className="mt-1 text-xs text-zinc-500">{t("fields.businessCode")}: {business.code}</p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{t("noSubscription")}</p>
                <p className="mt-1 text-xs text-zinc-500">{t("fields.owner")}: {business.owner.fullName} ({business.owner.email})</p>
              </div>
            );
          }

          const latestPayment = current.paymentRequests[0];
          const isTrialing = current.status === "TRIALING";
          const currentCycle = current.billingCycle === "YEARLY" ? t("billing.yearly") : t("billing.monthly");

          return (
            <div key={business.id} className="cf-surface rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{business.nameAr}</p>
                  <p className="text-xs text-zinc-500">{t("fields.businessCode")}: {business.code}</p>
                </div>
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
                  {t("fields.status")}: {statusLabel(current.status)}
                </span>
              </div>

              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                {t("fields.owner")}: {business.owner.fullName} ({business.owner.email})
              </p>

              <div className="mt-3 grid gap-2 text-xs text-zinc-600 dark:text-zinc-300 md:grid-cols-3">
                <p className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-950">{t("fields.plan")}: {current.plan.nameAr}</p>
                <p className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-950">{t("fields.billing")}: {currentCycle}</p>
                <p className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-950">{t("fields.amount")}: <MoneyValue amount={Number(current.chargedAmount)} size="sm" className="inline-flex" /></p>
                <p className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-950">{t("fields.startsAt")}: {formatDateLine(current.startsAt)}</p>
                <p className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-950">
                  {t("fields.endsAt")}: {current.endsAt ? formatDateLine(current.endsAt) : t("notApplicable")}
                </p>
                <p className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-950">
                  {t("fields.trialEndsAt")}: {current.trialEndsAt ? formatDateLine(current.trialEndsAt) : t("notApplicable")}
                </p>
              </div>

              {latestPayment ? (
                <p className="mt-2 text-xs text-zinc-500">
                  {t("fields.latestPayment")}: {latestPayment.status} · {latestPayment.provider}
                </p>
              ) : null}
              {isTrialing ? <p className="mt-2 text-xs font-medium text-amber-800 dark:text-amber-200">{trialSummary(current.trialEndsAt)}</p> : null}
            </div>
          );
        })}
      </div>

      <div className="cf-surface overflow-x-auto rounded-xl p-2">
        <table className="w-full min-w-[760px] text-sm md:min-w-[900px]">
          <thead className="bg-muted text-foreground">
            <tr>
              <th className="px-4 py-3 text-start font-semibold">{t("table.business")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("table.code")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("table.owner")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("table.plan")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("table.status")}</th>
              <th className="px-4 py-3 text-right font-semibold">{t("table.trialEnds")}</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((business) => {
              const current = business.subscriptions[0];
              return (
                <tr key={business.id} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-4 py-2">{business.nameAr}</td>
                  <td className="px-4 py-2 font-mono text-xs">{business.code}</td>
                  <td className="px-4 py-2">{business.owner.fullName}<div className="text-xs text-zinc-500">{business.owner.email}</div></td>
                  <td className="px-4 py-2">{current?.plan.nameAr ?? t("notApplicable")}</td>
                  <td className="px-4 py-2">{current ? statusLabel(current.status) : t("withoutSubscriptionLabel")}</td>
                  <td className="px-4 py-2"><TableDateTimeCell at={current?.trialEndsAt ?? null} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
