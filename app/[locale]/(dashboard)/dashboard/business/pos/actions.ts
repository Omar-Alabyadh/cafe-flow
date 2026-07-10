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

type ValidatedPosCartLine = {
  productId: string;
  quantity: number;
};

export type PosSubmitState = {
  error: string | null;
  success: string | null;
};

const initialState: PosSubmitState = { error: null, success: null };
const MAX_POS_CART_LINES = 100;
const MAX_POS_LINE_QUANTITY = 999;
const POS_ID_PATTERN = /^c[a-z0-9]{8,}$/i;
const POS_IDEMPOTENCY_KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidPosId(value: unknown): value is string {
  return typeof value === "string" && POS_ID_PATTERN.test(value.trim());
}

function parsePosIdempotencyKey(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const key = value.trim();
  if (key.length !== 36 || !POS_IDEMPOTENCY_KEY_PATTERN.test(key)) {
    return null;
  }
  return key.toLowerCase();
}

function parsePosCartPayload(payloadRaw: string): { ok: true; lines: ValidatedPosCartLine[] } | { ok: false; reason: "empty" | "invalid" } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payloadRaw);
  } catch {
    return { ok: false, reason: "invalid" };
  }

  if (!Array.isArray(parsed)) {
    return { ok: false, reason: "invalid" };
  }
  if (parsed.length === 0) {
    return { ok: false, reason: "empty" };
  }
  if (parsed.length > MAX_POS_CART_LINES) {
    return { ok: false, reason: "invalid" };
  }

  const quantityByProductId = new Map<string, number>();
  for (const line of parsed) {
    if (!isPlainRecord(line)) {
      return { ok: false, reason: "invalid" };
    }

    const keys = Object.keys(line);
    if (keys.some((key) => key !== "productId" && key !== "quantity")) {
      return { ok: false, reason: "invalid" };
    }

    if (!isValidPosId(line.productId)) {
      return { ok: false, reason: "invalid" };
    }
    if (
      typeof line.quantity !== "number" ||
      !Number.isSafeInteger(line.quantity) ||
      line.quantity <= 0 ||
      line.quantity > MAX_POS_LINE_QUANTITY
    ) {
      return { ok: false, reason: "invalid" };
    }

    const productId = line.productId.trim();
    const nextQuantity = (quantityByProductId.get(productId) ?? 0) + line.quantity;
    if (nextQuantity > MAX_POS_LINE_QUANTITY) {
      return { ok: false, reason: "invalid" };
    }
    quantityByProductId.set(productId, nextQuantity);
  }

  const lines = Array.from(quantityByProductId, ([productId, quantity]) => ({ productId, quantity }));
  if (lines.length === 0) {
    return { ok: false, reason: "empty" };
  }
  return { ok: true, lines };
}

function cartSignature(lines: ValidatedPosCartLine[]): string {
  return [...lines]
    .sort((a, b) => a.productId.localeCompare(b.productId))
    .map((line) => `${line.productId}:${line.quantity}`)
    .join("|");
}

function decimalToSafeInteger(value: Prisma.Decimal): number | null {
  if (!value.isInteger()) {
    return null;
  }
  const n = value.toNumber();
  return Number.isSafeInteger(n) ? n : null;
}

type ExistingPosOrder = {
  id: string;
  status: OrderStatus;
  items: Array<{ productId: string; quantity: Prisma.Decimal }>;
};

function existingOrderMatchesCart(order: ExistingPosOrder, lines: ValidatedPosCartLine[]): boolean {
  if (order.status !== OrderStatus.COMPLETED || order.items.length !== lines.length) {
    return false;
  }
  const persistedLines: ValidatedPosCartLine[] = [];
  for (const item of order.items) {
    const quantity = decimalToSafeInteger(item.quantity);
    if (quantity === null) {
      return false;
    }
    persistedLines.push({ productId: item.productId, quantity });
  }
  return cartSignature(persistedLines) === cartSignature(lines);
}

