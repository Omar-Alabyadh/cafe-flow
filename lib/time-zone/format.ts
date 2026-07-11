import { FALLBACK_TIME_ZONE } from "@/lib/time-zone/effective-time-zone";
import { validateTimeZone } from "@/lib/time-zone/validation";

type DateTimeValue = Date | string | number;
type UiLocale = "ar" | "en";

type FormatBaseOptions = {
  locale?: string;
  timeZone: string;
};

type DateFormatOptions = FormatBaseOptions & {
  includeWeekday?: boolean;
};

function normalizeLocale(locale?: string): UiLocale {
  return locale?.toLowerCase().startsWith("en") ? "en" : "ar";
}

function toDate(value: DateTimeValue): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function safeTimeZone(timeZone: string): string {
  const result = validateTimeZone(timeZone);
  return result.ok ? result.value : FALLBACK_TIME_ZONE;
}

function formatParts(value: DateTimeValue, options: FormatBaseOptions): Intl.DateTimeFormatPart[] | null {
  const date = toDate(value);
  if (!date) return null;

  return new Intl.DateTimeFormat("en-US", {
    timeZone: safeTimeZone(options.timeZone),
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
}

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((item) => item.type === type)?.value ?? "";
}

function weekday(value: DateTimeValue, options: FormatBaseOptions): string {
  const date = toDate(value);
  if (!date) return "";

  return new Intl.DateTimeFormat(normalizeLocale(options.locale) === "en" ? "en-US" : "ar-EG", {
    timeZone: safeTimeZone(options.timeZone),
    numberingSystem: "latn",
    weekday: "long",
  }).format(date);
}

export function formatDateInTimeZone(value: DateTimeValue, options: DateFormatOptions): string {
  const parts = formatParts(value, options);
  if (!parts) return "";

  const locale = normalizeLocale(options.locale);
  const date =
    locale === "en"
      ? `${part(parts, "month")}/${part(parts, "day")}/${part(parts, "year")}`
      : `${part(parts, "day")}/${part(parts, "month")}/${part(parts, "year")}`;

  return options.includeWeekday ? `${weekday(value, options)}, ${date}` : date;
}

export function formatTimeInTimeZone(value: DateTimeValue, options: FormatBaseOptions): string {
  const parts = formatParts(value, options);
  if (!parts) return "";

  const hour24 = Number(part(parts, "hour"));
  const minute = part(parts, "minute").padStart(2, "0");
  const isPm = hour24 >= 12;
  const hour12 = String(hour24 % 12 || 12).padStart(2, "0");
  return `${hour12}:${minute} ${isPm ? "PM" : "AM"}`;
}

export function formatDateTimeInTimeZone(value: DateTimeValue, options: DateFormatOptions): string {
  const date = formatDateInTimeZone(value, options);
  const time = formatTimeInTimeZone(value, options);
  if (!date || !time) return "";
  return `${date} - ${time}`;
}

export function formatDateInputValueInTimeZone(value: DateTimeValue, timeZone: string): string {
  const parts = formatParts(value, { timeZone });
  if (!parts) return "";
  return `${part(parts, "year")}-${part(parts, "month")}-${part(parts, "day")}`;
}
