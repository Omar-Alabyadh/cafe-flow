"use client";

import { CatalogSideDrawer } from "@/components/ui/foundations/catalog-side-drawer";
import { MoneyValue } from "@/components/ui/foundations/money-value";
import { formatArabicLatnQuantity } from "@/lib/format/numbers";
import { formatDateInputValueInTimeZone, formatDateTimeInTimeZone } from "@/lib/time-zone/format";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ClipboardList,
  Eye,
  Filter,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { StockMovementType } from "@prisma/client";
import { StockMovementForm } from "./movement-form";
import { useTranslations } from "next-intl";

type MaterialOption = { id: string; label: string };

export type LedgerRow = {
  id: string;
  createdAtIso: string;
  materialName: string;
  materialCode: string;
  unitName: string;
  type: StockMovementType;
  quantityAbs: string;
  deltaSigned: string;
  balanceBefore: string;
  balanceAfter: string;
  unitCost: string | null;
  note: string | null;
  referenceLabel: string;
};

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function movementTypeLabel(type: StockMovementType): string {
  switch (type) {
    case StockMovementType.STOCK_IN:
      return "stockIn";
    case StockMovementType.CONSUMPTION:
      return "consumption";
    case StockMovementType.ADJUSTMENT_ADD:
    case StockMovementType.ADJUSTMENT_SUBTRACT:
      return "adjustment";
    case StockMovementType.OPENING_BALANCE:
      return "openingBalance";
    case StockMovementType.WASTE:
      return "waste";
    default:
      return type;
  }
}

function movementTypeBadgeClass(type: StockMovementType): string {
  if (type === StockMovementType.STOCK_IN || type === StockMovementType.OPENING_BALANCE) {
    return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200";
  }
  if (type === StockMovementType.CONSUMPTION || type === StockMovementType.WASTE) {
    return "bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-200";
  }
  return "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200";
}

function directionVisual(deltaSigned: number) {
  if (deltaSigned >= 0) {
    return {
      icon: <ArrowUpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />,
      className: "text-emerald-700 dark:text-emerald-300",
      sign: "+",
    };
  }
  return {
    icon: <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden />,
    className: "text-red-700 dark:text-red-300",
    sign: "-",
  };
}