async function findExistingPosOrder(businessId: string, idempotencyKey: string): Promise<ExistingPosOrder | null> {
  return prisma.order.findFirst({
    where: { businessId, idempotencyKey },
    select: {
      id: true,
      status: true,
      items: {
        select: { productId: true, quantity: true },
        orderBy: { productId: "asc" },
      },
    },
  });
}

function isExpectedPosIdempotencyConflict(error: unknown): boolean {
  if (error === null || typeof error !== "object" || !("code" in error)) {
    return false;
  }
  const candidate = error as { code?: unknown; meta?: { target?: unknown } };
  if (candidate.code !== "P2002") {
    return false;
  }
  const target = candidate.meta?.target;
  if (Array.isArray(target)) {
    return target.includes("idempotencyKey");
  }
  return typeof target === "string" && target.includes("idempotencyKey");
}

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
  const idempotencyKey = parsePosIdempotencyKey(formData.get("idempotencyKey"));
  if (!idempotencyKey) {
    return { ...initialState, error: t("pos.idempotencyKeyInvalid") };
  }

  const payloadRaw = String(formData.get("cart") ?? "").trim();
  if (!payloadRaw) {
    return { ...initialState, error: t("pos.cartMissing") };
  }

  const parsedCart = parsePosCartPayload(payloadRaw);
  if (!parsedCart.ok && parsedCart.reason === "invalid") {
    return { ...initialState, error: t("pos.cartInvalid") };
  }
  if (!parsedCart.ok) {
    return { ...initialState, error: t("pos.cartEmpty") };
  }
  const cleanCart = parsedCart.lines;
  const existingOrder = await findExistingPosOrder(ctx.businessId, idempotencyKey);
  if (existingOrder) {
    if (!existingOrderMatchesCart(existingOrder, cleanCart)) {
      return { ...initialState, error: t("pos.idempotencyConflict") };
    }
    return { error: null, success: t("pos.success", { id: existingOrder.id.slice(0, 8) }) };
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
        select: { id: true, nameAr: true, basePrice: true },
      });
      const productMap = new Map(products.map((product) => [product.id, product]));
      const actor = await tx.user.findUnique({
        where: { id: ctx.userId },
        select: { fullName: true },
      });

      if (productMap.size !== productIds.length) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const verifiedLines = cleanCart.map((line) => {
        const product = productMap.get(line.productId);
        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }
        return {
          product,
          quantity: new Prisma.Decimal(line.quantity.toString()),
          unitPrice: new Prisma.Decimal(product.basePrice.toString()),
        };
      });
      const serverSubtotal = verifiedLines.reduce(
        (sum, line) => sum.add(line.unitPrice.mul(line.quantity)),
        new Prisma.Decimal(0),
      );
      if (serverSubtotal.lt(new Prisma.Decimal(0))) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const order = await tx.order.create({
        data: {
          businessId: ctx.businessId,
          idempotencyKey,
          status: OrderStatus.DRAFT,
          notes: t("pos.orderNotes"),
        },
      });

      for (const line of verifiedLines) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: line.product.id,
            quantity: line.quantity,
          },
        });
      }

      // POS rule in this phase:
      // if product has recipe items => deduct stock.
      // if product has no recipe => keep order completion without deduction.
      for (const line of verifiedLines) {
        const recipe = await tx.recipe.findFirst({
          where: { businessId: ctx.businessId, productId: line.product.id },
          include: { items: { select: { id: true } } },
        });
        if (!recipe || recipe.items.length === 0) {
          continue;
        }

        await consumeProductFromRecipeInTransaction(tx, {
          businessId: ctx.businessId,
          productId: line.product.id,
          quantity: line.quantity,
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
    if (isExpectedPosIdempotencyConflict(error)) {
      const replayedOrder = await findExistingPosOrder(ctx.businessId, idempotencyKey);
      if (!replayedOrder) {
        return { ...initialState, error: t("pos.idempotencyDuplicateFailed") };
      }
      if (!existingOrderMatchesCart(replayedOrder, cleanCart)) {
        return { ...initialState, error: t("pos.idempotencyConflict") };
      }
      return { error: null, success: t("pos.success", { id: replayedOrder.id.slice(0, 8) }) };
    }
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
