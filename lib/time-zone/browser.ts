import { normalizeOptionalTimeZone } from "@/lib/time-zone/validation";

export function detectBrowserTimeZone(): string | null {
  if (typeof Intl === "undefined") return null;
  return normalizeOptionalTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
}
