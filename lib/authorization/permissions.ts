import { MembershipRole, PermissionScope } from "@prisma/client";

export const PERMISSIONS = [
  "orders.view",
  "orders.create",
  "orders.update_status",
  "orders.cancel",
  "orders.refund",
  "pos.access",
  "pos.discount.apply",
  "pos.payment.capture",
  "pos.shift.open",
  "pos.shift.close",
  "products.view",
  "products.create",
  "products.update",
  "products.delete",
  "categories.view",
  "categories.manage",
  "addons.view",
  "addons.manage",
  "recipes.view",
  "recipes.create",
  "recipes.update",
  "recipes.delete",
  "inventory.view",
  "inventory.adjust",
  "inventory.count",
  "inventory.waste.record",
  "inventory.purchase.manage",
  "stock_movements.view",
  "raw_materials.view",
  "raw_materials.manage",
  "units.view",
  "units.manage",
  "suppliers.view",
  "suppliers.manage",
  "purchases.view",
  "reports.view_branch",
  "reports.view_all",
  "reports.financial.view",
  "reports.export",
  "financial.legacy.reconcile",
  "users.view",
  "users.create",
  "users.update",
  "users.delete",
  "users.assign_roles",
  "branches.view",
  "settings.branch.manage",
  "settings.business.manage",
  "billing.manage",
  "audit.view",
  "logs.view",
  "permissions.manage",
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number];
export type PermissionTemplateKey = "DEFAULT" | "POS_ONLY" | "INVENTORY_ONLY" | "READ_ONLY" | "CUSTOM";

export const PERMISSION_GROUPS: { key: string; labelAr: string; permissions: PermissionKey[] }[] = [
  { key: "orders", labelAr: "Orders", permissions: ["orders.view", "orders.create", "orders.update_status", "orders.cancel", "orders.refund"] },
  { key: "pos", labelAr: "Point of Sale", permissions: ["pos.access", "pos.discount.apply", "pos.payment.capture", "pos.shift.open", "pos.shift.close"] },
  { key: "products", labelAr: "Products", permissions: ["products.view", "products.create", "products.update", "products.delete"] },
  { key: "categories", labelAr: "Categories", permissions: ["categories.view", "categories.manage"] },
  { key: "addons", labelAr: "Add-ons", permissions: ["addons.view", "addons.manage"] },
  { key: "recipes", labelAr: "Recipes", permissions: ["recipes.view", "recipes.create", "recipes.update", "recipes.delete"] },
  {
    key: "inventory",
    labelAr: "Inventory",
    permissions: [
      "inventory.view",
      "inventory.adjust",
      "inventory.count",
      "inventory.waste.record",
      "inventory.purchase.manage",
      "stock_movements.view",
      "raw_materials.view",
      "raw_materials.manage",
      "units.view",
      "units.manage",
      "suppliers.view",
      "suppliers.manage",
      "purchases.view",
    ],
  },
  { key: "reports", labelAr: "Reports", permissions: ["reports.view_branch", "reports.view_all", "reports.financial.view", "reports.export", "financial.legacy.reconcile"] },
  { key: "users", labelAr: "Users", permissions: ["users.view", "users.create", "users.update", "users.delete", "users.assign_roles", "branches.view"] },
  { key: "settings", labelAr: "Settings and Billing", permissions: ["settings.branch.manage", "settings.business.manage", "billing.manage"] },
  { key: "system", labelAr: "System", permissions: ["audit.view", "logs.view", "permissions.manage"] },
];

const ALL = [...PERMISSIONS];
/**
 * Manager includes branch operations (POS + orders) by intentional policy.
 * Owner/platform areas (create business, billing, platform dashboard) remain blocked for staff.
 */
const MANAGER_CORE: PermissionKey[] = [
  "orders.view",
  "orders.create",
  "orders.update_status",
  "orders.cancel",
  "pos.access",
  "pos.discount.apply",
  "pos.payment.capture",
  "pos.shift.open",
  "pos.shift.close",
  "products.view",
  "products.create",
  "products.update",
  "categories.view",
  "categories.manage",
  "addons.view",
  "addons.manage",
  "recipes.view",
  "recipes.create",
  "recipes.update",
  "inventory.view",
  "inventory.adjust",
  "inventory.count",
  "inventory.waste.record",
  "inventory.purchase.manage",
  "stock_movements.view",
  "raw_materials.view",
  "raw_materials.manage",
  "units.view",
  "units.manage",
  "suppliers.view",
  "suppliers.manage",
  "purchases.view",
  "reports.view_branch",
  "reports.export",
  "users.view",
  "users.create",
  "users.update",
  "branches.view",
];

