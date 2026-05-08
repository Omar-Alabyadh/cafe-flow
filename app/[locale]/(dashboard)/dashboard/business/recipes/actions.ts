"use server";

import { requireOwnerBusinessForCatalog } from "@/lib/catalog/require-owner-business";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import { revalidateAfterRecipeStructureChange } from "@/lib/cache/revalidate-tenant-ui";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type RecipeActionState = {
  error: string | null;
  success?: boolean;
  completedAt?: number;
};

/**
 * Creates an empty recipe shell for one product (one recipe per product in Phase 6).
 */
export async function createRecipeForProduct(
  _prev: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  /**          /  —              . */
  const ctx = await requireOwnerBusinessForCatalog(formData, ["recipes.create"]);
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));

  const productId = String(formData.get("productId") ?? "").trim();
  if (!productId) {
    return { error: t("recipes.productIdRequired") };
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      businessId: ctx.businessId,
      archivedAt: null,
    },
    select: { id: true },
  });
  if (!product) {
    return { error: t("recipes.productNotFound") };
  }

  const existing = await prisma.recipe.findUnique({
    where: { productId },
    select: { id: true },
  });
  if (existing) {
    return { error: t("recipes.recipeExists") };
  }

  await prisma.recipe.create({
    data: {
      businessId: ctx.businessId,
      productId,
    },
  });

  revalidatePath(`/${ctx.locale}/dashboard/business/recipes`, "page");
  revalidatePath(`/${ctx.locale}/dashboard/business/recipes/${productId}`, "page");
  revalidateAfterRecipeStructureChange(ctx.locale);
  return { error: null, success: true, completedAt: Date.now() };
}

/**
 * Adds one ingredient line: how much raw material is consumed per **one** unit of the product.
 */
export async function addRecipeItem(
  _prev: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  const ctx = await requireOwnerBusinessForCatalog(formData, ["recipes.update"]);
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));

  const recipeId = String(formData.get("recipeId") ?? "").trim();
  const rawMaterialId = String(formData.get("rawMaterialId") ?? "").trim();
  const qtyStr = String(formData.get("quantity") ?? "").trim();

  if (!recipeId || !rawMaterialId) {
    return { error: t("recipes.idsRequired") };
  }

  const recipe = await prisma.recipe.findFirst({
    where: { id: recipeId, businessId: ctx.businessId },
    select: { id: true },
  });
  if (!recipe) {
    return { error: t("recipes.recipeNotFound") };
  }

  const material = await prisma.rawMaterial.findFirst({
    where: {
      id: rawMaterialId,
      businessId: ctx.businessId,
      archivedAt: null,
    },
    select: { id: true },
  });
  if (!material) {
    return { error: t("recipes.materialNotFound") };
  }

  /**
   * Why strict quantity validation:
   * Recipe quantity is multiplied at order completion to deduct stock.
   * Any invalid or zero value would create wrong inventory math downstream.
   */
  if (!/^\d+(\.\d{1,6})?$/.test(qtyStr)) {
    return { error: t("recipes.quantityFormat") };
  }
  const quantity = new Prisma.Decimal(qtyStr);
  if (!quantity.gt(new Prisma.Decimal(0))) {
    return { error: t("recipes.quantityPositive") };
  }

  try {
    /**
     * Why duplicate ingredient is blocked:
     * Each recipe must have one row per raw material so the deduction rule
     * is deterministic when POS/orders consume inventory.
     */
    await prisma.recipeItem.create({
      data: {
        recipeId,
        rawMaterialId,
        quantity,
      },
    });
  } catch {
    return { error: t("recipes.duplicateIngredient") };
  }

  const product = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { productId: true },
  });

  revalidatePath(`/${ctx.locale}/dashboard/business/recipes`, "page");
  if (product) {
    revalidatePath(`/${ctx.locale}/dashboard/business/recipes/${product.productId}`, "page");
  }
  revalidateAfterRecipeStructureChange(ctx.locale);
  return { error: null, success: true, completedAt: Date.now() };
}

/**
 * Updates the quantity of an existing recipe item.
 * This keeps recipe lines canonical: one material line, editable quantity.
 */
export async function updateRecipeItemQuantity(
  _prev: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  const ctx = await requireOwnerBusinessForCatalog(formData, ["recipes.update"]);
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));

  const itemId = String(formData.get("itemId") ?? "").trim();
  const qtyStr = String(formData.get("quantity") ?? "").trim();
  if (!itemId) {
    return { error: t("recipes.itemIdRequired") };
  }

  if (!/^\d+(\.\d{1,6})?$/.test(qtyStr)) {
    return { error: t("recipes.updateQuantityInvalid") };
  }
  const quantity = new Prisma.Decimal(qtyStr);
  if (!quantity.gt(new Prisma.Decimal(0))) {
    return { error: t("recipes.updateQuantityPositive") };
  }

  const item = await prisma.recipeItem.findFirst({
    where: { id: itemId },
    include: {
      recipe: {
        select: {
          id: true,
          businessId: true,
          productId: true,
        },
      },
      rawMaterial: {
        select: {
          id: true,
          businessId: true,
          archivedAt: true,
        },
      },
    },
  });
  if (!item || item.recipe.businessId !== ctx.businessId) {
    return { error: t("recipes.itemRecipeMismatch") };
  }
  if (item.rawMaterial.businessId !== ctx.businessId || item.rawMaterial.archivedAt) {
    return { error: t("recipes.materialArchived") };
  }

  await prisma.recipeItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  revalidatePath(`/${ctx.locale}/dashboard/business/recipes`, "page");
  revalidatePath(`/${ctx.locale}/dashboard/business/recipes/${item.recipe.productId}`, "page");
  revalidateAfterRecipeStructureChange(ctx.locale);
  return { error: null, success: true, completedAt: Date.now() };
}

/** Removes one line from the BOM (composition data; hard delete keeps the model simple). */
export async function removeRecipeItem(formData: FormData) {
  const ctx = await requireOwnerBusinessForCatalog(formData, ["recipes.update"]);
  if (!ctx.ok) {
    return;
  }

  const itemId = String(formData.get("itemId") ?? "").trim();
  if (!itemId) {
    return;
  }

  const item = await prisma.recipeItem.findFirst({
    where: { id: itemId },
    include: { recipe: { select: { businessId: true, productId: true } } },
  });
  if (!item || item.recipe.businessId !== ctx.businessId) {
    return;
  }

  await prisma.recipeItem.delete({ where: { id: itemId } });

  revalidatePath(`/${ctx.locale}/dashboard/business/recipes`, "page");
  revalidatePath(`/${ctx.locale}/dashboard/business/recipes/${item.recipe.productId}`, "page");
  revalidateAfterRecipeStructureChange(ctx.locale);
}
