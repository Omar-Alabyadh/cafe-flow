import {
  formatDateInTimeZone,
  formatDateTimeInTimeZone,
  formatTimeInTimeZone,
} from "@/lib/time-zone/format";

const LEGACY_FALLBACK_TIME_ZONE = "UTC";

export function formatDateLine(date: Date | string | number, timeZone = LEGACY_FALLBACK_TIME_ZONE, locale = "ar"): string {
  return formatDateInTimeZone(date, { timeZone, locale, includeWeekday: true });
}

export function formatTimeLine(date: Date | string | number, timeZone = LEGACY_FALLBACK_TIME_ZONE): string {
  return formatTimeInTimeZone(date, { timeZone });
}

export function formatFullDateTime(date: Date | string | number, timeZone = LEGACY_FALLBACK_TIME_ZONE, locale = "ar"): string {
  return formatDateTimeInTimeZone(date, { timeZone, locale, includeWeekday: true });
}
