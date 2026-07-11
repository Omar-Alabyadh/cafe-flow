import { FALLBACK_TIME_ZONE } from "@/lib/time-zone/effective-time-zone";
import { validateTimeZone } from "@/lib/time-zone/validation";

function numberPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  return Number(parts.find((part) => part.type === type)?.value);
}

function safeTimeZone(timeZone: string): string {
  const result = validateTimeZone(timeZone);
  return result.ok ? result.value : FALLBACK_TIME_ZONE;
}

function offsetMsAt(utcDate: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: safeTimeZone(timeZone),
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(utcDate);

  const representedAsUtc = Date.UTC(
    numberPart(parts, "year"),
    numberPart(parts, "month") - 1,
    numberPart(parts, "day"),
    numberPart(parts, "hour"),
    numberPart(parts, "minute"),
    numberPart(parts, "second"),
  );

  return representedAsUtc - utcDate.getTime();
}

function localWallTimeToUtc({
  year,
  month,
  day,
  hour,
  minute,
  second,
  millisecond,
  timeZone,
}: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  timeZone: string;
}): Date {
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
  const firstGuess = new Date(wallAsUtc - offsetMsAt(new Date(wallAsUtc), timeZone));
  return new Date(wallAsUtc - offsetMsAt(firstGuess, timeZone));
}

function addLocalDays(year: number, month: number, day: number, days: number) {
  const result = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0, 0));
  return {
    year: result.getUTCFullYear(),
    month: result.getUTCMonth() + 1,
    day: result.getUTCDate(),
  };
}

function parseCanonicalCalendarDate(date: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;

  const reconstructed = new Date(Date.UTC(year, month - 1, day));
  if (
    reconstructed.getUTCFullYear() !== year ||
    reconstructed.getUTCMonth() + 1 !== month ||
    reconstructed.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

export function getUtcRangeForLocalDate({
  date,
  timeZone,
}: {
  date: string;
  timeZone: string;
}): { startUtc: Date; nextDayStartUtc: Date } | null {
  const parsed = parseCanonicalCalendarDate(date);
  if (!parsed) return null;

  const { year, month, day } = parsed;
  const next = addLocalDays(year, month, day, 1);
  return {
    startUtc: localWallTimeToUtc({ year, month, day, hour: 0, minute: 0, second: 0, millisecond: 0, timeZone }),
    nextDayStartUtc: localWallTimeToUtc({
      year: next.year,
      month: next.month,
      day: next.day,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
      timeZone,
    }),
  };
}
