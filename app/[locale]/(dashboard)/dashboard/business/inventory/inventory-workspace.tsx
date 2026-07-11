"use client";

import { CatalogSideDrawer } from "@/components/ui/foundations/catalog-side-drawer";
import { TableDateTimeCell } from "@/components/ui/foundations/table-datetime-cell";
import { formatArabicLatnQuantity } from "@/lib/format/numbers";
import { AlertTriangle, Boxes, CircleAlert, Search, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import { adjustInventoryBalance, type InventoryAdjustmentState } from "./actions";

export type InventoryRow = {
  id: string;
  nameAr: string;
  code: string;
  unitName: string;
  currentBalance: string;
  minimumQuantity: number;
  stockUpdatedAt: string | null;
};

type InventoryStatus = "good" | "low" | "out";
const initialState: InventoryAdjustmentState = { error: null };

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function parseNum(value: string | number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Inventory status semantics:
 * - `good`: balance is above minimum threshold.
 * - `low`: balance is positive but at/below minimum.
 * - `out`: balance is zero or negative.
 */
function getStockStatus(currentBalance: number, minimumQuantity: number): InventoryStatus {
  if (currentBalance <= 0) return "out";
  if (currentBalance <= minimumQuantity) return "low";
  return "good";
}

function statusLabel(status: InventoryStatus, t: ReturnType<typeof useTranslations>): string {
  if (status === "good") return t("status.good");
  if (status === "low") return t("status.low");
  return t("status.out");
}

function statusBadgeClass(status: InventoryStatus): string {
  if (status === "good") {
    return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/45 dark:text-emerald-200";
  }
  if (status === "low") {
    return "bg-amber-100 text-amber-900 dark:bg-amber-950/45 dark:text-amber-200";
  }
  return "bg-red-100 text-red-900 dark:bg-red-950/45 dark:text-red-200";
}

function SummaryCard({ title, value, icon }: { title: string; value: number; icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
        <span className="text-zinc-500 dark:text-zinc-400" aria-hidden>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function InventoryAdjustmentForm({
  locale,
  selectedRow,
  onSuccess,
}: {
  locale: string;
  selectedRow: InventoryRow;
  onSuccess: () => void;
}) {
  const t = useTranslations("dashboard.business.inventory.workspace");
  const [state, formAction, pending] = useActionState(adjustInventoryBalance, initialState);
  const current = parseNum(selectedRow.currentBalance);
  const [newBalance, setNewBalance] = useState(current.toString());
  const [reason, setReason] = useState("manual_adjustment");
  const [note, setNote] = useState("");
  const diff = parseNum(newBalance) - current;

  useEffect(() => {
    if (!state.success || !state.completedAt) return;
    onSuccess();
  }, [state.success, state.completedAt, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="rawMaterialId" value={selectedRow.id} />

      <div className="rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
        <p className="font-semibold">{selectedRow.nameAr}</p>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          {t("adjustment.currentBalance")}: {formatArabicLatnQuantity(current)} {selectedRow.unitName}
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="inv-new-balance" className="text-sm font-medium">
          {t("adjustment.newBalance")}
        </label>
        <input
          id="inv-new-balance"
          name="newBalance"
          value={newBalance}
          onChange={(e) => setNewBalance(e.target.value)}
          inputMode="decimal"
          required
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm tabular-nums dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="rounded-md border border-zinc-200 px-3 py-2 text-xs tabular-nums text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
        {t("adjustment.delta")}: {formatArabicLatnQuantity(Math.abs(diff))} {selectedRow.unitName}{" "}
        <span className="text-zinc-500 dark:text-zinc-400">
          ({diff >= 0 ? t("adjustment.increase") : t("adjustment.decrease")})
        </span>
      </div>

      <div className="space-y-1">
        <label htmlFor="inv-reason" className="text-sm font-medium">
          {t("adjustment.reason")}
        </label>
        <select
          id="inv-reason"
          name="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="manual_adjustment">{t("adjustment.reasonOptions.manualAdjustment")}</option>
          <option value="counting_reconciliation">{t("adjustment.reasonOptions.countingReconciliation")}</option>
          <option value="damaged_or_waste">{t("adjustment.reasonOptions.damagedOrWaste")}</option>
          <option value="system_or_data_correction">{t("adjustment.reasonOptions.systemOrDataCorrection")}</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="inv-note" className="text-sm font-medium">
          {t("adjustment.note")}
        </label>
        <textarea
          id="inv-note"
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? t("adjustment.pending") : t("adjustment.submit")}
      </button>
    </form>
  );
}

export function InventoryWorkspace({
  locale,
  rows,
  operationalTimeZone,
}: {
  locale: string;
  rows: InventoryRow[];
  operationalTimeZone: string;
}) {
  const t = useTranslations("dashboard.business.inventory.workspace");
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InventoryStatus>("all");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const q = useDebouncedValue(search, 300);

  const normalizedRows = useMemo(() => {
    return rows.map((row) => {
      const current = parseNum(row.currentBalance);
      const status = getStockStatus(current, row.minimumQuantity);
      return { ...row, current, status };
    });
  }, [rows]);

  const summary = useMemo(() => {
    const outCount = normalizedRows.filter((x) => x.status === "out").length;
    const lowCount = normalizedRows.filter((x) => x.status === "low").length;
    return {
      total: normalizedRows.length,
      low: lowCount,
      out: outCount,
    };
  }, [normalizedRows]);

  const filteredRows = useMemo(() => {
    const text = q.trim().toLowerCase();
    return normalizedRows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (!text) return true;
      return row.nameAr.toLowerCase().includes(text) || row.code.toLowerCase().includes(text);
    });
  }, [normalizedRows, q, statusFilter]);

  const selectedRow = normalizedRows.find((x) => x.id === selectedRowId) ?? null;

  const handleAdjustmentSuccess = useCallback(() => {
    setSelectedRowId(null);
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-4">
      <p className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
        {t("intro")}
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard title={t("summary.total")} value={summary.total} icon={<Boxes className="h-4 w-4" />} />
        <SummaryCard title={t("summary.low")} value={summary.low} icon={<AlertTriangle className="h-4 w-4" />} />
        <SummaryCard title={t("summary.out")} value={summary.out} icon={<CircleAlert className="h-4 w-4" />} />
      </div>

      <div className="cf-surface rounded-xl p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search
              className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 ps-10 pe-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | InventoryStatus)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm sm:w-52 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="all">{t("filters.allStatuses")}</option>
            <option value="good">{t("status.good")}</option>
            <option value="low">{t("status.low")}</option>
            <option value="out">{t("status.out")}</option>
          </select>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
            {t("empty.noRows")}
          </p>
        ) : filteredRows.length === 0 ? (
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
            {t("empty.noResults")}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[940px] text-sm">
              <thead className="bg-muted text-foreground">
                <tr>
                  <th className="px-4 py-3 text-start font-semibold">{t("table.material")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("table.unit")}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t("table.currentBalance")}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t("table.minimumQuantity")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("table.status")}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t("table.lastUpdated")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-4 py-3">
                      <div className="font-medium">{row.nameAr}</div>
                      <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{row.code}</div>
                    </td>
                    <td className="px-4 py-3">{row.unitName}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatArabicLatnQuantity(row.current)} {row.unitName}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatArabicLatnQuantity(row.minimumQuantity)} {row.unitName}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(row.status)}`}>
                        {statusLabel(row.status, t)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <TableDateTimeCell at={row.stockUpdatedAt} timeZone={operationalTimeZone} locale={locale} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedRowId(row.id)}
                        className="inline-flex items-center gap-1 rounded-md border-2 border-zinc-300 bg-transparent px-2 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800/80"
                      >
                        <Wrench className="h-3.5 w-3.5" aria-hidden />
                        {t("table.adjust")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CatalogSideDrawer
        open={Boolean(selectedRow)}
        title={selectedRow ? t("drawer.titleWithName", { name: selectedRow.nameAr }) : t("drawer.title")}
        onRequestClose={() => setSelectedRowId(null)}
      >
        {selectedRow ? (
          <InventoryAdjustmentForm
            key={selectedRow.id}
            locale={locale}
            selectedRow={selectedRow}
            onSuccess={handleAdjustmentSuccess}
          />
        ) : null}
      </CatalogSideDrawer>
    </div>
  );
}
