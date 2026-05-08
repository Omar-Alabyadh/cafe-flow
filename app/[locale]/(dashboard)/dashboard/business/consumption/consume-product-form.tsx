"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { consumeProductByRecipe, type ConsumeProductFormState } from "./actions";

type RecipeMaterialPreview = {
  rawMaterialId: string;
  rawMaterialName: string;
  recipeQtyPerUnit: string;
  unit: string;
  currentBalance: string;
};

type ProductOption = {
  id: string;
  label: string;
  name: string;
  hasRecipe: boolean;
  items: RecipeMaterialPreview[];
};

const initialState: ConsumeProductFormState = { error: null, success: null, shortageItems: [] };

function formatDecimal(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return new Intl.NumberFormat("ar-LY", { maximumFractionDigits: 6 }).format(n);
}

export function ConsumeProductForm({
  locale,
  products,
}: {
  locale: string;
  products: ProductOption[];
}) {
  const t = useTranslations("dashboard.business.consumption.form");
  const [state, formAction, pending] = useActionState(consumeProductByRecipe, initialState);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantityText, setQuantityText] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const toastDismissRef = useRef<number | null>(null);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );
  const parsedQty = useMemo(() => {
    if (!/^\d+(\.\d{1,3})?$/.test(quantityText.trim())) return null;
    const n = Number(quantityText);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  }, [quantityText]);

  const previewRows = useMemo(() => {
    if (!selectedProduct || !parsedQty || !selectedProduct.hasRecipe) return [];
    return selectedProduct.items.map((item) => {
      const recipeQty = Number(item.recipeQtyPerUnit);
      const balance = Number(item.currentBalance);
      const total = recipeQty * parsedQty;
      const hasEnough = balance >= total;
      return { ...item, recipeQty, balance, total, hasEnough };
    });
  }, [selectedProduct, parsedQty]);

  const hasStockShortage = previewRows.some((r) => !r.hasEnough);
  const canExecute =
    Boolean(selectedProduct) &&
    selectedProduct?.hasRecipe === true &&
    parsedQty !== null &&
    !hasStockShortage &&
    !pending;

  /**
   * Defers toast updates to avoid setState-in-effect timing warnings.
   */
  useEffect(() => {
    if (!state.success && !state.error) return;

    const runId = window.setTimeout(() => {
      if (state.success) {
        setToast({ type: "success", text: t("toast.success") });
        if (toastDismissRef.current) window.clearTimeout(toastDismissRef.current);
        toastDismissRef.current = window.setTimeout(() => {
          setToast(null);
          toastDismissRef.current = null;
        }, 3200);
        return;
      }
      const message = state.error;
      if (message) {
        setToast({ type: "error", text: message });
        if (toastDismissRef.current) window.clearTimeout(toastDismissRef.current);
        toastDismissRef.current = window.setTimeout(() => {
          setToast(null);
          toastDismissRef.current = null;
        }, 4200);
      }
    }, 0);

    return () => {
      window.clearTimeout(runId);
      if (toastDismissRef.current) {
        window.clearTimeout(toastDismissRef.current);
        toastDismissRef.current = null;
      }
    };
  }, [state.error, state.success, t]);

  return (
    <div className="space-y-4">
      {toast ? (
        <p
          className={
            toast.type === "success"
              ? "rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
          }
        >
          {toast.text}
        </p>
      ) : null}

      <form
        action={formAction}
        className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="referenceMode" value="manual" />

        <h3 className="text-base font-semibold">{t("title")}</h3>
        <p className="text-xs text-zinc-500">
          {t("description")}
        </p>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="consumption-product">
            {t("fields.product")}
          </label>
          <select
            id="consumption-product"
            name="productId"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="">{t("fields.selectProduct")}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="consumption-qty">
            {t("fields.quantity")}
          </label>
          <input
            id="consumption-qty"
            name="quantity"
            value={quantityText}
            onChange={(e) => setQuantityText(e.target.value)}
            required
            inputMode="decimal"
            placeholder={t("fields.quantityPlaceholder")}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          {quantityText && parsedQty === null ? (
            <p className="text-xs text-red-600 dark:text-red-400">{t("errors.quantityFormat")}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="consumption-note">
            {t("fields.note")}
          </label>
          <textarea
            id="consumption-note"
            name="note"
            rows={2}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        {selectedProduct && !selectedProduct.hasRecipe ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {t("errors.recipeMissing")}
          </p>
        ) : null}

        {state.error ? (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            <p>{state.error}</p>
            {state.shortageItems.length > 0 ? (
              <ul className="mt-1 list-inside list-disc text-xs">
                {state.shortageItems.map((item) => (
                  <li key={item.materialName}>
                    {item.materialName}: {t("errors.shortageBy")} {formatDecimal(item.shortage)} {item.unit}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canExecute}
          className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? t("buttons.pending") : t("buttons.submit")}
        </button>
      </form>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-2 text-sm font-semibold">{t("preview.title")}</p>
        {!selectedProduct ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("preview.selectProduct")}</p>
        ) : !selectedProduct.hasRecipe ? (
          <p className="text-xs text-red-600 dark:text-red-400">{t("preview.recipeMissing")}</p>
        ) : parsedQty === null ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("preview.enterQuantity")}</p>
        ) : (
          <div className="space-y-2 text-xs">
            <p className="font-medium text-zinc-800 dark:text-zinc-200">
              {selectedProduct.name} × {formatDecimal(String(parsedQty))}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px] border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                    <th className="px-2 py-2 text-start font-medium">{t("preview.table.material")}</th>
                    <th className="px-2 py-2 text-start font-medium">{t("preview.table.recipePerUnit")}</th>
                    <th className="px-2 py-2 text-start font-medium">{t("preview.table.required")}</th>
                    <th className="px-2 py-2 text-start font-medium">{t("preview.table.available")}</th>
                    <th className="px-2 py-2 text-start font-medium">{t("preview.table.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row) => (
                    <tr
                      key={row.rawMaterialId}
                      className={
                        row.hasEnough
                          ? "border-b border-zinc-100 dark:border-zinc-800/70"
                          : "border-b border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/20"
                      }
                    >
                      <td className="px-2 py-2">{row.rawMaterialName}</td>
                      <td className="px-2 py-2">
                        {formatDecimal(String(row.recipeQty))} {row.unit}
                      </td>
                      <td className="px-2 py-2">
                        {formatDecimal(String(row.total))} {row.unit}
                      </td>
                      <td className="px-2 py-2">
                        {formatDecimal(String(row.balance))} {row.unit}
                      </td>
                      <td className="px-2 py-2">
                        {row.hasEnough ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            {t("preview.status.ok")}
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                            {t("preview.status.short")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hasStockShortage ? (
              <p className="rounded-md bg-red-50 px-2 py-1 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {t("preview.shortageHint")}
              </p>
            ) : null}
          </div>
        )}
      </div>

      {state.success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm dark:border-emerald-800 dark:bg-emerald-950/20">
          <p className="mb-2 font-semibold text-emerald-900 dark:text-emerald-200">{t("success.title")}</p>
          <ul className="space-y-1 text-emerald-900/90 dark:text-emerald-100/90">
            <li>{t("success.product")}: {state.success.productName}</li>
            <li>{t("success.quantity")}: {formatDecimal(state.success.quantity)}</li>
            <li>{t("success.movementsCount")}: {state.success.movementsCount}</li>
            <li>{t("success.executedAt")}: {new Date(state.success.executedAtIso).toLocaleString("ar-LY")}</li>
            <li>{t("success.executor")}: {state.success.executor}</li>
            <li>{t("success.reference")}: {state.success.reference}</li>
          </ul>
          <Link
            href={`/${locale}/dashboard/business/stock-movements`}
            className="mt-3 inline-flex rounded-md border border-emerald-700 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-400 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
          >
            {t("success.openStockMovements")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

