import { signedDeltaFromMovement } from "@/lib/inventory/stock-movement-math";
import { Prisma, StockMovementType } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export type ApplyStockMovementInput = {
  businessId: string;
  rawMaterialId: string;
  type: StockMovementType;
  /** Always positive; direction comes from `type`. */
  quantity: Prisma.Decimal;
  unitCost?: Prisma.Decimal | null;
  note?: string | null;
};

/**
 * Records one stock movement and updates (or creates) the cached RawMaterialStock row.
 * Runs inside an existing transaction so the movement + balance stay in sync.
 *
 * Business rule for Phase 6: we never allow negative on-hand quantity.
 * (Order-based deduction will use the same rule later.)
 */
export async function applyStockMovementInTransaction(tx: Tx, input: ApplyStockMovementInput) {
  const { businessId, rawMaterialId, type, quantity, unitCost, note } = input;

  if (!quantity.gt(new Prisma.Decimal(0))) {
    throw new Error("QUANTITY_INVALID");
  }

  const material = await tx.rawMaterial.findFirst({
    where: {
      id: rawMaterialId,
      businessId,
      archivedAt: null,
    },
    select: { id: true },
  });
  if (!material) {
    throw new Error("MATERIAL_NOT_FOUND");
  }

  const delta = signedDeltaFromMovement(type, quantity);

  let stock = await tx.rawMaterialStock.findUnique({
    where: { rawMaterialId },
  });

  if (!stock) {
    stock = await tx.rawMaterialStock.create({
      data: {
        businessId,
        rawMaterialId,
        balance: new Prisma.Decimal(0),
      },
    });
  }

  const currentBalance = new Prisma.Decimal(stock.balance.toString());
  const nextBalance = currentBalance.add(delta);

  if (nextBalance.lt(new Prisma.Decimal(0))) {
    throw new Error("INSUFFICIENT_STOCK");
  }

  await tx.rawMaterialStock.update({
    where: { rawMaterialId },
    data: { balance: nextBalance },
  });

  await tx.stockMovement.create({
    data: {
      businessId,
      rawMaterialId,
      type,
      quantity,
      unitCost: unitCost ?? null,
      note: note?.length ? note : null,
    },
  });
}
