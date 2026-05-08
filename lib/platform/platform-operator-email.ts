/**
 * `PLATFORM_OWNER_EMAIL` configuration for the SaaS operator account.
 *
 * Fail closed: missing or malformed env means **no** platform UI — never guess or fall back to
 * `isPlatformOwner` alone, or a tenant could be elevated by mis-seeding the boolean without env alignment.
 *
 * Sidebar hiding is not security (URLs can be typed). The real enforcement is `isPlatformOperator()` in
 * `require-platform-operator.ts`, used by `platform/layout.tsx` before any child runs.
 */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Returns the normalized operator email from env, or null if unset/invalid.
 * Invalid config must deny everyone (fail closed) so we never accidentally expose cross-tenant data.
 */
export function getConfiguredPlatformOperatorEmail(): string | null {
  const raw = process.env.PLATFORM_OWNER_EMAIL?.trim().toLowerCase() ?? "";
  if (!raw || !looksLikeEmail(raw)) {
    return null;
  }
  return raw;
}
