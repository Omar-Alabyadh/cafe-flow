"use server";

import { requireOwnerBusinessForCatalog } from "@/lib/catalog/require-owner-business";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import { revalidateAfterStockImpact } from "@/lib/cache/revalidate-tenant-ui";
import { applyStockMovementInTransaction } from "@/lib/inventory/apply-stock-movement";
import { prisma } from "@/lib/prisma";
import { Prisma, StockMovementType } from "@prisma/client";

export type StockMovementFormState = {
  error: string | null;
  success?: boolean;
  completedAt?: number;
};

const ALLOWED_TYPES: StockMovementType[] = [
  StockMovementType.OPENING_BALANCE,
  StockMovementType.STOCK_IN,
  StockMovementType.ADJUSTMENT_ADD,
  StockMovementType.ADJUSTMENT_SUBTRACT,
  StockMovementType.WASTE,
];
// CONSUMPTION is intentionally excluded here:
// it is generated automatically by the recipe consumption engine (Phase 7),
// not manually selected from this generic movement form.

/**
 * Records a single stock movement and updates RawMaterialStock in the same transaction.
 */
export async function recordStockMovement(
  _prev: StockMovementFormState,
  formData: FormData,
): Promise<StockMovementFormState> {
  const ctx = await requireOwnerBusinessForCatalog(formData);
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));

  const rawMaterialId = String(formData.get("rawMaterialId") ?? "").trim();
  const typeStr = String(formData.get("type") ?? "").trim() as StockMovementType;
  const qtyStr = String(formData.get("quantity") ?? "").trim();
  const noteRaw = String(formData.get("note") ?? "").trim();
  const costRaw = String(formData.get("unitCost") ?? "").trim();

  if (!ALLOWED_TYPES.includes(typeStr)) {
    return { error: t("stockMovements.invalidType") };
  }

  if (!rawMaterialId) {
    return { error: t("stockMovements.materialRequired") };
  }

  if (!/^\d+(\.\d{1,4})?$/.test(qtyStr)) {
    return { error: t("stockMovements.quantityFormat") };
  }
  const quantity = new Prisma.Decimal(qtyStr);

  let unitCost: Prisma.Decimal | null = null;
  if (costRaw.length > 0) {
    if (!/^\d+(\.\d{1,4})?$/.test(costRaw)) {
      return { error: t("stockMovements.unitCostFormat") };
    }
    unitCost = new Prisma.Decimal(costRaw);
  }

  try {
    await prisma.$transaction(async (tx) => {
      await applyStockMovementInTransaction(tx, {
        businessId: ctx.businessId,
        rawMaterialId,
        type: typeStr,
        quantity,
        unitCost,
        note: noteRaw.length > 0 ? noteRaw : null,
      });
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "INSUFFICIENT_STOCK") {
      return { error: t("stockMovements.insufficientStock") };
    }
    if (msg === "MATERIAL_NOT_FOUND") {
      return { error: t("stockMovements.materialNotFound") };
    }
    if (msg === "QUANTITY_INVALID") {
      return { error: t("stockMovements.quantityInvalid") };
    }
    return { error: t("stockMovements.genericError") };
  }

  revalidateAfterStockImpact(ctx.locale);
  return { error: null, success: true, completedAt: Date.now() };
}
