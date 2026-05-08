import { applyStockMovementInTransaction } from "@/lib/inventory/apply-stock-movement";
import { Prisma, StockMovementType } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export type ConsumeProductInput = {
  businessId: string;
  productId: string;
  quantity: Prisma.Decimal;
  note?: string | null;
  referenceText?: string | null;
  executorLabel?: string | null;
  executorRole?: string | null;
  sourceLabel?: string | null;
  orderId?: string | null;
};

export type InsufficientRecipeMaterial = {
  rawMaterialId: string;
  rawMaterialNameAr: string;
  unitLabel: string;
  required: Prisma.Decimal;
  available: Prisma.Decimal;
  shortage: Prisma.Decimal;
};

/**
 * Structured error used by the consumption screen to show *which* materials are missing.
 * Message stays "INSUFFICIENT_STOCK" for backward compatibility with existing POS/order handlers.
 */
export class ConsumptionInsufficientStockError extends Error {
  shortages: InsufficientRecipeMaterial[];

  constructor(shortages: InsufficientRecipeMaterial[]) {
    super("INSUFFICIENT_STOCK");
    this.name = "ConsumptionInsufficientStockError";
    this.shortages = shortages;
  }
}

/**
 * Consumes raw materials for a sold/produced quantity of one product.
 *
 * Why this exists:
 * - Phase 7 introduces internal auto-deduction from recipe (without full POS).
 * - We need one clear function that a student can explain: validate recipe, check stock,
 *   then write movement rows and update balances in one atomic transaction.
 *
 * Inputs:
 * - businessId: current owner business scope.
 * - productId: product to consume by recipe.
 * - quantity: requested product quantity (must be > 0).
 * - note: optional text attached to generated stock movements.
 *
 * Returns:
 * - consumedItemsCount and recipeId for UI revalidation/reporting.
 *
 * Side effects:
 * - Updates RawMaterialStock balances.
 * - Creates one StockMovement(CONSUMPTION) per recipe item.
 * - Throws clear error codes for user-friendly validation messages.
 */
export async function consumeProductFromRecipeInTransaction(tx: Tx, input: ConsumeProductInput) {
  const { businessId, productId, quantity, note, referenceText, executorLabel, executorRole, sourceLabel, orderId } =
    input;

  if (!quantity.gt(new Prisma.Decimal(0))) {
    throw new Error("QUANTITY_INVALID");
  }

  const product = await tx.product.findFirst({
    where: {
      id: productId,
      businessId,
      archivedAt: null,
      isActive: true,
    },
    select: { id: true, nameAr: true },
  });
  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  const recipe = await tx.recipe.findFirst({
    where: { productId: product.id, businessId },
    include: {
      items: {
        include: {
          rawMaterial: {
            select: {
              id: true,
              nameAr: true,
              unit: { select: { symbol: true, nameAr: true } },
            },
          },
        },
        orderBy: { rawMaterial: { nameAr: "asc" } },
      },
    },
  });

  if (!recipe) {
    throw new Error("RECIPE_REQUIRED");
  }
  if (recipe.items.length === 0) {
    throw new Error("RECIPE_EMPTY");
  }

  const materialIds = recipe.items.map((item) => item.rawMaterialId);
  const stocks = await tx.rawMaterialStock.findMany({
    where: {
      businessId,
      rawMaterialId: { in: materialIds },
    },
    select: { rawMaterialId: true, balance: true },
  });
  const stockByMaterialId = new Map(stocks.map((s) => [s.rawMaterialId, new Prisma.Decimal(s.balance.toString())]));

  // Educational rule:
  // each recipe quantity is defined per ONE sold unit, so we multiply by requested quantity.
  // We validate all items first to guarantee "all-or-nothing" execution and prevent partial deduction.
  const shortages: InsufficientRecipeMaterial[] = [];
  const computedRequirements = recipe.items.map((item) => {
    const required = new Prisma.Decimal(item.quantity.toString()).mul(quantity);
    const available = stockByMaterialId.get(item.rawMaterialId) ?? new Prisma.Decimal(0);
    if (available.lt(required)) {
      shortages.push({
        rawMaterialId: item.rawMaterialId,
        rawMaterialNameAr: item.rawMaterial.nameAr,
        unitLabel: item.rawMaterial.unit.symbol || item.rawMaterial.unit.nameAr,
        required,
        available,
        shortage: required.sub(available),
      });
    }
    return { item, required };
  });

  if (shortages.length > 0) {
    throw new ConsumptionInsufficientStockError(shortages);
  }

  const hasOrderId = Boolean(orderId && orderId.trim().length > 0);
  const normalizedSource = sourceLabel?.trim().length ? sourceLabel.trim() : hasOrderId ? "POS Order" : "Consumption screen";
  const normalizedOrderId = orderId?.trim() ?? "";
  const reference = hasOrderId && normalizedSource === "POS Order"
    ? `POS consumption | Order: #${normalizedOrderId}`
    : referenceText?.trim().length
      ? referenceText.trim()
      : `Manual consumption | Product: ${product.nameAr}`;

  // Why one movement per raw material?
  // Audit/debug needs material-level traceability: each consumed ingredient must have its own ledger row.
  for (const { item, required } of computedRequirements) {
    const currentBalance = stockByMaterialId.get(item.rawMaterialId) ?? new Prisma.Decimal(0);
    const nextBalance = currentBalance.sub(required);

    const normalizedExecutor = executorLabel?.trim().length ? executorLabel.trim() : "Unknown";
    const normalizedRole = executorRole?.trim().length ? executorRole.trim() : "Unspecified";
    const detailedNoteLines = [
      `Reference: ${reference}`,
      `Product: ${product.nameAr}`,
      `Material: ${item.rawMaterial.nameAr}`,
      `Quantity: ${required.toString()} ${item.rawMaterial.unit.symbol || item.rawMaterial.unit.nameAr}`,
      `Balance before: ${currentBalance.toString()}`,
      `Balance after: ${nextBalance.toString()}`,
      `Executed by: ${normalizedExecutor} (${normalizedRole})`,
      `Source: ${normalizedSource}`,
      normalizedSource !== "POS Order" ? `Note: ${note?.trim().length ? note.trim() : "-"}` : null,
    ].filter(Boolean);

    stockByMaterialId.set(item.rawMaterialId, nextBalance);

    // Educational rule:
    // required deduction = recipe item quantity × requested product quantity.
    await applyStockMovementInTransaction(tx, {
      businessId,
      rawMaterialId: item.rawMaterialId,
      type: StockMovementType.CONSUMPTION,
      quantity: required,
      note: detailedNoteLines.join("\n"),
    });
  }

  return { consumedItemsCount: recipe.items.length, recipeId: recipe.id };
}

