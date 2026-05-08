import type { PermissionTemplateKey } from "@/lib/authorization/permissions";
import { BUSINESS_STAFF_ROLE_LABELS_AR, isBusinessStaffAssignableRole } from "@/lib/authorization/permissions";
import { MembershipRole, PermissionScope, StaffInviteStatus } from "@prisma/client";

export function scopeLabelAr(scope: PermissionScope): string {
  switch (scope) {
    case PermissionScope.ALL_BRANCHES:
      return "All branches";
    case PermissionScope.BRANCH_ONLY:
      return "This branch only";
    case PermissionScope.OWN_ONLY:
      return "My resources only";
    case PermissionScope.NONE:
      return "No scope";
    default:
      return String(scope);
  }
}

export function staffRoleTitleAr(role: MembershipRole): string {
  if (isBusinessStaffAssignableRole(role)) {
    return BUSINESS_STAFF_ROLE_LABELS_AR[role];
  }
  if (role === MembershipRole.OWNER) return "Owner";
  if (role === MembershipRole.SUPER_ADMIN) return "System Admin";
  return String(role);
}

/**
 * Compact role presentation for tables (members + invites): emoji hint + role category line.
 * Keeps committee demos readable without changing RBAC enums.
 */
export function getStaffRolePresentation(role: MembershipRole): { emoji: string; hintAr: string } {
  switch (role) {
    case MembershipRole.CASHIER:
      return { emoji: "🟢", hintAr: "Point of Sale" };
    case MembershipRole.MANAGER:
      return { emoji: "🟠", hintAr: "Operations" };
    case MembershipRole.OWNER:
      return { emoji: "🔴", hintAr: "Full control" };
    case MembershipRole.SUPER_ADMIN:
      return { emoji: "🔴", hintAr: "Platform" };
    case MembershipRole.ACCOUNTANT:
      return { emoji: "🟣", hintAr: "Financial permissions" };
    case MembershipRole.BARISTA:
      return { emoji: "☕", hintAr: "Order preparation" };
    case MembershipRole.WAITER:
      return { emoji: "🍽️", hintAr: "Order tracking" };
    case MembershipRole.KITCHEN_STAFF:
      return { emoji: "🍳", hintAr: "Kitchen operations" };
    case MembershipRole.INVENTORY_MANAGER:
      return { emoji: "📦", hintAr: "Inventory management" };
    case MembershipRole.PURCHASING_MANAGER:
      return { emoji: "🛒", hintAr: "Suppliers, invoices, and purchasing approvals" };
    case MembershipRole.JUICE_STAFF:
      return { emoji: "🧃", hintAr: "Juice and natural drinks preparation" };
    default:
      return { emoji: "⚪", hintAr: String(role) };
  }
}

/** Invite row status → chip label + tone for styling (real enum + pending expiry flag). */
export function getInviteStatusPresentation(inv: {
  status: StaffInviteStatus;
  isExpired: boolean;
}): { emoji: string; labelAr: string; tone: "pending" | "success" | "danger" | "muted" } {
  switch (inv.status) {
    case StaffInviteStatus.PENDING:
      return inv.isExpired
        ? { emoji: "⚫", labelAr: "Expired", tone: "muted" }
        : { emoji: "🟡", labelAr: "Pending", tone: "pending" };
    case StaffInviteStatus.ACCEPTED:
      return { emoji: "🟢", labelAr: "Accepted", tone: "success" };
    case StaffInviteStatus.CANCELLED:
      return { emoji: "🔴", labelAr: "Cancelled", tone: "danger" };
    case StaffInviteStatus.EXPIRED:
      return { emoji: "⚫", labelAr: "Expired", tone: "muted" };
    default:
      return { emoji: "⚪", labelAr: String(inv.status), tone: "muted" };
  }
}

/** Visible membership rows are active (archived rows are not loaded on this page). */
export function getMemberRowStatusPresentation(): { emoji: string; labelAr: string; tone: "success" } {
  return { emoji: "🟢", labelAr: "Active", tone: "success" };
}

/** Template picker: icon + stronger active styling helpers (logic unchanged in form). */
export const PERMISSION_TEMPLATE_UI: Record<
  PermissionTemplateKey,
  { icon: string; activeBgClass: string; activeBorderClass: string }
> = {
  DEFAULT: {
    icon: "⚪",
    activeBgClass: "bg-zinc-200/90 dark:bg-zinc-700/80",
    activeBorderClass: "border-zinc-900 dark:border-zinc-100",
  },
  POS_ONLY: {
    icon: "🔵",
    activeBgClass: "bg-sky-100 dark:bg-sky-950/50",
    activeBorderClass: "border-sky-700 dark:border-sky-400",
  },
  INVENTORY_ONLY: {
    icon: "🟣",
    activeBgClass: "bg-violet-100 dark:bg-violet-950/40",
    activeBorderClass: "border-violet-700 dark:border-violet-400",
  },
  READ_ONLY: {
    icon: "🟢",
    activeBgClass: "bg-emerald-100 dark:bg-emerald-950/40",
    activeBorderClass: "border-emerald-700 dark:border-emerald-400",
  },
  CUSTOM: {
    icon: "⚫",
    activeBgClass: "bg-zinc-300/80 dark:bg-zinc-600/50",
    activeBorderClass: "border-zinc-900 dark:border-zinc-100",
  },
};

/**
 * Heuristic UX tier for server error strings — message text stays authoritative; only presentation changes.
 */
export function classifyStaffFormMessage(
  message: string,
): "blocking" | "warning" | "info" {
  const m = message.trim();
  if (/pending|same email|invite pending|twice/i.test(m)) {
    return "warning";
  }
  if (/later|you can|note/i.test(m)) {
    return "info";
  }
  return "blocking";
}
