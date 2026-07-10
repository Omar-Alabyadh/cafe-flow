"use server";

import { requireCatalogMutationPermission } from "@/lib/catalog/require-owner-business";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import {
  revalidateAddonsPage,
  revalidateAfterSharedCatalogUxChange,
  revalidateBusinessHub,
} from "@/lib/cache/revalidate-tenant-ui";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type AddonFormState = { error: string | null };

/**
 * Add-ons are priced extras customers can attach to drinks (     ).
 */
export async function createAddon(
  _prev: AddonFormState,
  formData: FormData,
): Promise<AddonFormState> {
  const ctx = await requireCatalogMutationPermission(formData, "addons.manage");
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));

  const code = String(formData.get("code") ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const nameEnRaw = String(formData.get("nameEn") ?? "").trim();
  const nameEn = nameEnRaw.length > 0 ? nameEnRaw : null;
  const priceRaw = String(formData.get("extraPrice") ?? "").trim();

  if (code.length < 2 || code.length > 40) {
    return { error: t("addons.codeLength") };
  }
  if (!/^[a-z0-9-]+$/.test(code)) {
    return { error: t("addons.codeFormat") };
  }
  if (nameAr.length < 2 || nameAr.length > 120) {
    return { error: t("addons.nameArLength") };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(priceRaw)) {
    return { error: t("addons.priceInvalid") };
  }
  const extraPrice = new Prisma.Decimal(priceRaw);

  try {
    await prisma.addon.create({
      data: {
        businessId: ctx.businessId,
        code,
        nameAr,
        nameEn,
        extraPrice,
        isActive: true,
      },
    });
  } catch {
    return { error: t("addons.createFailed") };
  }

  revalidateAddonsPage(ctx.locale);
  revalidateBusinessHub(ctx.locale);
  revalidateAfterSharedCatalogUxChange(ctx.locale);
  return { error: null };
}

export type SaveAddonState = {
  error: string | null;
  success?: boolean;
  completedAt?: number;
};

/**
 * Create or update add-on while preserving existing validation and ownership checks.
 */
export async function saveAddon(_prev: SaveAddonState, formData: FormData): Promise<SaveAddonState> {
  const ctx = await requireCatalogMutationPermission(formData, "addons.manage");
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));

  const addonIdRaw = String(formData.get("addonId") ?? "").trim();
  const addonId = addonIdRaw.length > 0 ? addonIdRaw : null;
  const code = String(formData.get("code") ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const nameEnRaw = String(formData.get("nameEn") ?? "").trim();
  const nameEn = nameEnRaw.length > 0 ? nameEnRaw : null;
  const priceRaw = String(formData.get("extraPrice") ?? "").trim();

  if (code.length < 2 || code.length > 40) {
    return { error: t("addons.codeLength") };
  }
  if (!/^[a-z0-9-]+$/.test(code)) {
    return { error: t("addons.codeFormat") };
  }
  if (nameAr.length < 2 || nameAr.length > 120) {
    return { error: t("addons.nameArLength") };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(priceRaw)) {
    return { error: t("addons.priceInvalid") };
  }
  const extraPrice = new Prisma.Decimal(priceRaw);

  const revalidate = () => {
    revalidateAddonsPage(ctx.locale);
    revalidateBusinessHub(ctx.locale);
    revalidateAfterSharedCatalogUxChange(ctx.locale);
  };

  if (addonId) {
    const existing = await prisma.addon.findFirst({
      where: { id: addonId, businessId: ctx.businessId, archivedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return { error: t("addons.notFound") };
    }

    try {
      await prisma.addon.update({
        where: { id: addonId },
        data: {
          code,
          nameAr,
          nameEn,
          extraPrice,
        },
      });
    } catch {
      return { error: t("addons.updateFailed") };
    }

    revalidate();
    return { error: null, success: true, completedAt: Date.now() };
  }

  try {
    await prisma.addon.create({
      data: {
        businessId: ctx.businessId,
        code,
        nameAr,
        nameEn,
        extraPrice,
        isActive: true,
      },
    });
  } catch {
    return { error: t("addons.createFailedGeneric") };
  }

  revalidate();
  return { error: null, success: true, completedAt: Date.now() };
}

export async function archiveAddon(formData: FormData) {
  const ctx = await requireCatalogMutationPermission(formData, "addons.manage");
  if (!ctx.ok) {
    return;
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const row = await prisma.addon.findFirst({
    where: { id, businessId: ctx.businessId, archivedAt: null },
    select: { id: true },
  });
  if (!row) {
    return;
  }

  await prisma.addon.update({
    where: { id },
    data: {
      archivedAt: new Date(),
      isActive: false,
    },
  });

  revalidateAddonsPage(ctx.locale);
  revalidateBusinessHub(ctx.locale);
  revalidateAfterSharedCatalogUxChange(ctx.locale);
}
