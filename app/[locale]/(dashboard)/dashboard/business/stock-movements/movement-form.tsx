"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { recordStockMovement, type StockMovementFormState } from "./actions";
import { StockMovementType } from "@prisma/client";
import { useTranslations } from "next-intl";

const initial: StockMovementFormState = { error: null };

type MatOption = { id: string; label: string };

const TYPE_LABELS: Record<StockMovementType, string> = {
  [StockMovementType.OPENING_BALANCE]: "openingBalance",
  [StockMovementType.STOCK_IN]: "stockIn",
  [StockMovementType.ADJUSTMENT_ADD]: "adjustmentAdd",
  [StockMovementType.ADJUSTMENT_SUBTRACT]: "adjustmentSubtract",
  [StockMovementType.WASTE]: "waste",
  [StockMovementType.CONSUMPTION]: "consumption",
};

const MANUAL_TYPES: StockMovementType[] = [
  StockMovementType.OPENING_BALANCE,
  StockMovementType.STOCK_IN,
  StockMovementType.ADJUSTMENT_ADD,
  StockMovementType.ADJUSTMENT_SUBTRACT,
  StockMovementType.WASTE,
];

const POSITIVE_TYPES: StockMovementType[] = [
  StockMovementType.OPENING_BALANCE,
  StockMovementType.STOCK_IN,
  StockMovementType.ADJUSTMENT_ADD,
];

export function StockMovementForm({
  locale,
  materials,
  onSaveSuccess,
  embedTitle = false,
}: {
  locale: string;
  materials: MatOption[];
  onSaveSuccess?: () => void;
  embedTitle?: boolean;
}) {
  const t = useTranslations("dashboard.business.stockMovements.form");
  const [state, formAction, pending] = useActionState(recordStockMovement, initial);
  const onSaveSuccessRef = useRef(onSaveSuccess);
  const [type, setType] = useState<StockMovementType>(StockMovementType.OPENING_BALANCE);
  const [quantityText, setQuantityText] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    onSaveSuccessRef.current = onSaveSuccess;
  }, [onSaveSuccess]);

  useEffect(() => {
    if (!state.success || !state.completedAt) return;
    if (!onSaveSuccessRef.current) return;
    const t = window.setTimeout(() => onSaveSuccessRef.current?.(), 0);
    return () => window.clearTimeout(t);
  }, [state.success, state.completedAt]);

  const quantityDirectionHint = POSITIVE_TYPES.includes(type) ? t("direction.increase") : t("direction.decrease");

  /**
   * Quantity normalization rule:
   * operator always enters a positive magnitude;
   * movement type determines add/subtract direction on the server side.
   */
  const sanitizePositiveDecimal = (raw: string): string => {
    const v = raw.replace(/[^\d.]/g, "");
    const dot = v.indexOf(".");
    if (dot === -1) return v;
    const intPart = v.slice(0, dot + 1);
    const fracPart = v.slice(dot + 1).replace(/\./g, "").slice(0, 4);
    return `${intPart}${fracPart}`;
  };

  const validatePositiveQuantity = (value: string): string | null => {
    if (!/^\d+(\.\d{1,4})?$/.test(value.trim())) {
      return t("quantityInvalidFormat");
    }
    if (Number(value) <= 0) {
      return t("quantityNonPositive");
    }
    return null;
  };

  return (
    <form
      action={formAction}
      className="max-w-md space-y-4"
      onSubmit={(e) => {
        const msg = validatePositiveQuantity(quantityText);
        setClientError(msg);
        if (msg) e.preventDefault();
      }}
    >
      <input type="hidden" name="locale" value={locale} />
      {embedTitle ? null : <h3 className="text-base font-semibold">{t("title")}</h3>}
      <p className="text-xs text-zinc-500">
        {t("description")}
      </p>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="sm-mat">
          {t("material")}
        </label>
        <select
          id="sm-mat"
          name="rawMaterialId"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">{t("selectMaterial")}</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="sm-type">
          {t("type")}
        </label>
        <select
          id="sm-type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as StockMovementType)}
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          {MANUAL_TYPES.map((movementType) => (
            <option key={movementType} value={movementType}>
              {t(`types.${TYPE_LABELS[movementType]}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="sm-qty">
          {t("quantity")}
        </label>
        <input
          id="sm-qty"
          name="quantity"
          value={quantityText}
          onChange={(e) => {
            setQuantityText(sanitizePositiveDecimal(e.target.value));
            if (clientError) setClientError(null);
          }}
          required
          inputMode="decimal"
          placeholder={t("quantityPlaceholder")}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm tabular-nums dark:border-zinc-700 dark:bg-zinc-950"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t("quantityHint", { direction: quantityDirectionHint })}
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="sm-cost">
          {t("unitCost")}
        </label>
        <input id="sm-cost" name="unitCost" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="sm-note">
          {t("note")}
        </label>
        <textarea id="sm-note" name="note" rows={2} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
      </div>

      {clientError ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {clientError}
        </p>
      ) : null}

      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || materials.length === 0}
        className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? t("submitPending") : t("submit")}
      </button>
    </form>
  );
}
