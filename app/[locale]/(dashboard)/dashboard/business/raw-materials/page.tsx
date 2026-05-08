import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { hasPermission } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { RawMaterialsWorkspace } from "./raw-materials-workspace";

type PageProps = { params: Promise<{ locale: string }> };

export default async function RawMaterialsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.rawMaterials.page");
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
  if (!hasPermission(context.member, "raw_materials.view")) {
    return (
      <UnauthorizedState
        locale={locale}
        title={t("unauthorizedTitle")}
        description={t("unauthorizedDescription")}
      />
    );
  }
  const businessId = context.business.id;

  const [rows, units, suppliers] = await Promise.all([
    prisma.rawMaterial.findMany({
      where: { businessId, archivedAt: null },
      include: { unit: true, supplier: true },
      orderBy: { nameAr: "asc" },
    }),
    prisma.unit.findMany({
      where: { businessId, archivedAt: null },
      orderBy: { nameAr: "asc" },
    }),
    prisma.supplier.findMany({
      where: { businessId, archivedAt: null },
      orderBy: { name: "asc" },
    }),
  ]);

  const unitOptions = units.map((u) => ({ id: u.id, label: `${u.nameAr} (${u.code})` }));
  const supplierOptions = suppliers.map((s) => ({ id: s.id, label: s.name }));

  return (
    <PageContainer>
      <SectionHeader
        title={t("title")}
        description={t("description")}
      />

      <RawMaterialsWorkspace
        locale={locale}
        units={unitOptions}
        suppliers={supplierOptions}
        rows={rows.map((r) => ({
          id: r.id,
          code: r.code,
          nameAr: r.nameAr,
          nameEn: r.nameEn,
          unitId: r.unitId,
          unitLabel: r.unit.nameAr,
          supplierId: r.supplierId,
          supplierLabel: r.supplier?.name ?? null,
          costPerUnit: r.costPerUnit.toString(),
          minimumQuantity: r.minimumQuantity,
        }))}
      />
    </PageContainer>
  );
}
