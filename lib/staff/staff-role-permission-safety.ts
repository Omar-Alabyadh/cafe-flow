import { getRoleBasePermissions } from "@/lib/authorization/access";
import { ROLE_FORBIDDEN_PERMISSIONS, type PermissionKey } from "@/lib/authorization/permissions";
import { MembershipRole } from "@prisma/client";

/**
 * Ensures granted/revoked overrides never leave a staff role holding forbidden permissions.
 * Shared by staff membership saves and invite acceptance so rules cannot diverge.
 */
export function validateStaffRolePermissionSafety(
  role: MembershipRole,
  granted: PermissionKey[],
  revoked: PermissionKey[],
): { violated: PermissionKey[] } | null {
  const forbidden = new Set(ROLE_FORBIDDEN_PERMISSIONS[role] ?? []);
  if (forbidden.size === 0) return null;
  const effective = new Set(getRoleBasePermissions(role));
  for (const permission of granted) effective.add(permission);
  for (const permission of revoked) effective.delete(permission);
  const violated = [...effective].filter((permission) => forbidden.has(permission));
  if (violated.length === 0) return null;
  /** User-facing copy is resolved in server actions via `serverActions.*` keys (keeps this helper data-only). */
  return { violated };
}
