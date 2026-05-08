import { revalidatePath } from "next/cache";

/**
 * Standard cache tag identifiers for tenant-scoped data.
 *
 * Why this exists (committee / defense note):
 * - Today CafeFlow relies on `revalidatePath` for Next.js RSC cache invalidation.
 * - If later we wrap Prisma reads in `unstable_cache({ tags })`, these names become the
 *   single vocabulary for `revalidateTag(...)` without renaming call sites again.
 */
export const TENANT_UI_CACHE_TAGS = {
  orders: "orders",
  inventory: "inventory",
  products: "products",
  recipes: "recipes",
  staff: "staff",
  suppliers: "suppliers",
  reports: "reports",
} as const;

/** Top-level dashboard home (`/dashboard`) — stat cards, recent orders, weekly chart. */
export function revalidateDashboardHome(locale: string) {
  revalidatePath(`/${locale}/dashboard`, "page");
}

/** Owner/staff business landing — operational KPIs and active orders snapshot. */
export function revalidateBusinessHub(locale: string) {
  revalidatePath(`/${locale}/dashboard/business`, "page");
}

/**
 * All analytics/report pages under `/dashboard/business/reports/*`.
 * Layout invalidation refreshes every nested report without listing each file.
 */
export function revalidateReportsSubtree(locale: string) {
  revalidatePath(`/${locale}/dashboard/business/reports`, "layout");
}

/** POS grid reads catalog + recipe-based availability; keep it in sync with stock/catalog writes. */
export function revalidatePosSurface(locale: string) {
  revalidatePath(`/${locale}/dashboard/business/pos`, "page");
}

export function revalidateInventoryPage(locale: string) {
  revalidatePath(`/${locale}/dashboard/business/inventory`, "page");
}

export function revalidateStockMovementsPage(locale: string) {
  revalidatePath(`/${locale}/dashboard/business/stock-movements`, "page");
}

export function revalidateConsumptionPage(locale: string) {
  revalidatePath(`/${locale}/dashboard/business/consumption`, "page");
}

export function revalidateRawMaterialsPage(locale: string) {
  revalidatePath(`/${locale}/dashboard/business/raw-materials`, "page");
}

export function revalidateProductsPage(locale: string) {
  revalidatePath(`/${locale}/dashboard/business/products`, "page");
}

export function revalidateRecipesSubtree(locale: string) {
  revalidatePath(`/${locale}/dashboard/business/recipes`, "layout");
}

export function revalidateSuppliersPage(locale: string) {
  revalidatePath(`/${locale}/dashboard/business/suppliers`, "page");
}

export function revalidateCategoriesPage(locale: string) {
  revalidatePath(`/${locale}/dashboard/business/categories`, "page");
}

export function revalidateAddonsPage(locale: string) {
  revalidatePath(`/${locale}/dashboard/business/addons`, "page");
}

export function revalidateBranchesPage(locale: string) {
  revalidatePath(`/${locale}/dashboard/business/branches`, "page");
}

export function revalidateUnitsPage(locale: string) {
  revalidatePath(`/${locale}/dashboard/business/units`, "page");
}

export function revalidateStaffManagementPages(locale: string) {
  revalidateDashboardHome(locale);
  revalidateBusinessHub(locale);
  revalidatePath(`/${locale}/dashboard/business/staff`, "page");
}

/**
 * Category/product label changes should refresh POS shelves and dashboard “products” KPI without a reload.
 */
export function revalidateAfterSharedCatalogUxChange(locale: string) {
  revalidatePosSurface(locale);
  revalidateDashboardHome(locale);
  revalidateReportsSubtree(locale);
}

export function revalidateOrdersIndex(locale: string) {
  revalidatePath(`/${locale}/dashboard/business/orders`, "page");
}

export function revalidateOrderDetail(locale: string, orderId: string) {
  revalidatePath(`/${locale}/dashboard/business/orders/${orderId}`, "page");
}

/**
 * Dashboard cards + business hub + reports often move together after commercial/stock events.
 * Call this after orders, revenue, inventory risk, or report inputs change.
 */
export function revalidateTenantAggregateSurfaces(locale: string) {
  revalidateDashboardHome(locale);
  revalidateBusinessHub(locale);
  revalidateReportsSubtree(locale);
}

/**
 * Any flow that changes `RawMaterialStock` or stock movements should refresh POS availability hints
 * and aggregate surfaces that surface low-stock / operational health.
 */
export function revalidateAfterStockImpact(locale: string) {
  revalidateInventoryPage(locale);
  revalidateStockMovementsPage(locale);
  revalidatePosSurface(locale);
  revalidateTenantAggregateSurfaces(locale);
}

/**
 * Raw material master data feeds inventory rows, recipe pickers, POS availability hints, and low-stock analytics.
 */
export function revalidateAfterRawMaterialMasterChange(locale: string) {
  revalidateRawMaterialsPage(locale);
  revalidateInventoryPage(locale);
  revalidateRecipesSubtree(locale);
  revalidatePosSurface(locale);
  revalidateTenantAggregateSurfaces(locale);
}

/**
 * Recipe BOM edits change whether POS can sell with stock rules and how reports interpret consumption.
 */
export function revalidateAfterRecipeStructureChange(locale: string) {
  revalidateRecipesSubtree(locale);
  revalidatePosSurface(locale);
  revalidateTenantAggregateSurfaces(locale);
}

export function revalidateAfterSupplierMasterChange(locale: string) {
  revalidateSuppliersPage(locale);
  revalidateRawMaterialsPage(locale);
  revalidateTenantAggregateSurfaces(locale);
}

/** Unit labels flow into raw material + inventory tables; keep those surfaces coherent. */
export function revalidateAfterUnitMasterChange(locale: string) {
  revalidateUnitsPage(locale);
  revalidateRawMaterialsPage(locale);
  revalidateInventoryPage(locale);
  revalidateBusinessHub(locale);
  revalidateDashboardHome(locale);
}
