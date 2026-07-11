import assert from "node:assert/strict";
import test from "node:test";
import { MembershipRole } from "@prisma/client";
import { getRoleBasePermissions } from "@/lib/authorization/access";
import { validateStaffRolePermissionSafety } from "@/lib/staff/staff-role-permission-safety";

const reconciliation = "financial.legacy.reconcile" as const;

test("owner and accountant receive legacy reconciliation by default", () => {
  assert.equal(getRoleBasePermissions(MembershipRole.OWNER).has(reconciliation), true);
  assert.equal(getRoleBasePermissions(MembershipRole.ACCOUNTANT).has(reconciliation), true);
});

test("manager and cashier do not receive legacy reconciliation by default", () => {
  assert.equal(getRoleBasePermissions(MembershipRole.MANAGER).has(reconciliation), false);
  assert.equal(getRoleBasePermissions(MembershipRole.CASHIER).has(reconciliation), false);
});

test("forged reconciliation grants are rejected for operational roles", () => {
  for (const role of [
    MembershipRole.MANAGER,
    MembershipRole.CASHIER,
    MembershipRole.BARISTA,
    MembershipRole.WAITER,
    MembershipRole.KITCHEN_STAFF,
    MembershipRole.JUICE_STAFF,
    MembershipRole.INVENTORY_MANAGER,
    MembershipRole.PURCHASING_MANAGER,
  ]) {
    assert.deepEqual(validateStaffRolePermissionSafety(role, [reconciliation], []), { violated: [reconciliation] });
  }
});
