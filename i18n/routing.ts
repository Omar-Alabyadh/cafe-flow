import { defineRouting } from "next-intl/routing";

/**
 * Central place for supported locales.
 * Keeping this small and explicit makes locale behavior easy to explain.
 */
export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
});

