import { MembershipRole } from "@prisma/client";

/**
 * Short ASCII slug embedded in the **system login identifier** (local-part segment).
 * This is not the Prisma enum string; it matches the product naming spec for `.cafeflow.local` addresses.
 */
export function membershipRoleLoginSlug(role: MembershipRole): string {
  switch (role) {
    case MembershipRole.MANAGER:
      return "manager";
    case MembershipRole.ACCOUNTANT:
      return "accounting";
    case MembershipRole.CASHIER:
      return "cashier";
    case MembershipRole.BARISTA:
      return "barista";
    case MembershipRole.WAITER:
      return "waiter";
    case MembershipRole.KITCHEN_STAFF:
      return "kitchen";
    case MembershipRole.JUICE_STAFF:
      return "juice";
    case MembershipRole.INVENTORY_MANAGER:
      return "stock";
    case MembershipRole.PURCHASING_MANAGER:
      return "purchasing";
    default:
      return "staff";
  }
}
