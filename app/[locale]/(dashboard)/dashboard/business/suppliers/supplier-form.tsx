"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveSupplier, type SaveSupplierState } from "./actions";
import { useTranslations } from "next-intl";

const initial: SaveSupplierState = { error: null };

export type SupplierDraft = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
};

export type SupplierFieldValues = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};

type SupplierFormProps = {
  locale: string;
  fieldsKey: string;
  initialValues: SupplierFieldValues;
  editingSupplierId: string | null;
  onCancel: () => void;
  onSaveSuccess: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  embedTitle?: boolean;
  hideInlineCancel?: boolean;
};

export function SupplierForm({
  locale,
  fieldsKey,
  initialValues,
  editingSupplierId,
  onCancel,
  onSaveSuccess,
  onDirtyChange,
  embedTitle = false,
  hideInlineCancel = false,
}: SupplierFormProps) {
  const t = useTranslations("dashboard.business.suppliers.form");
  const [state, formAction, pending] = useActionState(saveSupplier, initial);
  const [name, setName] = useState(initialValues.name);
  const [phone, setPhone] = useState(initialValues.phone);
  const [email, setEmail] = useState(initialValues.email);
  const [notes, setNotes] = useState(initialValues.notes);
  const onSaveSuccessRef = useRef(onSaveSuccess);
  const baselineRef = useRef(JSON.stringify(initialValues));

  useEffect(() => {
    onSaveSuccessRef.current = onSaveSuccess;
  }, [onSaveSuccess]);

  useEffect(() => {
    if (!onDirtyChange) return;
    onDirtyChange(JSON.stringify({ name, phone, email, notes }) !== baselineRef.current);
  }, [name, phone, email, notes, onDirtyChange]);

  useEffect(() => {
    if (!state.success || !state.completedAt) return;
    const t = window.setTimeout(() => onSaveSuccessRef.current(), 0);
    return () => window.clearTimeout(t);
  }, [state.success, state.completedAt]);

  return (
    <form key={fieldsKey} action={formAction} className="w-full space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="supplierId" value={editingSupplierId ?? ""} />
      {embedTitle ? null : <h3 className="text-base font-semibold">{editingSupplierId ? t("editTitle") : t("createTitle")}</h3>}

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="s-name">
          {t("name")}
        </label>
        <input id="s-name" name="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="s-phone">
          {t("phone")}
        </label>
        <input id="s-phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="s-email">
          {t("email")}
        </label>
        <input id="s-email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="s-notes">
          {t("notes")}
        </label>
        <textarea id="s-notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
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
        {pending ? t("saving") : editingSupplierId ? t("update") : t("save")}
      </button>
      {!hideInlineCancel ? (
        <button type="button" onClick={onCancel} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium dark:border-zinc-600">
          {t("cancel")}
        </button>
      ) : null}
    </form>
  );
}
