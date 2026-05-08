"use server";

import { requireOwnerBusinessForCatalog } from "@/lib/catalog/require-owner-business";
import type { ServerActionTranslator } from "@/lib/i18n/server-action-translator";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import {
  revalidateAfterSharedCatalogUxChange,
  revalidateBusinessHub,
  revalidateProductsPage,
  revalidateRecipesSubtree,
} from "@/lib/cache/revalidate-tenant-ui";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/** Keys we can attach inline validation messages to in the product form. */
export type ProductFieldKey = "code" | "nameAr" | "nameEn" | "categoryId" | "basePrice";

/**
 * Server action state for saving a product (create or update).
 * - `fieldErrors`: per-field messages for inline UI
 * - `success` + `completedAt`: lets the client show a toast once per successful save
 */
export type ProductFormState = {
  error: string | null;
  fieldErrors?: Partial<Record<ProductFieldKey, string>>;
  success?: "created" | "updated";
  completedAt?: number;
};

type ParsedProductPayload = {
  productId: string | null;
  code: string;
  nameAr: string;
  nameEn: string | null;
  categoryId: string | null;
  basePrice: Prisma.Decimal;
};

/**
 * Reads FormData and validates business rules for both create and update.
 * Returns either parsed values ready for Prisma or a state object with `fieldErrors`.
 */
function parseAndValidateProductForm(
  formData: FormData,
  t: ServerActionTranslator,
):
  | { ok: true; data: ParsedProductPayload }
  | { ok: false; state: ProductFormState } {
  const productIdRaw = String(formData.get("productId") ?? "").trim();
  const productId = productIdRaw.length > 0 ? productIdRaw : null;

  const code = String(formData.get("code") ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const nameEnRaw = String(formData.get("nameEn") ?? "").trim();
  const nameEn = nameEnRaw.length > 0 ? nameEnRaw : null;
  const categoryRaw = String(formData.get("categoryId") ?? "").trim();
  const categoryId = categoryRaw.length > 0 ? categoryRaw : null;
  const priceRaw = String(formData.get("basePrice") ?? "").trim();

  const fieldErrors: Partial<Record<ProductFieldKey, string>> = {};

  if (code.length < 2 || code.length > 40) {
    fieldErrors.code = t("products.codeLength");
  } else if (!/^[a-z0-9-]+$/.test(code)) {
    fieldErrors.code = t("products.codeFormat");
  }

  if (nameAr.length < 2 || nameAr.length > 120) {
    fieldErrors.nameAr = t("products.nameArLength");
  }

  if (nameEn !== null && nameEn.length > 120) {
    fieldErrors.nameEn = t("products.nameEnLength");
  }

  if (!/^\d+(\.\d{1,2})?$/.test(priceRaw)) {
    fieldErrors.basePrice = t("products.basePriceInvalid");
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, state: { error: null, fieldErrors } };
  }

  const basePrice = new Prisma.Decimal(priceRaw);

  return {
    ok: true,
    data: {
      productId,
      code,
      nameAr,
      nameEn,
      categoryId,
      basePrice,
    },
  };
}

/** Keeps POS, recipes, KPI cards, and analytics aligned after catalog mutations. */
function revalidateProductCatalogSurfaces(locale: string) {
  revalidateProductsPage(locale);
  revalidateBusinessHub(locale);
  revalidateRecipesSubtree(locale);
  revalidateAfterSharedCatalogUxChange(locale);
}

/**
 * Creates a new product or updates an existing one depending on hidden `productId`.
 * Revalidates catalog views after a successful write.
 */
export async function saveProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const ctx = await requireOwnerBusinessForCatalog(formData);
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));
  const parsed = parseAndValidateProductForm(formData, t);
  if (!parsed.ok) {
    return parsed.state;
  }

  const { productId, code, nameAr, nameEn, categoryId, basePrice } = parsed.data;

  if (categoryId) {
    const cat = await prisma.category.findFirst({
      where: { id: categoryId, businessId: ctx.businessId, archivedAt: null },
      select: { id: true },
    });
    if (!cat) {
      return {
        error: null,
        fieldErrors: { categoryId: t("products.categoryInvalid") },
      };
    }
  }

  if (productId) {
    const existing = await prisma.product.findFirst({
      where: { id: productId, businessId: ctx.businessId, archivedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return { error: t("products.notFound") };
    }

    try {
      await prisma.product.update({
        where: { id: productId },
        data: {
          code,
          nameAr,
          nameEn,
          categoryId,
          basePrice,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return {
          error: null,
          fieldErrors: { code: t("products.codeDuplicate") },
        };
      }
      return { error: t("products.saveFailed") };
    }

    revalidateProductCatalogSurfaces(ctx.locale);
    return { error: null, success: "updated", completedAt: Date.now() };
  }

  try {
    await prisma.product.create({
      data: {
        businessId: ctx.businessId,
        code,
        nameAr,
        nameEn,
        categoryId,
        basePrice,
        isActive: true,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        error: null,
        fieldErrors: { code: t("products.createCodeDuplicate") },
      };
    }
    return { error: t("products.createFailed") };
  }

  revalidateProductCatalogSurfaces(ctx.locale);
  return { error: null, success: "created", completedAt: Date.now() };
}

/**
 * Soft-delete (archive) a product from the owner UI — keeps history for orders/audit.
 */
export async function archiveProduct(formData: FormData) {
  const ctx = await requireOwnerBusinessForCatalog(formData);
  if (!ctx.ok) {
    return;
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const row = await prisma.product.findFirst({
    where: { id, businessId: ctx.businessId, archivedAt: null },
    select: { id: true },
  });
  if (!row) {
    return;
  }

  await prisma.product.update({
    where: { id },
    data: {
      archivedAt: new Date(),
      isActive: false,
    },
  });

  revalidateProductCatalogSurfaces(ctx.locale);
}
