"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveUnit, type SaveUnitState } from "./actions";
import { useTranslations } from "next-intl";

const initial: SaveUnitState = { error: null };

export type UnitDraft = {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string | null;
  symbol: string | null;
};

export type UnitFieldValues = {
  code: string;
  nameAr: string;
  nameEn: string;
  symbol: string;
};

type UnitFormProps = {
  locale: string;
  fieldsKey: string;
  initialValues: UnitFieldValues;
  editingUnitId: string | null;
  onCancel: () => void;
  onSaveSuccess: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  embedTitle?: boolean;
  hideInlineCancel?: boolean;
};

export function UnitForm({
  locale,
  fieldsKey,
  initialValues,
  editingUnitId,
  onCancel,
  onSaveSuccess,
  onDirtyChange,
  embedTitle = false,
  hideInlineCancel = false,
}: UnitFormProps) {
  const t = useTranslations("dashboard.business.units.form");
  const [state, formAction, pending] = useActionState(saveUnit, initial);
  const [code, setCode] = useState(initialValues.code);
  const [nameAr, setNameAr] = useState(initialValues.nameAr);
  const [nameEn, setNameEn] = useState(initialValues.nameEn);
  const [symbol, setSymbol] = useState(initialValues.symbol);
  const onSaveSuccessRef = useRef(onSaveSuccess);
  const baselineRef = useRef(JSON.stringify(initialValues));

  useEffect(() => {
    onSaveSuccessRef.current = onSaveSuccess;
  }, [onSaveSuccess]);
  useEffect(() => {
    if (!onDirtyChange) return;
    onDirtyChange(JSON.stringify({ code, nameAr, nameEn, symbol }) !== baselineRef.current);
  }, [code, nameAr, nameEn, symbol, onDirtyChange]);
  useEffect(() => {
    if (!state.success || !state.completedAt) return;
    const t = window.setTimeout(() => onSaveSuccessRef.current(), 0);
    return () => window.clearTimeout(t);
  }, [state.success, state.completedAt]);

  return (
    <form key={fieldsKey} action={formAction} className="w-full space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="unitId" value={editingUnitId ?? ""} />
      {embedTitle ? null : <h3 className="text-base font-semibold">{editingUnitId ? t("editTitle") : t("createTitle")}</h3>}

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="u-code">
          {t("code")}
        </label>
        <input id="u-code" name="code" value={code} onChange={(e) => setCode(e.target.value)} required className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" placeholder="kg" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="u-nameAr">
          {t("nameAr")}
        </label>
        <input id="u-nameAr" name="nameAr" value={nameAr} onChange={(e) => setNameAr(e.target.value)} required className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="u-nameEn">
          {t("nameEn")}
        </label>
        <input id="u-nameEn" name="nameEn" value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="u-symbol">
          {t("symbol")}
        </label>
        <input id="u-symbol" name="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" placeholder={t("symbolPlaceholder")} />
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
        {pending ? t("saving") : editingUnitId ? t("update") : t("save")}
      </button>
      {!hideInlineCancel ? (
        <button type="button" onClick={onCancel} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium dark:border-zinc-600">{t("cancel")}</button>
      ) : null}
    </form>
  );
}
