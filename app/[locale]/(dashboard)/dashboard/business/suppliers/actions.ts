"use server";

import { requireCatalogMutationPermission } from "@/lib/catalog/require-owner-business";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import { revalidateAfterSupplierMasterChange } from "@/lib/cache/revalidate-tenant-ui";
import { prisma } from "@/lib/prisma";

export type SupplierFormState = { error: string | null };

/**
 * Suppliers are simple contact cards used when ordering raw materials.
 */
export async function createSupplier(
  _prev: SupplierFormState,
  formData: FormData,
): Promise<SupplierFormState> {
  const ctx = await requireCatalogMutationPermission(formData, "suppliers.manage");
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));

  const name = String(formData.get("name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const phone = phoneRaw.length > 0 ? phoneRaw : null;
  const emailRaw = String(formData.get("email") ?? "").trim().toLowerCase();
  const email = emailRaw.length > 0 ? emailRaw : null;
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = notesRaw.length > 0 ? notesRaw : null;

  if (name.length < 2 || name.length > 120) {
    return { error: t("suppliers.nameLength") };
  }
  if (email && !email.includes("@")) {
    return { error: t("suppliers.invalidEmail") };
  }

  await prisma.supplier.create({
    data: {
      businessId: ctx.businessId,
      name,
      phone,
      email,
      notes,
    },
  });

  revalidateAfterSupplierMasterChange(ctx.locale);
  return { error: null };
}

export type SaveSupplierState = {
  error: string | null;
  success?: boolean;
  completedAt?: number;
};

export async function saveSupplier(
  _prev: SaveSupplierState,
  formData: FormData,
): Promise<SaveSupplierState> {
  const ctx = await requireCatalogMutationPermission(formData, "suppliers.manage");
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const t = await getServerActionTranslator(normalizeServerActionLocale(ctx.locale));

  const supplierIdRaw = String(formData.get("supplierId") ?? "").trim();
  const supplierId = supplierIdRaw.length > 0 ? supplierIdRaw : null;
  const name = String(formData.get("name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const phone = phoneRaw.length > 0 ? phoneRaw : null;
  const emailRaw = String(formData.get("email") ?? "").trim().toLowerCase();
  const email = emailRaw.length > 0 ? emailRaw : null;
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = notesRaw.length > 0 ? notesRaw : null;

  if (name.length < 2 || name.length > 120) {
    return { error: t("suppliers.nameLength") };
  }
  if (email && !email.includes("@")) {
    return { error: t("suppliers.invalidEmail") };
  }

  if (supplierId) {
    const existing = await prisma.supplier.findFirst({
      where: { id: supplierId, businessId: ctx.businessId, archivedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return { error: t("suppliers.notFound") };
    }
    await prisma.supplier.update({
      where: { id: supplierId },
      data: { name, phone, email, notes },
    });
    revalidateAfterSupplierMasterChange(ctx.locale);
    return { error: null, success: true, completedAt: Date.now() };
  }

  await prisma.supplier.create({
    data: {
      businessId: ctx.businessId,
      name,
      phone,
      email,
      notes,
    },
  });

  revalidateAfterSupplierMasterChange(ctx.locale);
  return { error: null, success: true, completedAt: Date.now() };
}

export async function archiveSupplier(formData: FormData) {
  const ctx = await requireCatalogMutationPermission(formData, "suppliers.manage");
  if (!ctx.ok) {
    return;
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const linked = await prisma.rawMaterial.findFirst({
    where: { supplierId: id, businessId: ctx.businessId, archivedAt: null },
    select: { id: true },
  });
  if (linked) {
    return;
  }

  const row = await prisma.supplier.findFirst({
    where: { id, businessId: ctx.businessId, archivedAt: null },
    select: { id: true },
  });
  if (!row) {
    return;
  }

  await prisma.supplier.update({
    where: { id },
    data: { archivedAt: new Date() },
  });

  revalidateAfterSupplierMasterChange(ctx.locale);
}
