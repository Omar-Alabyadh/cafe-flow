import { EmptyState } from "@/components/ui/foundations/empty-state";
import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { canViewReports } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { prisma } from "@/lib/prisma";
import { StockMovementType } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { TableDateTimeCell } from "@/components/ui/foundations/table-datetime-cell";
import { formatArabicLatnInteger, formatArabicLatnQuantity } from "@/lib/format/numbers";

type PageProps = { params: Promise<{ locale: string }> };

const TYPE_LABELS: Record<StockMovementType, string> = {
  OPENING_BALANCE: "openingBalance",
  STOCK_IN: "stockIn",
  ADJUSTMENT_ADD: "adjustmentAdd",
  ADJUSTMENT_SUBTRACT: "adjustmentSubtract",
  WASTE: "waste",
  CONSUMPTION: "consumption",
};

export default async function RecentStockMovementsReportPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.reports.stockMovements");
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

  const rows = await prisma.stockMovement.findMany({
    where: { businessId },
    include: { rawMaterial: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <PageContainer>
      <SectionHeader
        title={t("title")}
        description={t("description", { count: formatArabicLatnInteger(100) })}
      />
      {rows.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <div className="cf-surface overflow-x-auto rounded-xl p-2">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("table.material")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.type")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("table.quantity")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("table.createdAt")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-4 py-3">{row.rawMaterial.nameAr}</td>
                  <td className="px-4 py-3">{t(`types.${TYPE_LABELS[row.type]}`)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    {formatArabicLatnQuantity(row.quantity.toNumber())}
                  </td>
                  <td className="px-4 py-3">
                    <TableDateTimeCell at={row.createdAt} timeZone={operationalTimeZone} locale={locale} />
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

