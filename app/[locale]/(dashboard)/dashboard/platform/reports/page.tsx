import { MoneyValue } from "@/components/ui/foundations/money-value";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { StatCard } from "@/components/ui/foundations/stat-card";
import { TableDateTimeCell } from "@/components/ui/foundations/table-datetime-cell";
import { formatArabicLatnInteger } from "@/lib/format/numbers";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";
import { AlertTriangle, Building2, CalendarClock, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

type PageProps = { params: Promise<{ locale: string }> };

/**
 * Cross-tenant operational reports: onboarding velocity, subscription risk rows,
 * and follow-up lists the operator can act on outside any single café workspace.
 */
export default async function PlatformReportsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("platform.reports");

  const subStatusLabel = (status: SubscriptionStatus) => {
    switch (status) {
      case "TRIALING":
        return t("subscriptionStatus.TRIALING");
      case "ACTIVE":
        return t("subscriptionStatus.ACTIVE");
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

  const now = new Date();
  const start30 = new Date(now);
  start30.setDate(start30.getDate() - 30);
  const start90 = new Date(now);
  start90.setDate(start90.getDate() - 90);
  const trialHorizon = new Date(now);
  trialHorizon.setDate(trialHorizon.getDate() + 7);

  const [
    businesses30,
    businesses90,
    totalBusinesses,
    trialEndingSoon,
    pastDueSubs,
    expiredRecent,
    pendingPaymentSubs,
  ] = await Promise.all([
    prisma.business.count({ where: { archivedAt: null, createdAt: { gte: start30 } } }),
    prisma.business.count({ where: { archivedAt: null, createdAt: { gte: start90 } } }),
    prisma.business.count({ where: { archivedAt: null } }),
    prisma.subscription.findMany({
      where: {
        archivedAt: null,
        status: SubscriptionStatus.TRIALING,
        trialEndsAt: { not: null, gte: now, lte: trialHorizon },
      },
      orderBy: { trialEndsAt: "asc" },
      take: 40,
      include: {
        business: { select: { nameAr: true, code: true } },
        plan: { select: { nameAr: true } },
      },
    }),
    prisma.subscription.findMany({
      where: { archivedAt: null, status: SubscriptionStatus.PAST_DUE },
      orderBy: { updatedAt: "desc" },
      take: 40,
      include: {
        business: { select: { nameAr: true, code: true } },
        plan: { select: { nameAr: true } },
      },
    }),
    prisma.subscription.findMany({
      where: { archivedAt: null, status: SubscriptionStatus.EXPIRED },
      orderBy: { endsAt: "desc" },
      take: 25,
      include: {
        business: { select: { nameAr: true, code: true } },
        plan: { select: { nameAr: true } },
      },
    }),
    prisma.subscription.findMany({
      where: { archivedAt: null, status: SubscriptionStatus.PENDING_PAYMENT },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        business: { select: { nameAr: true, code: true } },
        plan: { select: { nameAr: true } },
      },
    }),
  ]);

  const recentSignups = await prisma.business.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      nameAr: true,
      code: true,
      createdAt: true,
      owner: { select: { fullName: true, email: true } },
      subscriptions: {
        where: { archivedAt: null },
        take: 1,
        select: { status: true },
      },
    },
  });

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
          href={`/${locale}/dashboard/platform/finance`}
          className="inline-flex rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
        >
          {t("openFinance")}
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("cards.totalBusinesses")} value={formatArabicLatnInteger(totalBusinesses)} icon={<Building2 className="h-4 w-4" />} />
        <StatCard label={t("cards.new30d")} value={formatArabicLatnInteger(businesses30)} helperText={t("cards.new30dHint")} icon={<Users className="h-4 w-4" />} />
        <StatCard label={t("cards.new90d")} value={formatArabicLatnInteger(businesses90)} helperText={t("cards.new90dHint")} />
        <StatCard
          label={t("cards.trialEndingSoon")}
          value={formatArabicLatnInteger(trialEndingSoon.length)}
          helperText={t("cards.trialEndingSoonHint")}
          icon={<CalendarClock className="h-4 w-4" />}
        />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
            {t("sections.trialing.title")}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("sections.trialing.hint")}</p>
          {trialEndingSoon.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">{t("sections.empty")}</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {trialEndingSoon.map((row) => (
                <li key={row.id} className="rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800">
                  <p className="font-medium">{row.business.nameAr}</p>
                  <p className="text-xs text-zinc-500">{row.business.code}</p>
                  <p className="mt-1 text-xs">
                    {row.plan.nameAr} · {subStatusLabel(row.status)}
                  </p>
                  {/* `TableDateTimeCell` renders a block `div`; keep it out of `<p>` for valid HTML / hydration. */}
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-1 text-xs text-zinc-600 dark:text-zinc-300">
                    <span>{t("sections.trialing.ends")}:</span>
                    <TableDateTimeCell at={row.trialEndsAt} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold text-red-900 dark:text-red-300">{t("sections.pastDue.title")}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("sections.pastDue.hint")}</p>
          {pastDueSubs.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">{t("sections.empty")}</p>
          ) : (
            <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto text-sm">
              {pastDueSubs.map((row) => (
                <li key={row.id} className="rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800">
                  <p className="font-medium">{row.business.nameAr}</p>
                  <p className="text-xs text-zinc-500">{row.plan.nameAr}</p>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-1 text-xs">
                    <MoneyValue amount={Number(row.chargedAmount)} size="sm" />
                    <span>· {t("sections.ends")}</span>
                    <TableDateTimeCell at={row.endsAt} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold">{t("sections.pendingPayment.title")}</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("sections.pendingPayment.hint")}</p>
        {pendingPaymentSubs.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">{t("sections.empty")}</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted text-foreground">
                <tr>
                  <th className="px-3 py-2 text-start font-semibold">{t("table.business")}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t("table.plan")}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t("table.amount")}</th>
                  <th className="px-3 py-2 text-start font-semibold">{t("table.starts")}</th>
                </tr>
              </thead>
              <tbody>
                {pendingPaymentSubs.map((row) => (
                  <tr key={row.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-3 py-2">
                      {row.business.nameAr}
                      <div className="text-xs text-zinc-500">{row.business.code}</div>
                    </td>
                    <td className="px-3 py-2">{row.plan.nameAr}</td>
                    <td className="px-3 py-2 text-end">
                      <MoneyValue amount={Number(row.chargedAmount)} size="sm" />
                    </td>
                    <td className="px-3 py-2">
                      <TableDateTimeCell at={row.startsAt} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold">{t("sections.expired.title")}</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("sections.expired.hint")}</p>
        {expiredRecent.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">{t("sections.empty")}</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {expiredRecent.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800">
                <span className="font-medium">{row.business.nameAr}</span>
                <div className="flex flex-wrap items-baseline gap-x-1 text-xs text-zinc-500">
                  <span>{t("sections.ends")}</span>
                  <TableDateTimeCell at={row.endsAt} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="cf-surface overflow-x-auto rounded-xl p-2">
        <p className="mb-2 px-2 text-sm font-semibold">{t("sections.signups.title")}</p>
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted text-foreground">
            <tr>
              <th className="px-3 py-2 text-start font-semibold">{t("table.business")}</th>
              <th className="px-3 py-2 text-start font-semibold">{t("table.code")}</th>
              <th className="px-3 py-2 text-start font-semibold">{t("table.owner")}</th>
              <th className="px-3 py-2 text-start font-semibold">{t("table.created")}</th>
              <th className="px-3 py-2 text-start font-semibold">{t("table.subscription")}</th>
            </tr>
          </thead>
          <tbody>
            {recentSignups.map((b) => {
              const st = b.subscriptions[0]?.status;
              return (
                <tr key={b.id} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-3 py-2">{b.nameAr}</td>
                  <td className="px-3 py-2 font-mono text-xs">{b.code}</td>
                  <td className="px-3 py-2">
                    {b.owner.fullName}
                    <div className="text-xs text-zinc-500">{b.owner.email}</div>
                  </td>
                  <td className="px-3 py-2">
                    <TableDateTimeCell at={b.createdAt} />
                  </td>
                  <td className="px-3 py-2">{st ? subStatusLabel(st) : t("table.noSubscription")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
