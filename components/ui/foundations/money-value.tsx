"use client";

import { Coins } from "lucide-react";
import { useLocale } from "next-intl";
import type { ReactNode } from "react";
import { formatLibyanDinar, libyanDinarTextDir } from "@/lib/format/libyan-dinar";

type MoneyValueProps = {
  /** Must be JSON-serializable when this client component is rendered from a Server Component (use `toPlainMoneyAmount` for Prisma.Decimal). */
  amount: unknown;
  className?: string;
  iconClassName?: string;
  /** sm: tables / dense UI — md: default — lg: hero pricing */
  size?: "sm" | "md" | "lg";
};

const iconSizeClass: Record<NonNullable<MoneyValueProps["size"]>, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5 sm:h-6 sm:w-6",
};

/**
 * Renders a formatted Libyan Dinar amount with Lucide `Coins` next to the figure.
 * Symbol and `dir` follow the active next-intl locale (د.ل + RTL for Arabic, LYD + LTR for English).
 */
export function MoneyValue({
  amount,
  className = "",
  iconClassName = "",
  size = "md",
}: MoneyValueProps): ReactNode {
  const locale = useLocale();
  const dir = libyanDinarTextDir(locale);

  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 align-middle ${className}`.trim()}>
      <Coins
        className={`${iconSizeClass[size]} shrink-0 text-emerald-600 dark:text-emerald-400 ${iconClassName}`.trim()}
        aria-hidden
      />
      <span dir={dir} className="min-w-0 tabular-nums">
        {formatLibyanDinar(amount, locale)}
      </span>
    </span>
  );
}
