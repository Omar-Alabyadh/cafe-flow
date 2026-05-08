import { prisma } from "@/lib/prisma";
import { formatArabicLatnInteger, formatArabicLatnQuantity } from "@/lib/format/numbers";
import { Prisma } from "@prisma/client";
import { BrainCircuit } from "lucide-react";

type AiInsightsCardProps = {
  businessId: string;
};

/**
 * Phase 11 rule-based "AI insights" (no external AI services).
 *
 * We keep the logic academically explainable:
 * 1) detect one low-stock material,
 * 2) detect most consumed material from CONSUMPTION movements,
 * 3) detect most ordered product from completed orders.
 */
export async function AiInsightsCard({ businessId }: AiInsightsCardProps) {
  const [materials, materialUsage, productSales] = await Promise.all([
    prisma.rawMaterial.findMany({
      where: { businessId, archivedAt: null },
      include: { stock: true },
      orderBy: { nameAr: "asc" },
    }),
    prisma.stockMovement.groupBy({
      by: ["rawMaterialId"],
      where: { businessId, type: "CONSUMPTION" },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 1,
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: { businessId, status: "COMPLETED", archivedAt: null } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 1,
    }),
  ]);

  const lowStockMaterial = materials.find((m) => {
    if (m.minimumQuantity <= 0) return false;
    const balance = m.stock ? new Prisma.Decimal(m.stock.balance.toString()) : new Prisma.Decimal(0);
    return balance.lt(new Prisma.Decimal(m.minimumQuantity));
  });

  const [mostUsedMaterial, mostOrderedProduct] = await Promise.all([
    materialUsage[0]
      ? prisma.rawMaterial.findUnique({
          where: { id: materialUsage[0].rawMaterialId },
          select: { nameAr: true, unit: { select: { nameAr: true } } },
        })
      : Promise.resolve(null),
    productSales[0]
      ? prisma.product.findUnique({
          where: { id: productSales[0].productId },
          select: { nameAr: true },
        })
      : Promise.resolve(null),
  ]);

  const lowStockCount = materials.filter((m) => {
    if (m.minimumQuantity <= 0) return false;
    const balance = m.stock ? new Prisma.Decimal(m.stock.balance.toString()) : new Prisma.Decimal(0);
    return balance.lt(new Prisma.Decimal(m.minimumQuantity));
  }).length;

  const mostUsedQuantity = materialUsage[0]?._sum.quantity
    ? formatArabicLatnQuantity(new Prisma.Decimal(materialUsage[0]._sum.quantity.toString()).toNumber())
    : null;
  const mostOrderedQuantity = productSales[0]?._sum.quantity
    ? formatArabicLatnQuantity(new Prisma.Decimal(productSales[0]._sum.quantity.toString()).toNumber())
    : null;

  const insights: string[] = [];
  if (lowStockMaterial) {
    insights.push(`Material (${lowStockMaterial.nameAr}) is approaching minimum threshold.`);
    insights.push(`Consider restocking (${lowStockMaterial.nameAr}).`);
  }
  if (mostOrderedProduct) {
    insights.push(
      `Product (${mostOrderedProduct.nameAr}) is currently the most ordered${mostOrderedQuantity ? ` with quantity (${mostOrderedQuantity})` : ""}.`,
    );
  }
  if (mostUsedMaterial) {
    insights.push(
      `Material (${mostUsedMaterial.nameAr}) is the most consumed in recipes${mostUsedQuantity ? ` with total (${mostUsedQuantity} ${mostUsedMaterial.unit.nameAr})` : ""}.`,
    );
  }

  if (insights.length === 0) {
    insights.push("No enough data yet to generate smart insights.");
  }

  return (
    <div className="cf-surface rounded-xl p-6">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <BrainCircuit className="h-4 w-4 text-indigo-500" />
        Smart insights (rule-based)
      </p>
      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg bg-zinc-50 p-2 text-xs dark:bg-zinc-950">
          Below-threshold materials:{" "}
          <span className="font-semibold tabular-nums">{formatArabicLatnInteger(lowStockCount)}</span>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2 text-xs dark:bg-zinc-950">
          Top ordered product: <span className="font-semibold">{mostOrderedProduct?.nameAr ?? "—"}</span>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2 text-xs dark:bg-zinc-950">
          Top consumed material: <span className="font-semibold">{mostUsedMaterial?.nameAr ?? "—"}</span>
        </div>
      </div>
      <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
        {insights.map((text, index) => (
          <li key={`${index}-${text}`} className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-950">
            {text}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-zinc-500">These insights are generated directly from current order and inventory data.</p>
    </div>
  );
}

