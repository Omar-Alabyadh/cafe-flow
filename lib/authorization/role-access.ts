import { MembershipRole } from "@prisma/client";
import type { PermissionKey } from "./permissions";

export type SidebarItemKey =
  | "overview"
  | "business-home"
  | "platform-finance"
  | "platform-reports"
  | "pos"
  | "orders"
  | "products"
  | "categories"
  | "addons"
  | "recipes"
  | "inventory"
  | "stock-movements"
  | "consumption"
  | "staff"
  | "branches"
  | "suppliers"
  | "purchases"
  | "units"
  | "raw-materials"
  | "reports"
  | "billing"
  | "platform";

type RoleAccessDefinition = {
  defaultRoute: string;
  allowedSidebarItems: SidebarItemKey[];
  requiredPermissions: PermissionKey[];
  ownerOnlyForbiddenAreas: string[];
};

const STAFF_OWNER_ONLY_FORBIDDEN_AREAS = [
  "/dashboard/platform",
  "/dashboard/business/onboarding",
  "/dashboard/business/create-business",
  "/dashboard/business/billing",
];

export const ROLE_ACCESS_DEFINITIONS: Record<MembershipRole, RoleAccessDefinition> = {
  SUPER_ADMIN: {
    defaultRoute: "/dashboard/platform",
    allowedSidebarItems: ["overview", "platform", "platform-finance", "platform-reports"],
    requiredPermissions: [],
    ownerOnlyForbiddenAreas: [],
  },
  OWNER: {
    defaultRoute: "/dashboard",
    allowedSidebarItems: [
      "overview",
      "business-home",
      "pos",
      "orders",
      "products",
      "categories",
      "addons",
      "recipes",
      "inventory",
      "stock-movements",
      "consumption",
      "staff",
      "branches",
      "suppliers",
      "purchases",
      "units",
      "raw-materials",
      "reports",
      "billing",
    ],
    requiredPermissions: [],
    ownerOnlyForbiddenAreas: [],
  },
  /** Manager includes POS and orders by operations policy (aligned with `MANAGER_CORE`). */
  MANAGER: {
    defaultRoute: "/dashboard/business/orders",
    allowedSidebarItems: [
      "overview",
      "business-home",
      "pos",
      "orders",
      "products",
      "categories",
      "addons",
      "recipes",
      "inventory",
      "stock-movements",
      "consumption",
      "staff",
      "branches",
      "suppliers",
      "units",
      "raw-materials",
      "reports",
    ],
    requiredPermissions: [],
    ownerOnlyForbiddenAreas: STAFF_OWNER_ONLY_FORBIDDEN_AREAS,
  },
  ACCOUNTANT: {
    defaultRoute: "/dashboard/business/reports",
    allowedSidebarItems: ["reports"],
    requiredPermissions: ["reports.view_branch"],
    ownerOnlyForbiddenAreas: STAFF_OWNER_ONLY_FORBIDDEN_AREAS,
  },
  CASHIER: {
    defaultRoute: "/dashboard/business/pos",
    allowedSidebarItems: ["pos", "orders"],
    requiredPermissions: ["pos.access"],
    ownerOnlyForbiddenAreas: STAFF_OWNER_ONLY_FORBIDDEN_AREAS,
  },
  WAITER: {
    defaultRoute: "/dashboard/business/orders",
    allowedSidebarItems: ["orders"],
    requiredPermissions: ["orders.view"],
    ownerOnlyForbiddenAreas: STAFF_OWNER_ONLY_FORBIDDEN_AREAS,
  },
  BARISTA: {
    defaultRoute: "/dashboard/business/orders",
    allowedSidebarItems: ["orders"],
    requiredPermissions: ["orders.view"],
    ownerOnlyForbiddenAreas: STAFF_OWNER_ONLY_FORBIDDEN_AREAS,
  },
  JUICE_STAFF: {
    defaultRoute: "/dashboard/business/orders",
    allowedSidebarItems: ["orders"],
    requiredPermissions: ["orders.view"],
    ownerOnlyForbiddenAreas: STAFF_OWNER_ONLY_FORBIDDEN_AREAS,
  },
  KITCHEN_STAFF: {
    defaultRoute: "/dashboard/business/orders",
    allowedSidebarItems: ["orders"],
    requiredPermissions: ["orders.view"],
    ownerOnlyForbiddenAreas: STAFF_OWNER_ONLY_FORBIDDEN_AREAS,
  },
  INVENTORY_MANAGER: {
    defaultRoute: "/dashboard/business/inventory",
    allowedSidebarItems: ["inventory", "stock-movements", "raw-materials", "units", "suppliers"],
    requiredPermissions: ["inventory.view"],
    ownerOnlyForbiddenAreas: STAFF_OWNER_ONLY_FORBIDDEN_AREAS,
  },
  PURCHASING_MANAGER: {
    defaultRoute: "/dashboard/business/suppliers",
    allowedSidebarItems: ["suppliers", "purchases", "inventory", "raw-materials"],
    requiredPermissions: ["suppliers.view"],
    ownerOnlyForbiddenAreas: STAFF_OWNER_ONLY_FORBIDDEN_AREAS,
  },
};

export function getDefaultRouteByRole(role: MembershipRole): string {
  return ROLE_ACCESS_DEFINITIONS[role]?.defaultRoute ?? "/dashboard/business";
}