export const ROLE_PERMISSION_MATRIX: Record<MembershipRole, PermissionKey[]> = {
  SUPER_ADMIN: ALL,
  OWNER: ALL.filter((permission) => permission !== "permissions.manage"),
  MANAGER: MANAGER_CORE,
  ACCOUNTANT: ["reports.view_branch", "reports.financial.view", "reports.export", "financial.legacy.reconcile"],
  CASHIER: ["orders.view", "orders.create", "orders.update_status", "pos.access", "pos.payment.capture", "pos.shift.open", "pos.shift.close", "products.view", "categories.view", "addons.view"],
  BARISTA: ["orders.view", "orders.update_status"],
  WAITER: ["orders.view", "orders.create", "orders.update_status"],
  KITCHEN_STAFF: ["orders.view", "orders.update_status"],
  INVENTORY_MANAGER: [
    "inventory.view",
    "inventory.adjust",
    "inventory.count",
    "inventory.waste.record",
    "inventory.purchase.manage",
    "stock_movements.view",
    "raw_materials.view",
    "raw_materials.manage",
    "units.view",
    "units.manage",
    "suppliers.view",
    "suppliers.manage",
  ],
  PURCHASING_MANAGER: [
    "inventory.view",
    "inventory.purchase.manage",
    "stock_movements.view",
    "raw_materials.view",
    "raw_materials.manage",
    "suppliers.view",
    "suppliers.manage",
    "purchases.view",
  ],
  JUICE_STAFF: ["orders.view", "orders.update_status"],
};

export const ROLE_SCOPE_DEFAULT: Record<MembershipRole, PermissionScope> = {
  SUPER_ADMIN: PermissionScope.ALL_BRANCHES,
  OWNER: PermissionScope.ALL_BRANCHES,
  MANAGER: PermissionScope.BRANCH_ONLY,
  ACCOUNTANT: PermissionScope.ALL_BRANCHES,
  CASHIER: PermissionScope.BRANCH_ONLY,
  BARISTA: PermissionScope.BRANCH_ONLY,
  WAITER: PermissionScope.OWN_ONLY,
  KITCHEN_STAFF: PermissionScope.BRANCH_ONLY,
  INVENTORY_MANAGER: PermissionScope.BRANCH_ONLY,
  PURCHASING_MANAGER: PermissionScope.BRANCH_ONLY,
  JUICE_STAFF: PermissionScope.BRANCH_ONLY,
};

export const ROLE_HINTS_AR: Record<MembershipRole, string> = {
  SUPER_ADMIN: "Full system control",
  OWNER: "Full control",
  MANAGER: "Operations and management",
  ACCOUNTANT: "Financial permissions",
  CASHIER: "Point of sale",
  BARISTA: "Order preparation",
  WAITER: "Order tracking",
  KITCHEN_STAFF: "Kitchen operations",
  INVENTORY_MANAGER: "Inventory management",
  PURCHASING_MANAGER: "Purchasing manager",
  JUICE_STAFF: "Juice and natural drinks preparation",
};

/**
 * Roles the business owner (or authorized staff) may assign from the staff screen.
 * Platform identity (SUPER_ADMIN) and legal business ownership (OWNER) are out of scope here:
 * - SUPER_ADMIN is not a business staffing concept; it must never be granted via membership UI.
 * - OWNER is tied to Business.ownerId; we do not support co-owner via membership in V1.
 */
export type BusinessStaffAssignableRole = Exclude<MembershipRole, "SUPER_ADMIN" | "OWNER">;

export const BUSINESS_STAFF_ASSIGNABLE_ROLES: readonly BusinessStaffAssignableRole[] = [
  MembershipRole.MANAGER,
  MembershipRole.ACCOUNTANT,
  MembershipRole.CASHIER,
  MembershipRole.BARISTA,
  MembershipRole.WAITER,
  MembershipRole.KITCHEN_STAFF,
  MembershipRole.JUICE_STAFF,
  MembershipRole.INVENTORY_MANAGER,
  MembershipRole.PURCHASING_MANAGER,
];

export function isBusinessStaffAssignableRole(role: MembershipRole): role is BusinessStaffAssignableRole {
  return (BUSINESS_STAFF_ASSIGNABLE_ROLES as readonly MembershipRole[]).includes(role);
}

