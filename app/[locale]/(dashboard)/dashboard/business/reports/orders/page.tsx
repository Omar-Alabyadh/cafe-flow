import { EmptyState } from "@/components/ui/foundations/empty-state";
import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { canViewReports } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TableDateTimeCell } from "@/components/ui/foundations/table-datetime-cell";
import { formatArabicLatnInteger } from "@/lib/format/numbers";
import { getTranslations } from "next-intl/server";

type PageProps = { params: Promise<{ locale: string }> };

export default async function OrdersReportPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.reports.orders");
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
  if (!canViewReports(context.member)) {
    return <UnauthorizedState locale={locale} title={t("unauthorizedTitle")} description={t("unauthorizedDescription")} />;
  }
  const businessId = context.business.id;
  const operationalTimeZone = context.operationalTimeZone;

  const orders = await prisma.order.findMany({
    where: { businessId, archivedAt: null },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <PageContainer>
      <SectionHeader title={t("title")} description={t("description")} />
      {orders.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <div className="cf-surface overflow-x-auto rounded-xl p-2">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("table.order")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.status")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("table.items")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("table.createdAt")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("table.completedAt")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 10)}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}

