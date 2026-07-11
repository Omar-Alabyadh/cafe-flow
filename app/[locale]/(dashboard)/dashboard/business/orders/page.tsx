import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { EmptyState } from "@/components/ui/foundations/empty-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { canUsePOS, hasPermission } from "@/lib/authorization/access";
import { MembershipRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TableDateTimeCell } from "@/components/ui/foundations/table-datetime-cell";
import { formatArabicLatnInteger } from "@/lib/format/numbers";
import { getUtcRangeForLocalDate } from "@/lib/time-zone/day-boundaries";
import { getTranslations } from "next-intl/server";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function isOrderStatusFilter(value: string): value is OrderStatus {
  return (
    value === "DRAFT" ||
    value === "IN_PROGRESS" ||
    value === "COMPLETED" ||
    value === "CANCELED"
  );
}

function buildWhere(
  businessId: string,
  raw: Record<string, string | string[] | undefined>,
  operationalTimeZone: string,
): Prisma.OrderWhereInput {
  const q = firstParam(raw.q)?.trim();
  const statusRaw = firstParam(raw.status)?.trim();
  const from = firstParam(raw.from)?.trim();
  const to = firstParam(raw.to)?.trim();

  const where: Prisma.OrderWhereInput = { businessId, archivedAt: null };

  if (q) {
    where.id = { contains: q, mode: "insensitive" };
  }

  if (statusRaw && isOrderStatusFilter(statusRaw)) {
    where.status = statusRaw;
  }

  const created: Prisma.DateTimeFilter = {};
  if (from) {
    const range = getUtcRangeForLocalDate({ date: from, timeZone: operationalTimeZone });
    if (range) {
      created.gte = range.startUtc;
    }
  }
  if (to) {
    const range = getUtcRangeForLocalDate({ date: to, timeZone: operationalTimeZone });
    if (range) {
      created.lt = range.nextDayStartUtc;
    }
  }
  if (Object.keys(created).length > 0) {
    where.createdAt = created;
  }

  return where;
}

export default async function OrdersPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.orders");
  const sp = await searchParams;
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
  if (!hasPermission(context.member, "orders.view")) {
    return <UnauthorizedState locale={locale} title={t("unauthorized.title")} description={t("unauthorized.description")} />;
  }
  const businessId = context.business.id;
  const showPosLink = canUsePOS(context.member) && context.member.role !== MembershipRole.BARISTA;

  const operationalTimeZone = context.operationalTimeZone;
  const where = buildWhere(businessId, sp, operationalTimeZone);

  const orders = await prisma.order.findMany({
    where,
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const ordersPath = `/${locale}/dashboard/business/orders`;
  const defaultQ = firstParam(sp.q) ?? "";
  const defaultStatus = firstParam(sp.status) ?? "";
  const defaultFrom = firstParam(sp.from) ?? "";
  const defaultTo = firstParam(sp.to) ?? "";

  return (
    <PageContainer>
      <SectionHeader
        title={t("title")}
        description={t("description")}
      />

      <form
        method="get"
        action={ordersPath}
        className="mb-6 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 md:flex-row md:flex-wrap md:items-end"
      >
        <div className="min-w-[200px] flex-1 space-y-1">
          <label htmlFor="orders-q" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {t("filters.searchLabel")}
          </label>
          <input
            id="orders-q"
            name="q"
            defaultValue={defaultQ}
            placeholder={t("filters.searchPlaceholder")}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="min-w-[160px] space-y-1">
          <label htmlFor="orders-status" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {t("filters.status")}
          </label>
          <select
            id="orders-status"
            name="status"
            defaultValue={defaultStatus}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="">{t("filters.all")}</option>
            <option value="DRAFT">{t("status.draft")}</option>
            <option value="IN_PROGRESS">{t("status.inProgress")}</option>
            <option value="COMPLETED">{t("status.completed")}</option>
            <option value="CANCELED">{t("status.canceled")}</option>
          </select>
        </div>
        <div className="min-w-[140px] space-y-1">
          <label htmlFor="orders-from" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {t("filters.fromDate")}
          </label>
          <input
            id="orders-from"
            name="from"
            type="date"
            defaultValue={defaultFrom}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="min-w-[140px] space-y-1">
          <label htmlFor="orders-to" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {t("filters.toDate")}
          </label>
          <input
            id="orders-to"
            name="to"
            type="date"
            defaultValue={defaultTo}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            {t("filters.apply")}
          </button>
          <Link
            href={ordersPath}
            className="inline-flex items-center rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
          >
            {t("filters.reset")}
          </Link>
        </div>
      </form>

      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{t("table.title")}</p>
        {showPosLink ? (
          <Link
            href={`/${locale}/dashboard/business/pos`}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {t("goToPos")}
          </Link>
        ) : null}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title={t("empty.title")}
          description={t("empty.description")}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("table.orderId")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.status")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("table.itemsCount")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("table.createdAt")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("table.completedAt")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.action")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 10)}…</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={o.status} itemCount={o._count.items} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatArabicLatnInteger(o._count.items)}</td>
                  <td className="px-4 py-3">
                    <TableDateTimeCell at={o.createdAt} timeZone={operationalTimeZone} locale={locale} />
                  </td>
                  <td className="px-4 py-3">
                    <TableDateTimeCell at={o.completedAt} timeZone={operationalTimeZone} locale={locale} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/${locale}/dashboard/business/orders/${o.id}`}
                      className="inline-flex rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                    >
                      {t("open")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}
