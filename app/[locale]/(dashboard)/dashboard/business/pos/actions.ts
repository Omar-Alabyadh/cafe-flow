"use server";

import { signOut } from "@/auth";
import { requireOwnerBusinessForCatalog } from "@/lib/catalog/require-owner-business";
import { clearPlatformStepUpCookie } from "@/lib/platform/platform-step-up-cookie";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import { consumeProductFromRecipeInTransaction } from "@/lib/inventory/consume-product-from-recipe";
import {
  revalidateAfterStockImpact,
  revalidateOrderDetail,
  revalidateOrdersIndex,
} from "@/lib/cache/revalidate-tenant-ui";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@prisma/client";

type PosCartLine = {
  productId: string;
  quantity: number;
};

export type PosSubmitState = {
  error: string | null;
  success: string | null;
};

const initialState: PosSubmitState = { error: null, success: null };

/**
 * POS rail:         (Auth.js signOut)          .
 *                          .
 */
export async function signOutFromPos(formData: FormData) {
  const raw = String(formData.get("locale") ?? "ar").trim();
  const locale = raw.replace(/[^\w-]/g, "") || "ar";
  await clearPlatformStepUpCookie();
  await signOut({ redirectTo: `/${locale}/sign-in` });
}

/**
 * POS completion flow:
 * - creates one order,
 * - writes all order items,
 * - deducts stock only for items that have valid recipes,
 * - completes order in the same transaction.
 *
 * This does NOT modify existing orders actions. It is a dedicated POS flow.
 */
export async function submitPosOrder(
  _prev: PosSubmitState,
  formData: FormData,
): Promise<PosSubmitState> {
  /**
   * POS is an operational write path; page-level guards are not enough.
   * We enforce tenant context + POS permission on the server action to block forged requests.
   */
  const ctx = await requireOwnerBusinessForCatalog(formData, ["pos.access", "pos.payment.capture"]);
  if (!ctx.ok) {
    return { ...initialState, error: ctx.error };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));

  const payloadRaw = String(formData.get("cart") ?? "").trim();
  if (!payloadRaw) {
    return { ...initialState, error: t("pos.cartMissing") };
  }

  let cart: PosCartLine[] = [];
  try {
    cart = JSON.parse(payloadRaw) as PosCartLine[];
  } catch {
    return { ...initialState, error: t("pos.cartInvalid") };
  }

  const cleanCart = cart.filter((line) => line.productId && Number.isFinite(line.quantity) && line.quantity > 0);
  if (cleanCart.length === 0) {
    return { ...initialState, error: t("pos.cartEmpty") };
  }

  try {
    const orderId = await prisma.$transaction(async (tx) => {
      const productIds = cleanCart.map((line) => line.productId);
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          businessId: ctx.businessId,
          archivedAt: null,
          isActive: true,
        },
        select: { id: true, nameAr: true },
      });
      const productMap = new Map(products.map((product) => [product.id, product]));
      const actor = await tx.user.findUnique({
        where: { id: ctx.userId },
        select: { fullName: true },
      });

      const missing = cleanCart.find((line) => !productMap.has(line.productId));
      if (missing) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const order = await tx.order.create({
        data: {
          businessId: ctx.businessId,
          status: OrderStatus.DRAFT,
          notes: t("pos.orderNotes"),
        },
      });

      for (const line of cleanCart) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: line.productId,
            quantity: new Prisma.Decimal(line.quantity),
          },
        });
      }

      // POS rule in this phase:
      // if product has recipe items => deduct stock.
      // if product has no recipe => keep order completion without deduction.
      for (const line of cleanCart) {
        const recipe = await tx.recipe.findFirst({
          where: { businessId: ctx.businessId, productId: line.productId },
          include: { items: { select: { id: true } } },
        });
        if (!recipe || recipe.items.length === 0) {
          continue;
        }

        await consumeProductFromRecipeInTransaction(tx, {
          businessId: ctx.businessId,
          productId: line.productId,
          quantity: new Prisma.Decimal(line.quantity),
          orderId: order.id,
          executorLabel: actor?.fullName ?? t("pos.executorUnknown"),
          executorRole: t("pos.executorRole"),
          sourceLabel: t("pos.sourceLabel"),
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.COMPLETED, completedAt: new Date() },
      });

      return order.id;
    });

    /**
     * POS completion touches orders, stock, and dashboard KPIs in one shot.
     * We reuse the shared stock invalidation helper so POS availability stays aligned with inventory.
     */
    revalidateAfterStockImpact(ctx.locale);
    revalidateOrdersIndex(ctx.locale);
    revalidateOrderDetail(ctx.locale, orderId);

    return { error: null, success: t("pos.success", { id: orderId.slice(0, 8) }) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "PRODUCT_NOT_FOUND") {
      return { ...initialState, error: t("pos.productNotFound") };
    }
    if (message === "INSUFFICIENT_STOCK") {
      return { ...initialState, error: t("pos.insufficientStock") };
    }
    return { ...initialState, error: t("pos.genericError") };
  }
}
