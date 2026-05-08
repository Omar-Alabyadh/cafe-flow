import { createHash, randomBytes } from "node:crypto";

/**
 * Generates a high-entropy opaque token for the invite URL. Returned once to the owner UI only.
 */
export function generateStaffInviteRawToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Deterministic hash for persistence and lookup. We never store the raw token so DB backups
 * and logs cannot be turned into working invite links without brute force (infeasible at this length).
 */
export function hashStaffInviteToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}
