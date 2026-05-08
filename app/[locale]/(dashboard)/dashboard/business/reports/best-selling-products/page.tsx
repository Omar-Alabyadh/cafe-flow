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
import { formatArabicLatnInteger, formatArabicLatnQuantity } from "@/lib/format/numbers";

type PageProps = { params: Promise<{ locale: string }> };

export default async function BestSellingProductsReportPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.reports.bestSellingProducts");
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

  /**
   * Aggregation logic:
   * - Use completed orders only (sales finalized).
   * - Group order items by productId.
   * - Sum quantity and count rows for each product.
   */
  const groups = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      order: { businessId, status: "COMPLETED", archivedAt: null },
    },
    _sum: { quantity: true },
    _count: { productId: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 20,
  });

  const productIds = groups.map((g) => g.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, nameAr: true, code: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  return (
    <PageContainer>
      <SectionHeader
        title={t("title")}
        description={t("description")}
      />
      {groups.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <div className="cf-surface overflow-x-auto rounded-xl p-2">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("table.product")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("table.code")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("table.totalQuantity")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("table.orderLines")}</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((row) => {
                const product = productMap.get(row.productId);
                const totalQty = row._sum.quantity
                  ? new Prisma.Decimal(row._sum.quantity.toString()).toNumber()
                  : 0;
                return (
                  <tr key={row.productId} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-4 py-3">{product?.nameAr ?? t("unknownProduct")}</td>
                    <td className="px-4 py-3 font-mono text-xs">{product?.code ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {formatArabicLatnQuantity(totalQty)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatArabicLatnInteger(row._count.productId)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}

