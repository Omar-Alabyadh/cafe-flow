import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { canManageInventory } from "@/lib/authorization/access";
import { signedDeltaFromMovement } from "@/lib/inventory/stock-movement-math";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { StockMovementsWorkspace, type LedgerRow } from "./stock-movements-workspace";

type PageProps = { params: Promise<{ locale: string }> };

export default async function StockMovementsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.stockMovements.page");
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

  const actor = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, fullName: true },
  });
  // Executor fallback order requested for current phase:
  // actor full name -> actor email -> owner fallback.
  const executorLabel =
    actor?.fullName?.trim() || actor?.email?.trim() || "owner@cafeflow.local";

  const [materials, movementsAsc] = await Promise.all([
    prisma.rawMaterial.findMany({
      where: { businessId, archivedAt: null },
      include: { unit: true },
      orderBy: { nameAr: "asc" },
    }),
    prisma.stockMovement.findMany({
      where: { businessId },
      include: {
        rawMaterial: { include: { unit: true } },
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    }),
  ]);

  const materialOptions = materials.map((m) => ({
    id: m.id,
    label: `${m.nameAr} (${m.unit.nameAr})`,
  }));

  /**
   * Audit math (committee-important):
   * We derive before/after balances from the real movement stream in chronological order.
   * Direction (+/-) comes from movement type via `signedDeltaFromMovement`.
   */
  const runningByMaterial = new Map<string, Prisma.Decimal>();
  const ledgerAsc: LedgerRow[] = movementsAsc.map((mv) => {
    const before = runningByMaterial.get(mv.rawMaterialId) ?? new Prisma.Decimal(0);
    const quantity = new Prisma.Decimal(mv.quantity.toString());
    const delta = signedDeltaFromMovement(mv.type, quantity);
    const after = before.add(delta);
    runningByMaterial.set(mv.rawMaterialId, after);

    const note = mv.note?.trim() ? mv.note.trim() : null;
    const referenceFromStructuredNote = (() => {
      if (!note) return null;
      const line = note
        .split("\n")
        .map((part) => part.trim())
        .find((part) => part.startsWith("Reference:"));
      if (!line) return null;
      return line.replace(/^Reference:\s*/, "").trim() || null;
    })();
    let referenceLabel = "—";
    if (mv.type === "CONSUMPTION") {
      referenceLabel = referenceFromStructuredNote ?? "Consumption";
    } else if (mv.type === "STOCK_IN") {
      referenceLabel = note?.includes("Return") ? "Return" : "Supplier stock-in";
    } else if (mv.type === "ADJUSTMENT_ADD" || mv.type === "ADJUSTMENT_SUBTRACT") {
      referenceLabel = "Manual adjustment";
    } else if (mv.type === "OPENING_BALANCE") {
      referenceLabel = "Adjustment (opening balance)";
    } else if (mv.type === "WASTE") {
      referenceLabel = "Adjustment (waste)";
    }
    if (note && mv.type !== "CONSUMPTION") {
      referenceLabel = `${referenceLabel} — ${note}`;
    }

    return {
      id: mv.id,
      createdAtIso: mv.createdAt.toISOString(),
      materialName: mv.rawMaterial.nameAr,
      materialCode: mv.rawMaterial.code,
      unitName: mv.rawMaterial.unit.nameAr,
      type: mv.type,
      quantityAbs: quantity.toString(),
      deltaSigned: delta.toString(),
      balanceBefore: before.toString(),
      balanceAfter: after.toString(),
      unitCost: mv.unitCost?.toString() ?? null,
      note,
      referenceLabel,
    };
  });
  const ledgerRows = [...ledgerAsc].reverse();

  return (
    <PageContainer>
      <SectionHeader
        title={t("title")}
        description={t("description")}
      />

      <StockMovementsWorkspace
        locale={locale}
        materialOptions={materialOptions}
        rows={ledgerRows}
        executorLabel={executorLabel}
      />
    </PageContainer>
  );
}
