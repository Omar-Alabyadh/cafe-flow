"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef, useState } from "react";
import { saveAddon, type SaveAddonState } from "./actions";

const initial: SaveAddonState = { error: null };

export type AddonDraft = {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string | null;
  extraPrice: string;
};

export type AddonFieldValues = {
  code: string;
  nameAr: string;
  nameEn: string;
  extraPrice: string;
};

type AddonFormProps = {
  locale: string;
  fieldsKey: string;
  initialValues: AddonFieldValues;
  editingAddonId: string | null;
  onCancel: () => void;
  onSaveSuccess: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  embedTitle?: boolean;
  hideInlineCancel?: boolean;
};

function snapshotValues(v: AddonFieldValues) {
  return JSON.stringify(v);
}

export function AddonForm({
  locale,
  fieldsKey,
  initialValues,
  editingAddonId,
  onCancel,
  onSaveSuccess,
  onDirtyChange,
  embedTitle = false,
  hideInlineCancel = false,
}: AddonFormProps) {
  const t = useTranslations("dashboard.business.addons.form");
  const [state, formAction, pending] = useActionState(saveAddon, initial);
  const [code, setCode] = useState(initialValues.code);
  const [nameAr, setNameAr] = useState(initialValues.nameAr);
  const [nameEn, setNameEn] = useState(initialValues.nameEn);
  const [extraPrice, setExtraPrice] = useState(initialValues.extraPrice);
  const onSaveSuccessRef = useRef(onSaveSuccess);
  const baselineJson = useRef(snapshotValues(initialValues));

  useEffect(() => {
    onSaveSuccessRef.current = onSaveSuccess;
  }, [onSaveSuccess]);

  useEffect(() => {
    if (!onDirtyChange) return;
    onDirtyChange(snapshotValues({ code, nameAr, nameEn, extraPrice }) !== baselineJson.current);
  }, [code, nameAr, nameEn, extraPrice, onDirtyChange]);

  useEffect(() => {
    if (!state.success || !state.completedAt) return;
    const t = window.setTimeout(() => onSaveSuccessRef.current(), 0);
    return () => window.clearTimeout(t);
  }, [state.success, state.completedAt]);

  return (
    <form key={fieldsKey} action={formAction} className="w-full space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="addonId" value={editingAddonId ?? ""} />
      {embedTitle ? null : <h3 className="text-base font-semibold">{editingAddonId ? t("editTitle") : t("createTitle")}</h3>}

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="a-code">
          {t("code")}
        </label>
        <input
          id="a-code"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          placeholder="oat-milk"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="a-nameAr">
          {t("nameAr")}
        </label>
        <input
          id="a-nameAr"
          name="nameAr"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          required
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="a-nameEn">
          {t("nameEn")}
        </label>
        <input
          id="a-nameEn"
          name="nameEn"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="a-price">
          {t("extraPrice")}
        </label>
        <input
          id="a-price"
          name="extraPrice"
          value={extraPrice}
          onChange={(e) => setExtraPrice(e.target.value)}
          required
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          placeholder="3.00"
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
        className="min-h-[40px] w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? t("saving") : editingAddonId ? t("update") : t("save")}
      </button>
      {!hideInlineCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[40px] w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium dark:border-zinc-600"
        >
          {t("cancel")}
        </button>
      ) : null}
    </form>
  );
}
