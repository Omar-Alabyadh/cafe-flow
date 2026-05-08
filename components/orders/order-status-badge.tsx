"use client";

import type { OrderStatus } from "@prisma/client";
import { useTranslations } from "next-intl";

const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";

/**
 * Visual + textual status for committee-friendly tables.
 * Empty draft is called out explicitly so it is not confused with an active sale.
 */
export function OrderStatusBadge({
  status,
  itemCount,
}: {
  status: OrderStatus;
  itemCount: number;
}) {
  const t = useTranslations("dashboard.business.orders.status");
  if (status === "DRAFT" && itemCount === 0) {
    return (
      <span className={`${base} bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100`}>
        {t("emptyDraft")}
      </span>
    );
  }

  switch (status) {
    case "DRAFT":
      return (
        <span className={`${base} bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100`}>{t("draft")}</span>
      );
    case "IN_PROGRESS":
      return (
        <span
          className={`${base} bg-sky-100 text-sky-900 dark:bg-sky-950/60 dark:text-sky-200`}
        >
          {t("inProgress")}
        </span>
      );
    case "COMPLETED":
      return (
        <span
          className={`${base} bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200`}
        >
          {t("completed")}
        </span>
      );
    case "CANCELED":
      return (
        <span className={`${base} bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200`}>
          {t("canceled")}
        </span>
      );
    default:
      return <span className={base}>{status}</span>;
  }
}
