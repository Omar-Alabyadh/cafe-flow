"use server";

import { requireOwnerBusinessForCatalog } from "@/lib/catalog/require-owner-business";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import { revalidateAfterStockImpact } from "@/lib/cache/revalidate-tenant-ui";
import { applyStockMovementInTransaction } from "@/lib/inventory/apply-stock-movement";
import { prisma } from "@/lib/prisma";
import { Prisma, StockMovementType } from "@prisma/client";

export type InventoryAdjustmentState = {
  error: string | null;
  success?: boolean;
  completedAt?: number;
};

/**
 * Controlled stock adjustment from inventory screen.
 *
 * Why this exists (important for committee explanation):
 * - Inventory page shows the CURRENT balance snapshot.
 * - We must not directly mutate `RawMaterialStock.balance` from UI.
 * - Every change must be recorded as a StockMovement for traceability/audit.
 */
export async function adjustInventoryBalance(
  _prev: InventoryAdjustmentState,
  formData: FormData,
): Promise<InventoryAdjustmentState> {
  const ctx = await requireOwnerBusinessForCatalog(formData);
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));

  const rawMaterialId = String(formData.get("rawMaterialId") ?? "").trim();
  const newBalanceStr = String(formData.get("newBalance") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const noteRaw = String(formData.get("note") ?? "").trim();

  if (!rawMaterialId) {
    return { error: t("inventory.materialRequired") };
  }
  if (!reason) {
    return { error: t("inventory.reasonRequired") };
  }
  if (!/^\d+(\.\d{1,4})?$/.test(newBalanceStr)) {
    return { error: t("inventory.balanceFormat") };
  }

  const material = await prisma.rawMaterial.findFirst({
    where: {
      id: rawMaterialId,
      businessId: ctx.businessId,
      archivedAt: null,
    },
    include: { stock: true },
  });
  if (!material) {
    return { error: t("inventory.materialNotFound") };
  }

  const currentBalance = material.stock
    ? new Prisma.Decimal(material.stock.balance.toString())
    : new Prisma.Decimal(0);
  const newBalance = new Prisma.Decimal(newBalanceStr);
  const diff = newBalance.sub(currentBalance);

  if (diff.eq(new Prisma.Decimal(0))) {
    return { error: t("inventory.noChange") };
  }

  const type = diff.gt(new Prisma.Decimal(0))
    ? StockMovementType.ADJUSTMENT_ADD
    : StockMovementType.ADJUSTMENT_SUBTRACT;
  const quantity = diff.abs();

  const note = noteRaw.length > 0 ? `: ${reason} — ${noteRaw}` : `: ${reason}`;

  try {
    await prisma.$transaction(async (tx) => {
      await applyStockMovementInTransaction(tx, {
        businessId: ctx.businessId,
        rawMaterialId,
        type,
        quantity,
        note,
      });
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "INSUFFICIENT_STOCK") {
      return { error: t("inventory.insufficientStock") };
    }
    if (msg === "MATERIAL_NOT_FOUND") {
      return { error: t("inventory.materialNotFoundCatch") };
    }
    if (msg === "QUANTITY_INVALID") {
      return { error: t("inventory.quantityInvalid") };
    }
    return { error: t("inventory.genericError") };
  }

  revalidateAfterStockImpact(ctx.locale);
  return { error: null, success: true, completedAt: Date.now() };
}
