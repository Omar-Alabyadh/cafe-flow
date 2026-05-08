import { Membership, MembershipRole, PermissionScope } from "@prisma/client";
import { PermissionKey, ROLE_PERMISSION_MATRIX, ROLE_SCOPE_DEFAULT, isPermissionKey } from "./permissions";
import { ROLE_ACCESS_DEFINITIONS } from "./role-access";

export type AuthorizationMember = Pick<
  Membership,
  "id" | "userId" | "businessId" | "branchId" | "role" | "scope" | "grantedPermissions" | "revokedPermissions"
>;

/**
 * Authentication answers "who is the user?".
 * Authorization answers "what can this user do?".
 * We must enforce authorization on the server because UI checks can be bypassed.
 */
export function getRoleBasePermissions(role: MembershipRole): Set<PermissionKey> {
  return new Set(ROLE_PERMISSION_MATRIX[role] ?? []);
}

export function getRoleDefaultScope(role: MembershipRole): PermissionScope {
  return ROLE_SCOPE_DEFAULT[role] ?? PermissionScope.NONE;
}

/**
 * Effective permissions use additive/subtractive overrides:
 * base role permissions + granted permissions - revoked permissions.
 * This is safer than replacing the whole role, because role intent stays intact.
 */
export function getEffectivePermissions(member: AuthorizationMember): Set<PermissionKey> {
  const effective = getRoleBasePermissions(member.role);

  for (const permission of member.grantedPermissions ?? []) {
    if (isPermissionKey(permission)) {
      effective.add(permission);
    }
  }

  for (const permission of member.revokedPermissions ?? []) {
    if (isPermissionKey(permission)) {
      effective.delete(permission);
    }
  }

  return effective;
}

export function hasPermission(member: AuthorizationMember, permission: PermissionKey): boolean {
  return getEffectivePermissions(member).has(permission);
}

export function hasAnyPermission(member: AuthorizationMember, permissions: PermissionKey[]): boolean {
  const effective = getEffectivePermissions(member);
  return permissions.some((permission) => effective.has(permission));
}

export function canAccessBranch(member: AuthorizationMember, branchId: string | null | undefined): boolean {
  const scope = String(member.scope ?? getRoleDefaultScope(member.role));
  if (scope === PermissionScope.ALL_BRANCHES) {
    return true;
  }
  if (scope === "MULTI_BRANCH") {
    return member.branchId === null || !branchId || member.branchId === branchId;
  }
  if (scope === PermissionScope.NONE) {
    return false;
  }
  if (!branchId) {
    return true;
  }
  if (scope === PermissionScope.BRANCH_ONLY) {
    return member.branchId === null || member.branchId === branchId;
  }
  return member.branchId === branchId;
}

export function canAccessOwnResource(member: AuthorizationMember, ownerId: string): boolean {
  const scope = String(member.scope ?? getRoleDefaultScope(member.role));
  if (scope === PermissionScope.ALL_BRANCHES || scope === PermissionScope.BRANCH_ONLY) {
    return true;
  }
  if (scope === "MULTI_BRANCH") {
    return true;
  }
  if (scope === PermissionScope.OWN_ONLY) {
    return member.userId === ownerId;
  }
  return false;
}

export function canUsePOS(member: AuthorizationMember): boolean {
  return hasPermission(member, "pos.access");
}

export function canManageInventory(member: AuthorizationMember): boolean {
  return hasAnyPermission(member, [
    "inventory.view",
    "inventory.adjust",
    "inventory.count",
    "inventory.waste.record",
    "inventory.purchase.manage",
  ]);
}

export function canViewReports(member: AuthorizationMember): boolean {
  return hasAnyPermission(member, ["reports.view_branch", "reports.view_all", "reports.financial.view"]);
}

export function canManageUsers(member: AuthorizationMember): boolean {
  return hasAnyPermission(member, ["users.view", "users.create", "users.update", "users.delete", "users.assign_roles"]);
}

/**
 * Staff directory page: viewing membership rows is separate from mutating roles (assign_roles).
 * 404 must never represent “no permission”; the route always exists and unauthorized users see UnauthorizedState.
 */
export function canViewStaffDirectory(member: AuthorizationMember): boolean {
  return hasPermission(member, "users.view");
}

/**
 * Closing an order from the orders dashboard runs recipe-based stock deduction.
 * Preparation-only roles may view orders but must not trigger this financial/inventory closure path.
 */
export function canFinalizeOrderWithStockDeduction(member: AuthorizationMember): boolean {
  if (!hasPermission(member, "orders.update_status")) return false;
  return hasPermission(member, "orders.create") || hasPermission(member, "pos.payment.capture");
}

export function canAccessRoute(member: AuthorizationMember, routePath: string): boolean {
  const rolePolicy = ROLE_ACCESS_DEFINITIONS[member.role];
  if (rolePolicy.ownerOnlyForbiddenAreas.some((prefix) => routePath.includes(prefix))) {
    return false;
  }
  if (routePath.includes("/dashboard/platform")) {
    return member.role === MembershipRole.SUPER_ADMIN;
  }
  if (routePath.endsWith("/dashboard") || routePath.includes("/dashboard?")) {
    return member.role === MembershipRole.OWNER || member.role === MembershipRole.MANAGER || member.role === MembershipRole.ACCOUNTANT;
  }
  if (routePath.includes("/dashboard/business/orders")) return hasPermission(member, "orders.view");
  if (routePath.includes("/dashboard/business/pos")) return canUsePOS(member);
  if (routePath.includes("/dashboard/business/reports")) return canViewReports(member);
  if (routePath.includes("/dashboard/business/staff")) return canViewStaffDirectory(member);
  if (routePath.includes("/dashboard/business/products")) return hasPermission(member, "products.view");
  if (routePath.includes("/dashboard/business/categories")) return hasPermission(member, "categories.view");
  if (routePath.includes("/dashboard/business/addons")) return hasPermission(member, "addons.view");
  if (routePath.includes("/dashboard/business/recipes")) return hasPermission(member, "recipes.view");
  if (routePath.includes("/dashboard/business/suppliers")) return hasPermission(member, "suppliers.view");
  if (routePath.includes("/dashboard/business/branches")) return hasPermission(member, "branches.view");
  if (routePath.includes("/dashboard/business/units")) return hasPermission(member, "units.view");
  if (routePath.includes("/dashboard/business/raw-materials")) return hasPermission(member, "raw_materials.view");
  if (routePath.includes("/dashboard/business/billing")) return hasPermission(member, "billing.manage");
  if (
    routePath.includes("/dashboard/business/inventory") ||
    routePath.includes("/dashboard/business/stock-movements") ||
    routePath.includes("/dashboard/business/consumption")
  ) {
    return canManageInventory(member);
  }
  return true;
}
