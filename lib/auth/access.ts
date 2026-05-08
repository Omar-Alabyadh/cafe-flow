import { routing } from "@/i18n/routing";

/**
 * Returns locale from URL path when present, otherwise default locale.
 */
export function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];

  return routing.locales.includes(maybeLocale as "ar" | "en")
    ? maybeLocale
    : routing.defaultLocale;
}

/**
 * Simple route protection rule for this phase:
 * only dashboard area requires authentication.
 */
export function isProtectedRoute(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return false;
  }

  const first = segments[0];
  const hasLocalePrefix = routing.locales.includes(first as "ar" | "en");
  const normalizedPath = hasLocalePrefix ? `/${segments.slice(1).join("/")}` : pathname;

  return normalizedPath === "/dashboard" || normalizedPath.startsWith("/dashboard/");
}

