"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveBranch, type SaveBranchState } from "./actions";
import { useTranslations } from "next-intl";
import { CURATED_TIME_ZONE_OPTIONS } from "@/lib/time-zone/options";

type CreateBranchFormProps = {
  locale: string;
  fieldsKey: string;
  initialValues: BranchFieldValues;
  editingBranchId: string | null;
  businessTimeZone: string;
  onCancel: () => void;
  onSaveSuccess: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  embedTitle?: boolean;
  hideInlineCancel?: boolean;
};

const initial: SaveBranchState = { error: null };

export type BranchDraft = {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string | null;
  timeZone: string | null;
};

export type BranchFieldValues = {
  code: string;
  nameAr: string;
  nameEn: string;
  timeZone: string;
};

export function CreateBranchForm({
  locale,
  fieldsKey,
  initialValues,
  editingBranchId,
  businessTimeZone,
  onCancel,
  onSaveSuccess,
  onDirtyChange,
  embedTitle = false,
  hideInlineCancel = false,
}: CreateBranchFormProps) {
  const t = useTranslations("dashboard.business.branches.form");
  const [state, formAction, pending] = useActionState(saveBranch, initial);
  const [code, setCode] = useState(initialValues.code);
  const [nameAr, setNameAr] = useState(initialValues.nameAr);
  const [nameEn, setNameEn] = useState(initialValues.nameEn);
  const [timeZone, setTimeZone] = useState(initialValues.timeZone);
  const onSaveSuccessRef = useRef(onSaveSuccess);
  const baselineRef = useRef(JSON.stringify(initialValues));

  useEffect(() => {
    onSaveSuccessRef.current = onSaveSuccess;
  }, [onSaveSuccess]);
  useEffect(() => {
    if (!onDirtyChange) return;
    onDirtyChange(JSON.stringify({ code, nameAr, nameEn, timeZone }) !== baselineRef.current);
  }, [code, nameAr, nameEn, timeZone, onDirtyChange]);
  useEffect(() => {
    if (!state.success || !state.completedAt) return;
    const t = window.setTimeout(() => onSaveSuccessRef.current(), 0);
    return () => window.clearTimeout(t);
  }, [state.success, state.completedAt]);

  return (
    <form key={fieldsKey} action={formAction} className="w-full space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="branchId" value={editingBranchId ?? ""} />
      {embedTitle ? null : <h3 className="text-base font-semibold">{editingBranchId ? t("editTitle") : t("createTitle")}</h3>}

      <div className="space-y-1">
        <label htmlFor="b-code" className="text-sm font-medium">
          {t("code")}
        </label>
        <input
          id="b-code"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          placeholder="MAIN"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <p className="text-xs text-zinc-500">{t("codeHint")}</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="b-nameAr" className="text-sm font-medium">
          {t("nameAr")}
        </label>
        <input
          id="b-nameAr"
          name="nameAr"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          required
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="b-nameEn" className="text-sm font-medium">
          {t("nameEn")}
        </label>
        <input
          id="b-nameEn"
          name="nameEn"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="b-time-zone" className="text-sm font-medium">
          {t("timeZone")}
        </label>
        <input
          id="b-time-zone"
          name="timeZone"
          list="branch-time-zone-options"
          value={timeZone}
          onChange={(e) => setTimeZone(e.target.value)}
          placeholder={t("useBusinessTimeZone", { timeZone: businessTimeZone })}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <datalist id="branch-time-zone-options">
          {CURATED_TIME_ZONE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.group} - {option.label}
            </option>
          ))}
        </datalist>
        <p className="text-xs text-zinc-500">{t("timeZoneHint")}</p>
      </div>

      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? t("saving") : editingBranchId ? t("update") : t("save")}
      </button>
      {!hideInlineCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium dark:border-zinc-600"
        >
          {t("cancel")}
        </button>
      ) : null}
    </form>
  );
}
