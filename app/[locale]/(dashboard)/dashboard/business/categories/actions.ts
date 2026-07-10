"use server";

import { requireCatalogMutationPermission } from "@/lib/catalog/require-owner-business";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import {
  revalidateAfterSharedCatalogUxChange,
  revalidateBusinessHub,
  revalidateCategoriesPage,
  revalidateProductsPage,
} from "@/lib/cache/revalidate-tenant-ui";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type CategoryFormState = {
  error: string | null;
  success?: boolean;
  completedAt?: number;
};

function parseCategoryForm(formData: FormData) {
  const code = String(formData.get("code") ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const nameEnRaw = String(formData.get("nameEn") ?? "").trim();
  const nameEn = nameEnRaw.length > 0 ? nameEnRaw : null;
  const descRaw = String(formData.get("description") ?? "").trim();
  const description = descRaw.length > 0 ? descRaw : null;
  return { code, nameAr, nameEn, description };
}

/**
 *         —                        .
 */
export async function saveCategory(_prev: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  const ctx = await requireCatalogMutationPermission(formData, "categories.manage");
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));

  const categoryIdRaw = String(formData.get("categoryId") ?? "").trim();
  const categoryId = categoryIdRaw.length > 0 ? categoryIdRaw : null;

  const { code, nameAr, nameEn, description } = parseCategoryForm(formData);

  if (code.length < 2 || code.length > 40) {
    return { error: t("categories.codeLength") };
  }
  if (!/^[a-z0-9-]+$/.test(code)) {
    return { error: t("categories.codeFormat") };
  }
  if (nameAr.length < 2 || nameAr.length > 120) {
    return { error: t("categories.nameArLength") };
  }

  const revalidate = () => {
    revalidateCategoriesPage(ctx.locale);
    revalidateBusinessHub(ctx.locale);
    revalidateProductsPage(ctx.locale);
    revalidateAfterSharedCatalogUxChange(ctx.locale);
  };

  if (categoryId) {
    const existing = await prisma.category.findFirst({
      where: { id: categoryId, businessId: ctx.businessId, archivedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return { error: t("categories.notFound") };
    }

    try {
      await prisma.category.update({
        where: { id: categoryId },
        data: { code, nameAr, nameEn, description },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { error: t("categories.codeDuplicate") };
      }
      return { error: t("categories.updateFailed") };
    }

    revalidate();
    return { error: null, success: true, completedAt: Date.now() };
  }

  try {
    await prisma.category.create({
      data: {
        businessId: ctx.businessId,
        code,
        nameAr,
        nameEn,
        description,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: t("categories.createDuplicate") };
    }
    return { error: t("categories.createFailed") };
  }

  revalidate();
  return { error: null, success: true, completedAt: Date.now() };
}

/** Soft-delete: hide from lists but keep history in the database. */
export async function archiveCategory(formData: FormData) {
  const ctx = await requireCatalogMutationPermission(formData, "categories.manage");
  if (!ctx.ok) {
    return;
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const row = await prisma.category.findFirst({
    where: { id, businessId: ctx.businessId, archivedAt: null },
    select: { id: true },
  });
  if (!row) {
    return;
  }

  const usedByProduct = await prisma.product.findFirst({
    where: { categoryId: id, businessId: ctx.businessId, archivedAt: null },
    select: { id: true },
  });
  if (usedByProduct) {
    return;
  }

  await prisma.category.update({
    where: { id },
    data: { archivedAt: new Date() },
  });

  revalidateCategoriesPage(ctx.locale);
  revalidateProductsPage(ctx.locale);
  revalidateBusinessHub(ctx.locale);
  revalidateAfterSharedCatalogUxChange(ctx.locale);
}
