import { formatDateLine, formatFullDateTime, formatTimeLine } from "@/lib/format/arabic-datetime";

type TableDateTimeCellProps = {
  /** Event timestamp from database shown in local runtime timezone. */
  at: Date | null | undefined;
  /** Fallback text when timestamp is missing. */
  emptyLabel?: string;
};

/**
 * Date-time table cell:
 * - right aligned with tabular numerals for readability
 * - single line on larger screens
 * - split date/time lines on small screens to avoid horizontal overflow
 */
export function TableDateTimeCell({ at, emptyLabel = "—" }: TableDateTimeCellProps) {
  if (!at) {
    return (
      <span className="block text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
        {emptyLabel}
      </span>
    );
  }

  return (
    <div className="text-right text-xs tabular-nums">
      <span className="hidden whitespace-nowrap sm:inline">{formatFullDateTime(at)}</span>
      <span className="flex flex-col items-end gap-0.5 sm:hidden">
        <span>{formatDateLine(at)}</span>
        <span>{formatTimeLine(at)}</span>
      </span>
    </div>
  );
}
