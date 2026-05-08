import { EmptyState } from "@/components/ui/foundations/empty-state";
import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { canViewReports } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { formatArabicLatnQuantity } from "@/lib/format/numbers";

type PageProps = { params: Promise<{ locale: string }> };

export default async function LowStockReportPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.reports.lowStock");
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

  const materials = await prisma.rawMaterial.findMany({
    where: { businessId, archivedAt: null },
    include: { unit: true, stock: true },
    orderBy: { nameAr: "asc" },
  });

  const lowRows = materials
    .map((m) => {
      const balance = m.stock ? new Prisma.Decimal(m.stock.balance.toString()) : new Prisma.Decimal(0);
      const min = new Prisma.Decimal(m.minimumQuantity);
      const hasMin = m.minimumQuantity > 0;
      const isLow = hasMin && balance.lt(min);
      return { m, balance, isLow };
    })
    .filter((row) => row.isLow);

  return (
    <PageContainer>
      <SectionHeader
        title={t("title")}
        description={t("description")}
      />
      {lowRows.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <div className="cf-surface overflow-x-auto rounded-xl p-2">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("table.material")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("table.currentBalance")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("table.minimum")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {lowRows.map(({ m, balance }) => (
                <tr key={m.id} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-4 py-3">{m.nameAr}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    {formatArabicLatnQuantity(balance.toNumber())}{" "}
                    <span className="text-zinc-500">({m.unit.nameAr})</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatArabicLatnQuantity(m.minimumQuantity)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                      {t("lowStatus")}
                    </span>
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

