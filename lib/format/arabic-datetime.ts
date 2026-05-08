/**
 * Standardized date/time display for CafeFlow UI (Arabic language + Latin digits).
 *
 * Canonical format: Saturday, 12/05/2026 - 09:15 AM
 * - Weekday in Arabic with comma after it.
 * - Date as DD/MM/YYYY using Latin digits with zero-padding.
 * - 12-hour time with AM/PM markers and two-digit hour/minute.
 *
 * Prefer `formatFullDateTime` for standard text, and `TableDateTimeCell` for tables
 * (date/time split on narrow screens).
 */

/** Display locale: Arabic weekday names with Latin digits via manual date composition. */
const WEEKDAY_LOCALE = "ar-EG";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Arabic weekday name with enforced Latin numbering where applicable.
 */
function formatWeekdayLong(date: Date): string {
  return new Intl.DateTimeFormat(WEEKDAY_LOCALE, {
    weekday: "long",
    numberingSystem: "latn",
  }).format(date);
}

/**
 * Date-only segment: Saturday, 12/05/2026
 * Used in subscription rows (start/end) or first line of table cells on mobile.
 */
export function formatDateLine(date: Date): string {
  const weekday = formatWeekdayLong(date);
  const d = pad2(date.getDate());
  const m = pad2(date.getMonth() + 1);
  const y = date.getFullYear();
  return `${weekday}, ${d}/${m}/${y}`;
}

/**
 * Time-only segment: 09:15 AM (always two digits for hour and minute).
 */
export function formatTimeLine(date: Date): string {
  const h24 = date.getHours();
  const minutes = pad2(date.getMinutes());
  const isPm = h24 >= 12;
  const h12 = h24 % 12 || 12;
  const hour = pad2(h12);
  const suffix = isPm ? "PM" : "AM";
  return `${hour}:${minutes} ${suffix}`;
}

/**
 * Full one-line format used in product UI.
 */
export function formatFullDateTime(date: Date): string {
  return `${formatDateLine(date)} - ${formatTimeLine(date)}`;
}
