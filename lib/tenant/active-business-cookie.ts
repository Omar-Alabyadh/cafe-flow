import { cookies } from "next/headers";

export const ACTIVE_BUSINESS_COOKIE = "cafeflow_active_business_id";

/**
 * Stores the business context selected by the user.
 * This keeps multi-membership routing deterministic without leaking cross-tenant data:
 * every read path must still verify the user has membership in the selected business.
 */
export async function setActiveBusinessCookie(businessId: string) {
  const store = await cookies();
  store.set(ACTIVE_BUSINESS_COOKIE, businessId, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getActiveBusinessCookie(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(ACTIVE_BUSINESS_COOKIE)?.value?.trim() ?? "";
  return raw.length > 0 ? raw : null;
}

/**
 * Removes selected business context cookie.
 * Used when the stored business is stale (account switched, membership removed, or business archived).
 */
export async function clearActiveBusinessCookie() {
  const store = await cookies();
  store.delete(ACTIVE_BUSINESS_COOKIE);
}
