import { getCurrentUserId } from "@/lib/auth/session";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { hasAnyPermission, hasPermission } from "@/lib/authorization/access";
import type { PermissionKey } from "@/lib/authorization/permissions";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";

/**
 * Phase 5 catalog data is always scoped to the owner's single business.
 * This helper centralizes the same checks we use on branch/staff actions so
 * supervisors hear one consistent story: "only the business owner, only their business".
 */
export type CatalogOwnerContext =
  | { ok: true; userId: string; businessId: string; locale: string }
  | { ok: false; error: string };

const DEFAULT_CATALOG_PERMISSIONS: PermissionKey[] = [
  "products.view",
  "products.create",
  "products.update",
  "categories.view",
  "categories.manage",
  "addons.view",
  "addons.manage",
  "recipes.view",
  "inventory.view",
  "raw_materials.view",
  "units.view",
  "suppliers.view",
];

export async function requireOwnerBusinessForCatalog(
  formData: FormData,
  requiredPermissions: PermissionKey[] = DEFAULT_CATALOG_PERMISSIONS,
): Promise<CatalogOwnerContext> {
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);

  const userId = await getCurrentUserId();
  if (!userId) {
    return { ok: false, error: t("catalog.mustSignIn") };
  }

  let context;
  try {
    context = await getCurrentBusinessMemberContext(userId);
  } catch (error) {
    if (isBusinessContextSelectionError(error)) {
      return { ok: false, error: t("catalog.selectBusinessFirst") };
    }
    throw error;
  }
  if (requiredPermissions.length > 0 && !hasAnyPermission(context.member, requiredPermissions)) {
    return { ok: false, error: t("catalog.notAuthorizedCatalog") };
  }

  return { ok: true, userId, businessId: context.business.id, locale };
}

export async function requireCatalogMutationPermission(
  formData: FormData,
  requiredPermission: PermissionKey,
): Promise<CatalogOwnerContext> {
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);

  const userId = await getCurrentUserId();
  if (!userId) {
    return { ok: false, error: t("catalog.mustSignIn") };
  }

  let context;
  try {
    context = await getCurrentBusinessMemberContext(userId);
  } catch (error) {
    if (isBusinessContextSelectionError(error)) {
      return { ok: false, error: t("catalog.selectBusinessFirst") };
    }
    throw error;
  }

  if (!hasPermission(context.member, requiredPermission)) {
    return { ok: false, error: t("catalog.notAuthorizedCatalog") };
  }

  return { ok: true, userId, businessId: context.business.id, locale };
}
