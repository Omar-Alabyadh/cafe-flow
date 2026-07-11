import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { EmptyState } from "@/components/ui/foundations/empty-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { canManageInventory } from "@/lib/authorization/access";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { InventoryWorkspace, type InventoryRow } from "./inventory-workspace";

type PageProps = { params: Promise<{ locale: string }> };

/**
 * Inventory screen:
 * - uses real `RawMaterialStock.balance` snapshots updated by stock movements,
 * - keeps this page focused on balances/thresholds (not raw-material master data CRUD).
 */
export default async function InventoryPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.inventory.page");
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
  if (!canManageInventory(context.member)) {
    return (
      <UnauthorizedState
        locale={locale}
        title={t("unauthorizedTitle")}
        description={t("unauthorizedDescription")}
      />
    );
  }
  const businessId = context.business.id;

  const materials = await prisma.rawMaterial.findMany({
    where: { businessId, archivedAt: null },
    include: {
      unit: true,
      stock: true,
    },
    orderBy: { nameAr: "asc" },
  });

  const rows: InventoryRow[] = materials.map((m) => ({
    id: m.id,
    nameAr: m.nameAr,
    code: m.code,
    unitName: m.unit.nameAr,
    currentBalance: m.stock?.balance.toString() ?? "0",
    minimumQuantity: m.minimumQuantity,
    stockUpdatedAt: m.stock?.updatedAt.toISOString() ?? null,
  }));

  return (
    <PageContainer>
      <SectionHeader
        title={t("title")}
        description={t("description")}
      />

      {materials.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <InventoryWorkspace locale={locale} rows={rows} operationalTimeZone={context.operationalTimeZone} />
      )}
    </PageContainer>
  );
}
