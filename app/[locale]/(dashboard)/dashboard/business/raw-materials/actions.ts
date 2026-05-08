"use server";

import { requireOwnerBusinessForCatalog } from "@/lib/catalog/require-owner-business";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import { revalidateAfterRawMaterialMasterChange } from "@/lib/cache/revalidate-tenant-ui";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type RawMaterialFormState = { error: string | null };

/**
 * Raw materials are ingredients you will track in stock later; here we only store master data.
 */
export async function createRawMaterial(
  _prev: RawMaterialFormState,
  formData: FormData,
): Promise<RawMaterialFormState> {
  const ctx = await requireOwnerBusinessForCatalog(formData);
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
  const unitId = String(formData.get("unitId") ?? "").trim();
  const supplierRaw = String(formData.get("supplierId") ?? "").trim();
  const supplierId = supplierRaw.length > 0 ? supplierRaw : null;
  const costRaw = String(formData.get("costPerUnit") ?? "").trim();
  const minRaw = String(formData.get("minimumQuantity") ?? "").trim();

  if (code.length < 2 || code.length > 40) {
    return { error: t("rawMaterials.codeLength") };
  }
  if (!/^[a-z0-9-]+$/.test(code)) {
    return { error: t("rawMaterials.codeFormat") };
  }
  if (nameAr.length < 2 || nameAr.length > 120) {
    return { error: t("rawMaterials.nameArLength") };
  }
  if (!unitId) {
    return { error: t("rawMaterials.unitRequired") };
  }

  const unit = await prisma.unit.findFirst({
    where: { id: unitId, businessId: ctx.businessId, archivedAt: null },
    select: { id: true },
  });
  if (!unit) {
    return { error: t("rawMaterials.unitInvalid") };
  }

  if (supplierId) {
    const sup = await prisma.supplier.findFirst({
      where: { id: supplierId, businessId: ctx.businessId, archivedAt: null },
      select: { id: true },
    });
    if (!sup) {
      return { error: t("rawMaterials.supplierInvalid") };
    }
  }

  if (!/^\d+(\.\d{1,4})?$/.test(costRaw)) {
    return { error: t("rawMaterials.costInvalid") };
  }
  const costPerUnit = new Prisma.Decimal(costRaw);

  const minQty = minRaw.length > 0 ? Number.parseInt(minRaw, 10) : 0;
  if (!Number.isFinite(minQty) || minQty < 0 || minQty > 1_000_000) {
    return { error: t("rawMaterials.minQtyInvalid") };
  }

  try {
    await prisma.rawMaterial.create({
      data: {
        businessId: ctx.businessId,
        code,
        nameAr,
        nameEn,
        unitId,
        supplierId,
        costPerUnit,
        minimumQuantity: minQty,
        isActive: true,
      },
    });
  } catch {
    return { error: t("rawMaterials.createFailed") };
  }

  revalidateAfterRawMaterialMasterChange(ctx.locale);
  return { error: null };
}

export type SaveRawMaterialState = {
  error: string | null;
  success?: boolean;
  completedAt?: number;
};

export async function saveRawMaterial(
  _prev: SaveRawMaterialState,
  formData: FormData,
): Promise<SaveRawMaterialState> {
  const ctx = await requireOwnerBusinessForCatalog(formData);
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));

  const rawMaterialIdRaw = String(formData.get("rawMaterialId") ?? "").trim();
  const rawMaterialId = rawMaterialIdRaw.length > 0 ? rawMaterialIdRaw : null;
  const code = String(formData.get("code") ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const nameEnRaw = String(formData.get("nameEn") ?? "").trim();
  const nameEn = nameEnRaw.length > 0 ? nameEnRaw : null;
  const unitId = String(formData.get("unitId") ?? "").trim();
  const supplierRaw = String(formData.get("supplierId") ?? "").trim();
  const supplierId = supplierRaw.length > 0 ? supplierRaw : null;
  const costRaw = String(formData.get("costPerUnit") ?? "").trim();
  const minRaw = String(formData.get("minimumQuantity") ?? "").trim();

  if (code.length < 2 || code.length > 40) {
    return { error: t("rawMaterials.codeLength") };
  }
  if (!/^[a-z0-9-]+$/.test(code)) {
    return { error: t("rawMaterials.codeFormat") };
  }
  if (nameAr.length < 2 || nameAr.length > 120) {
    return { error: t("rawMaterials.nameArLength") };
  }
  if (!unitId) {
    return { error: t("rawMaterials.unitRequired") };
  }

  const unit = await prisma.unit.findFirst({
    where: { id: unitId, businessId: ctx.businessId, archivedAt: null },
    select: { id: true },
  });
  if (!unit) {
    return { error: t("rawMaterials.unitInvalid") };
  }
  if (supplierId) {
    const sup = await prisma.supplier.findFirst({
      where: { id: supplierId, businessId: ctx.businessId, archivedAt: null },
      select: { id: true },
    });
    if (!sup) {
      return { error: t("rawMaterials.supplierInvalid") };
    }
  }
  if (!/^\d+(\.\d{1,4})?$/.test(costRaw)) {
    return { error: t("rawMaterials.costInvalid") };
  }
  const costPerUnit = new Prisma.Decimal(costRaw);
  const minQty = minRaw.length > 0 ? Number.parseInt(minRaw, 10) : 0;
  if (!Number.isFinite(minQty) || minQty < 0 || minQty > 1_000_000) {
    return { error: t("rawMaterials.minQtyInvalid") };
  }

  if (rawMaterialId) {
    const existing = await prisma.rawMaterial.findFirst({
      where: { id: rawMaterialId, businessId: ctx.businessId, archivedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return { error: t("rawMaterials.notFound") };
    }

    try {
      await prisma.rawMaterial.update({
        where: { id: rawMaterialId },
        data: { code, nameAr, nameEn, unitId, supplierId, costPerUnit, minimumQuantity: minQty },
      });
    } catch {
      return { error: t("rawMaterials.updateFailed") };
    }
  } else {
    try {
      await prisma.rawMaterial.create({
        data: {
          businessId: ctx.businessId,
          code,
          nameAr,
          nameEn,
          unitId,
          supplierId,
          costPerUnit,
          minimumQuantity: minQty,
          isActive: true,
        },
      });
    } catch {
      return { error: t("rawMaterials.createFailedSave") };
    }
  }

  revalidateAfterRawMaterialMasterChange(ctx.locale);
  return { error: null, success: true, completedAt: Date.now() };
}

export async function archiveRawMaterial(formData: FormData) {
  const ctx = await requireOwnerBusinessForCatalog(formData);
  if (!ctx.ok) {
    return;
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const row = await prisma.rawMaterial.findFirst({
    where: { id, businessId: ctx.businessId, archivedAt: null },
    select: { id: true },
  });
  if (!row) {
    return;
  }

  await prisma.rawMaterial.update({
    where: { id },
    data: {
      archivedAt: new Date(),
      isActive: false,
    },
  });

  revalidateAfterRawMaterialMasterChange(ctx.locale);
}
