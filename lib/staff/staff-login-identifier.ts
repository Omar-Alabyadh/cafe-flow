import type { PrismaClient } from "@prisma/client";
import { membershipRoleLoginSlug } from "./membership-role-login-slug";
import type { MembershipRole } from "@prisma/client";

/**
 * CafeFlow **system login identifier** (stored in `User.email` for credentials auth).
 *
 * - It is an internal username-shaped string, not necessarily a deliverable Internet mailbox.
 * - The `.cafeflow.local` suffix is a dev/demo namespace; production can migrate to a real domain later
 *   without changing the tenant isolation model (still one row per user, unique email key).
 * - Pattern: `fname.lname.roleSlug@businessSlug.cafeflow.local` with numeric suffix on collision (.2, .3, …).
 */
export function normalizeLoginNameSegment(raw: string): string {
  let s = raw.trim().toLowerCase();
  s = s.replace(/\s+/g, ".");
  s = s.replace(/[^a-z0-9.]+/g, "");
  s = s.replace(/\.+/g, ".").replace(/^\.+|\.+$/g, "");
  return s;
}

export function businessSlugFromCode(code: string): string {
  const s = normalizeLoginNameSegment(code.replace(/_/g, "-"));
  return s.length > 0 ? s : "business";
}

type Db = Pick<PrismaClient, "user">;

/**
 * Allocates a unique `User.email` using English name segments (required for safe local-part).
 * Collisions append `.2`, `.3`, … before `@` (never throws on busy tenants except safety cap).
 */
export async function allocateStaffSystemLoginEmail(
  db: Db,
  params: {
    firstNameEn: string;
    lastNameEn: string;
    role: MembershipRole;
    businessCode: string;
  },
): Promise<string> {
  const fn = normalizeLoginNameSegment(params.firstNameEn) || "user";
  const ln = normalizeLoginNameSegment(params.lastNameEn) || "user";
  const roleSlug = membershipRoleLoginSlug(params.role);
  const bizSlug = businessSlugFromCode(params.businessCode);
  const host = `${bizSlug}.cafeflow.local`;

  for (let attempt = 0; attempt < 60; attempt++) {
    const mid = attempt === 0 ? `${fn}.${ln}.${roleSlug}` : `${fn}.${ln}.${roleSlug}.${attempt + 1}`;
    const email = `${mid}@${host}`;
    const taken = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (!taken) {
      return email;
    }
  }

  throw new Error("Failed to generate a unique login name after several attempts.");
}