/** Arabic labels for roles that appear in the business staff assignment dropdown only. */
export const BUSINESS_STAFF_ROLE_LABELS_AR: Record<BusinessStaffAssignableRole, string> = {
  [MembershipRole.MANAGER]: "Manager",
  [MembershipRole.ACCOUNTANT]: "Accountant",
  [MembershipRole.CASHIER]: "Cashier",
  [MembershipRole.BARISTA]: "Barista",
  [MembershipRole.WAITER]: "Waiter",
  [MembershipRole.KITCHEN_STAFF]: "Kitchen staff",
  [MembershipRole.JUICE_STAFF]: "Juice staff",
  [MembershipRole.INVENTORY_MANAGER]: "Inventory manager",
  [MembershipRole.PURCHASING_MANAGER]: "Purchasing manager",
};

export const SENSITIVE_PERMISSION_WARNINGS: Partial<Record<PermissionKey, string>> = {
  "financial.legacy.reconcile": "Granting this permission allows reconciliation of legacy financial records.",
  "pos.payment.capture": "⚠️ Removing this permission prevents the user from completing payments.",
  "pos.access": "⚠️ Removing this permission prevents the user from accessing the POS screen.",
  "inventory.adjust": "⚠️ Removing this permission prevents the user from manually adjusting inventory balances.",
  "users.assign_roles": "⚠️ Granting this permission allows the user to manage roles and permissions of other members.",
  "billing.manage": "⚠️ Granting this permission allows access to billing and subscription management.",
};

export const PERMISSION_TEMPLATES: Record<Exclude<PermissionTemplateKey, "DEFAULT" | "CUSTOM">, PermissionKey[]> = {
  POS_ONLY: [
    "orders.view",
    "orders.create",
    "orders.update_status",
    "pos.access",
    "pos.payment.capture",
    "pos.shift.open",
    "pos.shift.close",
    "products.view",
  ],
  INVENTORY_ONLY: [
    "inventory.view",
    "inventory.adjust",
    "inventory.count",
    "inventory.waste.record",
    "inventory.purchase.manage",
    "recipes.view",
    "products.view",
  ],
  READ_ONLY: ["orders.view", "products.view", "recipes.view", "inventory.view", "reports.view_branch"],
};

export const ROLE_FORBIDDEN_PERMISSIONS: Partial<Record<MembershipRole, PermissionKey[]>> = {
  MANAGER: ["financial.legacy.reconcile"],
  CASHIER: [
    "financial.legacy.reconcile",
    "billing.manage",
    "settings.branch.manage",
    "settings.business.manage",
    "users.create",
    "users.update",
    "users.delete",
    "users.assign_roles",
    "permissions.manage",
    "logs.view",
    "audit.view",
  ],
  BARISTA: [
    "financial.legacy.reconcile",
    "billing.manage",
    "settings.branch.manage",
    "settings.business.manage",
    "users.view",
    "users.create",
    "users.update",
    "users.delete",
    "users.assign_roles",
    "permissions.manage",
    "logs.view",
    "audit.view",
  ],
  WAITER: [
    "financial.legacy.reconcile",
    "billing.manage",
    "settings.branch.manage",
    "settings.business.manage",
    "users.view",
    "users.create",
    "users.update",
    "users.delete",
    "users.assign_roles",
    "permissions.manage",
    "logs.view",
    "audit.view",
  ],
  KITCHEN_STAFF: [
    "financial.legacy.reconcile",
    "billing.manage",
    "settings.branch.manage",
    "settings.business.manage",
    "users.view",
    "users.create",
    "users.update",
    "users.delete",
    "users.assign_roles",
    "permissions.manage",
    "logs.view",
    "audit.view",
  ],
  JUICE_STAFF: [
    "financial.legacy.reconcile",
    "billing.manage",
    "settings.branch.manage",
    "settings.business.manage",
    "users.view",
    "users.create",
    "users.update",
    "users.delete",
    "users.assign_roles",
    "permissions.manage",
    "logs.view",
    "audit.view",
  ],
  PURCHASING_MANAGER: [
    "financial.legacy.reconcile",
    "billing.manage",
    "settings.branch.manage",
    "settings.business.manage",
    "users.view",
    "users.create",
    "users.update",
    "users.delete",
    "users.assign_roles",
    "permissions.manage",
    "logs.view",
    "audit.view",
  ],
  INVENTORY_MANAGER: ["financial.legacy.reconcile"],
};

export function isPermissionKey(value: string): value is PermissionKey {
  return (PERMISSIONS as readonly string[]).includes(value);
}

export function isPermissionTemplateKey(value: string): value is PermissionTemplateKey {
  return value === "DEFAULT" || value === "POS_ONLY" || value === "INVENTORY_ONLY" || value === "READ_ONLY" || value === "CUSTOM";
}
