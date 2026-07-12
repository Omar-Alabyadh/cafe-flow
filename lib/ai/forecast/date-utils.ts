import type { DateOnly } from "./types";

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Validates an ISO calendar date without ever parsing in the local timezone. */
export function normalizeDateOnly(value: string): DateOnly {
  const match = DATE_ONLY.exec(value);
  if (!match) throw new Error(`Invalid date-only value: ${value}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day) {
    throw new Error(`Invalid calendar date: ${value}`);
  }
  return value;
}

function asUtcDate(value: DateOnly): Date {
  const normalized = normalizeDateOnly(value);
  const [year, month, day] = normalized.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toDateOnly(value: Date): DateOnly {
  return value.toISOString().slice(0, 10);
}

export function addDays(date: DateOnly, days: number): DateOnly {
  if (!Number.isInteger(days)) throw new Error("Day offset must be an integer.");
  const result = asUtcDate(date);
  result.setUTCDate(result.getUTCDate() + days);
  return toDateOnly(result);
}

export function daysBetween(start: DateOnly, end: DateOnly): number {
  return Math.round((asUtcDate(end).getTime() - asUtcDate(start).getTime()) / 86_400_000);
}

/** Monday is 1 and Sunday is 7, independent of the machine timezone. */
export function isoWeekday(date: DateOnly): number {
  const day = asUtcDate(date).getUTCDay();
  return day === 0 ? 7 : day;
}

export function isoWeekKey(date: DateOnly): string {
  const utc = asUtcDate(date);
  const weekday = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() - weekday + 1);
  return toDateOnly(utc);
}

export function enumerateDates(start: DateOnly, end: DateOnly): DateOnly[] {
  const length = daysBetween(start, end);
  if (length < 0) throw new Error("End date must not precede start date.");
  return Array.from({ length: length + 1 }, (_, index) => addDays(start, index));
}
