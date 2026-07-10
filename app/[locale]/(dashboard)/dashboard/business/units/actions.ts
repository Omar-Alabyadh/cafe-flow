"use server";

import { requireCatalogMutationPermission } from "@/lib/catalog/require-owner-business";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import { revalidateAfterUnitMasterChange } from "@/lib/cache/revalidate-tenant-ui";
import { prisma } from "@/lib/prisma";

export type UnitFormState = { error: string | null };

/**
 * Units define how raw materials are counted (     ).
 */
export async function createUnit(
  _prev: UnitFormState,
  formData: FormData,
): Promise<UnitFormState> {
  const ctx = await requireCatalogMutationPermission(formData, "units.manage");
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
  const symbolRaw = String(formData.get("symbol") ?? "").trim();
  const symbol = symbolRaw.length > 0 ? symbolRaw : null;

  if (code.length < 1 || code.length > 20) {
    return { error: t("units.codeLength") };
  }
  if (!/^[a-z0-9-]+$/.test(code)) {
    return { error: t("units.codeFormat") };
  }
  if (nameAr.length < 1 || nameAr.length > 80) {
    return { error: t("units.nameArLength") };
  }

  try {
    await prisma.unit.create({
      data: {
        businessId: ctx.businessId,
        code,
        nameAr,
        nameEn,
        symbol,
      },
    });
  } catch {
    return { error: t("units.createFailed") };
  }

  revalidateAfterUnitMasterChange(ctx.locale);
  return { error: null };
}

export type SaveUnitState = {
  error: string | null;
  success?: boolean;
  completedAt?: number;
};

export async function saveUnit(_prev: SaveUnitState, formData: FormData): Promise<SaveUnitState> {
  const ctx = await requireCatalogMutationPermission(formData, "units.manage");
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));

  const unitIdRaw = String(formData.get("unitId") ?? "").trim();
  const unitId = unitIdRaw.length > 0 ? unitIdRaw : null;
  const code = String(formData.get("code") ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const nameEnRaw = String(formData.get("nameEn") ?? "").trim();
  const nameEn = nameEnRaw.length > 0 ? nameEnRaw : null;
  const symbolRaw = String(formData.get("symbol") ?? "").trim();
  const symbol = symbolRaw.length > 0 ? symbolRaw : null;

  if (code.length < 1 || code.length > 20) {
    return { error: t("units.codeLength") };
  }
  if (!/^[a-z0-9-]+$/.test(code)) {
    return { error: t("units.codeFormat") };
  }
  if (nameAr.length < 1 || nameAr.length > 80) {
    return { error: t("units.nameArLength") };
  }

  if (unitId) {
    const existing = await prisma.unit.findFirst({
      where: { id: unitId, businessId: ctx.businessId, archivedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return { error: t("units.notFound") };
    }
    try {
      await prisma.unit.update({ where: { id: unitId }, data: { code, nameAr, nameEn, symbol } });
    } catch {
      return { error: t("units.updateFailed") };
    }
    revalidateAfterUnitMasterChange(ctx.locale);
    return { error: null, success: true, completedAt: Date.now() };
  }

  try {
    await prisma.unit.create({
      data: {
        businessId: ctx.businessId,
        code,
        nameAr,
        nameEn,
        symbol,
      },
    });
  } catch {
    return { error: t("units.createFailed") };
  }

  revalidateAfterUnitMasterChange(ctx.locale);
  return { error: null, success: true, completedAt: Date.now() };
}

export async function archiveUnit(formData: FormData) {
  const ctx = await requireCatalogMutationPermission(formData, "units.manage");
  if (!ctx.ok) {
    return;
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const inUse = await prisma.rawMaterial.findFirst({
    where: { unitId: id, businessId: ctx.businessId, archivedAt: null },
    select: { id: true },
  });
  if (inUse) {
    return;
  }

  const row = await prisma.unit.findFirst({
    where: { id, businessId: ctx.businessId, archivedAt: null },
    select: { id: true },
  });
  if (!row) {
    return;
  }

  await prisma.unit.update({
    where: { id },
    data: { archivedAt: new Date() },
  });

  revalidateAfterUnitMasterChange(ctx.locale);
}
