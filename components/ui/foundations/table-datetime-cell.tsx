import { formatDateInTimeZone, formatDateTimeInTimeZone, formatTimeInTimeZone } from "@/lib/time-zone/format";

type TableDateTimeCellProps = {
  /** Event timestamp from database shown in the caller's explicit time zone. */
  at: Date | string | number | null | undefined;
  /** IANA time zone. Operational screens should pass the resolved branch/business zone. */
  timeZone?: string;
  /** Active UI locale used for weekday/date ordering. */
  locale?: string;
  /** Fallback text when timestamp is missing. */
  emptyLabel?: string;
};

/**
 * Date-time table cell:
 * - right aligned with tabular numerals for readability
 * - single line on larger screens
 * - split date/time lines on small screens to avoid horizontal overflow
 */
export function TableDateTimeCell({ at, timeZone = "UTC", locale, emptyLabel = "\u2014" }: TableDateTimeCellProps) {
  if (!at) {
    return (
      <span className="block text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
        {emptyLabel}
      </span>
    );
  }

  return (
    <div className="text-right text-xs tabular-nums">
      <span className="hidden whitespace-nowrap sm:inline">
        {formatDateTimeInTimeZone(at, { timeZone, locale, includeWeekday: true })}
      </span>
      <span className="flex flex-col items-end gap-0.5 sm:hidden">
        <span>{formatDateInTimeZone(at, { timeZone, locale, includeWeekday: true })}</span>
        <span>{formatTimeInTimeZone(at, { timeZone, locale })}</span>
      </span>
    </div>
  );
}