function toNum(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function StockMovementsWorkspace({
  locale,
  materialOptions,
  rows,
  executorLabel,
  operationalTimeZone,
}: {
  locale: string;
  materialOptions: MaterialOption[];
  rows: LedgerRow[];
  executorLabel: string;
  operationalTimeZone: string;
}) {
  const t = useTranslations("dashboard.business.stockMovements.workspace");
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | StockMovementType>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [detailRowId, setDetailRowId] = useState<string | null>(null);

  const q = useDebouncedValue(search, 300).trim().toLowerCase();

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (typeFilter !== "all" && row.type !== typeFilter) return false;

      if (q) {
        const inMaterial = row.materialName.toLowerCase().includes(q);
        const inCode = row.materialCode.toLowerCase().includes(q);
        if (!inMaterial && !inCode) return false;
      }

      const d = formatDateInputValueInTimeZone(row.createdAtIso, operationalTimeZone);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });
  }, [rows, typeFilter, q, dateFrom, dateTo, operationalTimeZone]);

  const summary = useMemo(() => {
    const total = rows.length;
    const consumption = rows.filter((x) => x.type === StockMovementType.CONSUMPTION).length;
    const supplyOrAdjust = rows.filter(
      (x) =>
        x.type === StockMovementType.STOCK_IN ||
        x.type === StockMovementType.ADJUSTMENT_ADD ||
        x.type === StockMovementType.ADJUSTMENT_SUBTRACT ||
        x.type === StockMovementType.OPENING_BALANCE,
    ).length;
    return { total, consumption, supplyOrAdjust };
  }, [rows]);
  const visibleExecutor = executorLabel?.trim() || t("executorFallback");
  const detailRow = rows.find((x) => x.id === detailRowId) ?? null;
  // Detail modal mapping is a 1:1 projection from ledger row fields
  // so the auditor can validate every visible value against the table row.

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">{t("intro")}</div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("summary.total")}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{summary.total}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("summary.consumption")}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{summary.consumption}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("summary.supplyAdjust")}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{summary.supplyOrAdjust}</p>
        </div>
      </div>

      <div className="cf-surface rounded-xl p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold">{t("table.title")}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpenDrawer(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <ClipboardList className="h-4 w-4" aria-hidden />
            {t("addMovement")}
          </button>
        </div>

        <div className="mb-4 grid items-end gap-3 lg:grid-cols-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("filters.searchPlaceholder")}
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 ps-10 pe-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | StockMovementType)}
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 ps-10 pe-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="all">{t("filters.allTypes")}</option>
              <option value={StockMovementType.STOCK_IN}>{t("types.stockIn")}</option>
              <option value={StockMovementType.CONSUMPTION}>{t("types.consumption")}</option>
              <option value={StockMovementType.ADJUSTMENT_ADD}>{t("types.adjustmentAdd")}</option>
              <option value={StockMovementType.ADJUSTMENT_SUBTRACT}>{t("types.adjustmentSubtract")}</option>
              <option value={StockMovementType.OPENING_BALANCE}>{t("types.openingBalance")}</option>
              <option value={StockMovementType.WASTE}>{t("types.waste")}</option>
            </select>
          </div>
          <label className="space-y-1">
            <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">{t("filters.fromDate")}</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="space-y-1">
            <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">{t("filters.toDate")}</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-4 py-3 text-right font-semibold">{t("columns.dateTime")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("columns.material")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("columns.type")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("columns.delta")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("columns.unit")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("columns.before")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("columns.after")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("columns.reference")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("columns.executor")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr className="border-t border-zinc-200 dark:border-zinc-800">
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    {t("empty")}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const delta = toNum(row.deltaSigned);
                  const visual = directionVisual(delta);
                  return (
                    <tr key={row.id} className="border-t border-zinc-200 dark:border-zinc-800">
                      <td className="px-4 py-3">
                        <span className="block text-right text-xs tabular-nums">
                          {formatDateTimeInTimeZone(row.createdAtIso, {
                            timeZone: operationalTimeZone,
                            locale,
                            includeWeekday: true,
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{row.materialName}</div>
                        <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{row.materialCode}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${movementTypeBadgeClass(row.type)}`}>
                          {t(`types.${movementTypeLabel(row.type)}`)}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono tabular-nums ${visual.className}`}>
                        <span className="inline-flex items-center justify-end gap-1">
                          {visual.icon}
                          {visual.sign} {formatArabicLatnQuantity(Math.abs(delta))}
                        </span>
                      </td>
                      <td className="px-4 py-3">{row.unitName}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        {formatArabicLatnQuantity(toNum(row.balanceBefore))}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        {formatArabicLatnQuantity(toNum(row.balanceAfter))}
                      </td>
                      <td className="px-4 py-3 max-w-[280px]">
                        <div className="truncate" title={row.referenceLabel}>
                          {row.referenceLabel}
                        </div>
                        {row.unitCost ? (
                          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                            {t("unitCost")}: <MoneyValue amount={row.unitCost} size="sm" />
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{visibleExecutor}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setDetailRowId(row.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden />
                          {t("view")}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CatalogSideDrawer
        open={openDrawer}
        title={t("drawer.newTitle")}
        onRequestClose={() => setOpenDrawer(false)}
        footer={
          <button
            type="button"
            onClick={() => setOpenDrawer(false)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800/80"
          >
            {t("close")}
          </button>
        }
      >
        <StockMovementForm
          locale={locale}
          materials={materialOptions}
          embedTitle
          onSaveSuccess={() => {
            setOpenDrawer(false);
            router.refresh();
          }}
        />
      </CatalogSideDrawer>

      <CatalogSideDrawer
        open={Boolean(detailRow)}
        title={t("drawer.detailsTitle")}
        onRequestClose={() => setDetailRowId(null)}
        footer={
          <button
            type="button"
            onClick={() => setDetailRowId(null)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800/80"
          >
            {t("close")}
          </button>
        }
      >
        {detailRow ? (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-[120px,1fr] gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
              <span className="text-zinc-500">{t("detail.id")}</span>
              <span className="font-mono text-xs">{detailRow.id}</span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="text-zinc-500">{t("detail.material")}</span>
              <span>{detailRow.materialName} ({detailRow.materialCode})</span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="text-zinc-500">{t("detail.type")}</span>
              <span>{t(`types.${movementTypeLabel(detailRow.type)}`)}</span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="text-zinc-500">{t("detail.delta")}</span>
              <span className="tabular-nums">
                {toNum(detailRow.deltaSigned) >= 0 ? "+" : "-"} {formatArabicLatnQuantity(Math.abs(toNum(detailRow.deltaSigned)))} {detailRow.unitName}
              </span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="text-zinc-500">{t("detail.unit")}</span>
              <span>{detailRow.unitName}</span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="text-zinc-500">{t("detail.before")}</span>
              <span className="tabular-nums">{formatArabicLatnQuantity(toNum(detailRow.balanceBefore))}</span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="text-zinc-500">{t("detail.after")}</span>
              <span className="tabular-nums">{formatArabicLatnQuantity(toNum(detailRow.balanceAfter))}</span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="text-zinc-500">{t("detail.reference")}</span>
              <span>{detailRow.referenceLabel}</span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="text-zinc-500">{t("detail.note")}</span>
              <span className="whitespace-pre-line">{detailRow.note?.trim() || "—"}</span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="text-zinc-500">{t("detail.createdAt")}</span>
              <span className="tabular-nums">
                {formatDateTimeInTimeZone(detailRow.createdAtIso, {
                  timeZone: operationalTimeZone,
                  locale,
                  includeWeekday: true,
                })}
              </span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="text-zinc-500">{t("detail.executor")}</span>
              <span>{visibleExecutor}</span>
            </div>
          </div>
        ) : null}
      </CatalogSideDrawer>
    </div>
  );
}
