import { prisma } from "@/lib/prisma";
import { getConfiguredPlatformOperatorEmail } from "./platform-operator-email";

/**
 * Single source of truth for “may this user access `/dashboard/platform`?”
 *
 * **Both** must be true (AND):
 * 1. `User.isPlatformOwner === true` in the database (explicit product-operator flag).
 * 2. `normalized(user.email) === normalized(PLATFORM_OWNER_EMAIL)` (env pins which account that flag applies to).
 *
 * Why not email alone? Any tenant whose email was mistakenly copied into `.env` would gain SaaS access.
 * Why not `isPlatformOwner` alone? Seeded/demo data often set the boolean broadly; env email scopes it to one identity.
 *
 * Runtime path: `platform/layout.tsx` → `getCurrentUserId()` → `isPlatformOperator(userId)` → Prisma `User` row + env.
 * Sidebar / dashboard links use the same function so UI matches the server gate (hiding is UX only).
 *
 * The live operator console also requires a **password step-up** cookie (`hasValidPlatformStepUpCookie`); see `platform/layout.tsx`.
 */
export async function isPlatformOperator(userId: string): Promise<boolean> {
  const configuredEmail = getConfiguredPlatformOperatorEmail();
  if (!configuredEmail) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, archivedAt: true, isPlatformOwner: true },
  });

  if (!user || user.archivedAt || !user.email) {
    return false;
  }

  const normEmail = user.email.trim().toLowerCase();
  if (normEmail !== configuredEmail) {
    return false;
  }

  if (!user.isPlatformOwner) {
    return false;
  }

  return true;
}
