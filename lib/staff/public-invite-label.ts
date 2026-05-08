import { randomBytes } from "node:crypto";
import type { MembershipRole } from "@prisma/client";
import { membershipRoleLoginSlug } from "./membership-role-login-slug";
import type { Prisma } from "@prisma/client";

type Db = Pick<Prisma.TransactionClient, "staffInvite">;

/**
 * Human-readable **temporary** invite handle for owners (e.g. invite-cashier-a1b2c3).
 * Must never be confused with the employee's final `.cafeflow.local` login.
 */
export async function createUniquePublicInviteLabel(
  db: Db,
  role: MembershipRole,
): Promise<string> {
  const base = membershipRoleLoginSlug(role);
  for (let i = 0; i < 24; i++) {
    const suffix = randomBytes(3).toString("hex");
    const label = `invite-${base}-${suffix}`;
    const clash = await db.staffInvite.findUnique({
      where: { publicInviteLabel: label },
      select: { id: true },
    });
    if (!clash) {
      return label;
    }
  }
  throw new Error("Failed to generate a unique temporary invite identifier.");
}
