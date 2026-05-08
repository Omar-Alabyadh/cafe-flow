import { routing } from "@/i18n/routing";

export const LOCALE_PREFERENCE_COOKIE = "cafeflow_locale";

export function normalizeLocale(raw: string | null | undefined): "ar" | "en" | null {
  if (!raw) return null;
  const locale = raw.trim().toLowerCase();
  if (locale === "ar" || locale.startsWith("ar-")) return "ar";
  if (locale === "en" || locale.startsWith("en-")) return "en";
  return null;
}

export function isSupportedLocale(locale: string): locale is "ar" | "en" {
  return routing.locales.includes(locale as "ar" | "en");
}
