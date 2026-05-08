"use server";

import { requireOwnerBusinessForCatalog } from "@/lib/catalog/require-owner-business";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import {
  consumeProductFromRecipeInTransaction,
  ConsumptionInsufficientStockError,
} from "@/lib/inventory/consume-product-from-recipe";
import { revalidateAfterStockImpact, revalidateConsumptionPage } from "@/lib/cache/revalidate-tenant-ui";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type ConsumeProductSuccessPayload = {
  productName: string;
  quantity: string;
  movementsCount: number;
  executedAtIso: string;
  executor: string;
  reference: string;
};

export type ConsumeProductFormState = {
  error: string | null;
  success: ConsumeProductSuccessPayload | null;
  shortageItems: { materialName: string; shortage: string; unit: string }[];
};

/**
 * Internal test action for Phase 7:
 * owner chooses a product quantity, then we deduct recipe materials atomically.
 */
export async function consumeProductByRecipe(
  _prev: ConsumeProductFormState,
  formData: FormData,
): Promise<ConsumeProductFormState> {
  const ctx = await requireOwnerBusinessForCatalog(formData);
  if (!ctx.ok) {
    return { error: ctx.error, success: null, shortageItems: [] };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));

  const productId = String(formData.get("productId") ?? "").trim();
  const quantityText = String(formData.get("quantity") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const referenceMode = String(formData.get("referenceMode") ?? "manual").trim();
  const referenceText = referenceMode === "test" ? t("consumption.testReference") : null;

  if (!productId) {
    return { error: t("consumption.productRequired"), success: null, shortageItems: [] };
  }
  if (!/^\d+(\.\d{1,3})?$/.test(quantityText)) {
    return { error: t("consumption.quantityFormat"), success: null, shortageItems: [] };
  }

  const quantity = new Prisma.Decimal(quantityText);
  if (!quantity.gt(new Prisma.Decimal(0))) {
    return { error: t("consumption.quantityPositive"), success: null, shortageItems: [] };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: productId, businessId: ctx.businessId, archivedAt: null, isActive: true },
        select: { nameAr: true },
      });
      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const user = await tx.user.findUnique({
        where: { id: ctx.userId },
        select: { fullName: true },
      });

      const execution = await consumeProductFromRecipeInTransaction(tx, {
        businessId: ctx.businessId,
        productId,
        quantity,
        note: note.length > 0 ? note : null,
        referenceText,
        executorLabel: user?.fullName ?? null,
        executorRole: t("consumption.executorRole"),
        sourceLabel: t("consumption.sourceLabel"),
      });
      return {
        productName: product.nameAr,
        movementsCount: execution.consumedItemsCount,
        executor: user?.fullName ?? t("consumption.executorUnknown"),
      };
    });
    const successPayload: ConsumeProductSuccessPayload = {
      productName: result.productName,
      quantity: quantity.toString(),
      movementsCount: result.movementsCount,
      executedAtIso: new Date().toISOString(),
      executor: result.executor,
      reference: referenceText ?? t("consumption.referenceManual", { product: result.productName }),
    };
    revalidateConsumptionPage(ctx.locale);
    revalidateAfterStockImpact(ctx.locale);
    return { error: null, success: successPayload, shortageItems: [] };
  } catch (e) {
    if (e instanceof ConsumptionInsufficientStockError) {
      return {
        error: t("consumption.shortage"),
        success: null,
        shortageItems: e.shortages.map((item) => ({
          materialName: item.rawMaterialNameAr,
          shortage: item.shortage.toString(),
          unit: item.unitLabel,
        })),
      };
    }

    const msg = e instanceof Error ? e.message : "";
    if (msg === "PRODUCT_NOT_FOUND") {
      return { error: t("consumption.productNotFound"), success: null, shortageItems: [] };
    }
    if (msg === "RECIPE_REQUIRED") {
      return { error: t("consumption.recipeRequired"), success: null, shortageItems: [] };
    }
    if (msg === "RECIPE_EMPTY") {
      return {
        error: t("consumption.recipeEmpty"),
        success: null,
        shortageItems: [],
      };
    }
    if (msg === "INSUFFICIENT_STOCK") {
      return {
        error: t("consumption.insufficientStock"),
        success: null,
        shortageItems: [],
      };
    }
    if (msg === "MATERIAL_NOT_FOUND") {
      return {
        error: t("consumption.materialNotFound"),
        success: null,
        shortageItems: [],
      };
    }
    if (msg === "QUANTITY_INVALID") {
      return { error: t("consumption.quantityInvalid"), success: null, shortageItems: [] };
    }
    return { error: t("consumption.genericError"), success: null, shortageItems: [] };
  }
}

