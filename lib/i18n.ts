import { routing } from "@/i18n/routing";

export type AppLocale = (typeof routing.locales)[number];

/**
 * Returns text direction from locale.
 * This is used in layout setup so RTL/LTR behavior stays explicit.
 */
export function getDirection(locale: string): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

