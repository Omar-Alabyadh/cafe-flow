"use client";

import { Coins } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { saveProduct, type ProductFieldKey, type ProductFormState } from "./actions";

const initial: ProductFormState = { error: null };

type CategoryOption = { id: string; label: string };

/** Row shape when the user opens a product for editing (from the table or row click). */
export type ProductDraft = {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string | null;
  categoryId: string | null;
  basePrice: string;
};

export type ProductFieldValues = {
  code: string;
  nameAr: string;
  nameEn: string;
  categoryId: string;
  basePrice: string;
};

type ProductFormFieldsProps = {
  locale: string;
  categories: CategoryOption[];
  initialValues: ProductFieldValues;
  editingProductId: string | null;
  isEditing: boolean;
  fieldErrors: Partial<Record<ProductFieldKey, string>>;
  serverError: string | null;
  pending: boolean;
  onCancel: () => void;
  formAction: (payload: FormData) => void;
  /** Hide heading when rendered inside a drawer with a parent title. */
  embedTitle?: boolean;
  /** Hide cancel button when drawer footer provides close action. */
  hideInlineCancel?: boolean;
  /** Report dirty state to parent workspace. */
  onDirtyChange?: (dirty: boolean) => void;
};

function inputErrorClass(hasError: boolean) {
  return hasError
    ? "border-red-500 ring-1 ring-red-500/40 dark:border-red-500 dark:ring-red-500/30"
    : "border-zinc-300 dark:border-zinc-700";
}

function fieldMessage(fieldErrors: Partial<Record<ProductFieldKey, string>>, k: ProductFieldKey) {
  return fieldErrors[k];
}

/** Keep numeric price input safe during typing (single dot, max 2 decimals). */
function sanitizePriceTyping(raw: string): string {
  let v = raw.replace(/[^\d.]/g, "");
  const dot = v.indexOf(".");
  if (dot === -1) return v;
  v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, "");
  const [intPart, frac = ""] = v.split(".");
  return intPart + "." + frac.slice(0, 2);
}

/** Normalize price to two decimals on blur when value is valid. */
function formatPriceOnBlur(current: string): string {
  const t = current.trim();
  if (t === "") return "";
  const n = Number(t);
  if (!Number.isFinite(n)) return current;
  return n.toFixed(2);
}

/**
 * Stable snapshot used for dirty tracking across form remounts.
 */
function snapshotValues(v: ProductFieldValues) {
  return JSON.stringify({
    code: v.code,
    nameAr: v.nameAr,
    nameEn: v.nameEn,
    categoryId: v.categoryId,
    basePrice: v.basePrice,
  });
}

function ProductFormFields({
  locale,
  categories,
  initialValues,
  editingProductId,
  isEditing,
  fieldErrors,
  serverError,
  pending,
  onCancel,
  formAction,
  embedTitle = false,
  hideInlineCancel = false,
  onDirtyChange,
}: ProductFormFieldsProps) {
  const t = useTranslations("dashboard.business.products.form");
  const [code, setCode] = useState(initialValues.code);
  const [nameAr, setNameAr] = useState(initialValues.nameAr);
  const [nameEn, setNameEn] = useState(initialValues.nameEn);
  const [categoryId, setCategoryId] = useState(initialValues.categoryId);
  const [basePrice, setBasePrice] = useState(initialValues.basePrice);

  const baselineJson = useRef(snapshotValues(initialValues));
  const formRef = useRef<HTMLFormElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const nameArRef = useRef<HTMLInputElement>(null);
  const nameEnRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => codeRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!onDirtyChange) return;
    const now = snapshotValues({ code, nameAr, nameEn, categoryId, basePrice });
    onDirtyChange(now !== baselineJson.current);
  }, [code, nameAr, nameEn, categoryId, basePrice, onDirtyChange]);

  /**
   * Enter moves to next field; Ctrl/Cmd+Enter submits the form.
   */
  const handleFieldKeyDown = (
    e: KeyboardEvent,
    next: HTMLElement | null,
    endBehavior: "focus-next" | "submit",
  ) => {
    if (e.key !== "Enter" || e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    if (endBehavior === "submit" || !next) {
      formRef.current?.requestSubmit();
    } else {
      next.focus();
    }
  };

  const fe = (k: ProductFieldKey) => fieldMessage(fieldErrors, k);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="w-full space-y-4"
      onKeyDown={(e) => {
        if (e.key !== "Enter" || (!e.ctrlKey && !e.metaKey)) return;
        e.preventDefault();
        formRef.current?.requestSubmit();
      }}
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="productId" value={editingProductId ?? ""} />

      {embedTitle ? null : <h3 className="text-base font-semibold">{isEditing ? t("editTitle") : t("createTitle")}</h3>}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="p-code">
              {t("code")}
            </label>
            <input
              ref={codeRef}
              id="p-code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => handleFieldKeyDown(e, nameArRef.current, "focus-next")}
              autoComplete="off"
              aria-invalid={Boolean(fe("code"))}
              className={`w-full rounded-md border bg-white px-3 py-2 text-sm dark:bg-zinc-950 ${inputErrorClass(Boolean(fe("code")))}`}
              placeholder="latte-med"
            />
            {fe("code") ? <p className="text-xs text-red-600 dark:text-red-400">{fe("code")}</p> : null}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="p-nameAr">
              {t("nameAr")}
            </label>
            <input
              ref={nameArRef}
              id="p-nameAr"
              name="nameAr"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              onKeyDown={(e) => handleFieldKeyDown(e, nameEnRef.current, "focus-next")}
              aria-invalid={Boolean(fe("nameAr"))}
              className={`w-full rounded-md border bg-white px-3 py-2 text-sm dark:bg-zinc-950 ${inputErrorClass(Boolean(fe("nameAr")))}`}
            />
            {fe("nameAr") ? <p className="text-xs text-red-600 dark:text-red-400">{fe("nameAr")}</p> : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="p-nameEn">
              {t("nameEn")}
            </label>
            <input
              ref={nameEnRef}
              id="p-nameEn"
              name="nameEn"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              onKeyDown={(e) => handleFieldKeyDown(e, categoryRef.current, "focus-next")}
              aria-invalid={Boolean(fe("nameEn"))}
              className={`w-full rounded-md border bg-white px-3 py-2 text-sm dark:bg-zinc-950 ${inputErrorClass(Boolean(fe("nameEn")))}`}
            />
            {fe("nameEn") ? <p className="text-xs text-red-600 dark:text-red-400">{fe("nameEn")}</p> : null}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="p-cat">
              {t("category")}
            </label>
            <select
              ref={categoryRef}
              id="p-cat"
              name="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              onKeyDown={(e) => handleFieldKeyDown(e, priceRef.current, "focus-next")}
              aria-invalid={Boolean(fe("categoryId"))}
              className={`w-full rounded-md border bg-white px-3 py-2 text-sm dark:bg-zinc-950 ${inputErrorClass(Boolean(fe("categoryId")))}`}
            >
              <option value="">{t("uncategorized")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            {fe("categoryId") ? (
              <p className="text-xs text-red-600 dark:text-red-400">{fe("categoryId")}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="p-price">
          {t("basePrice")}
        </label>
        <div
          className={`flex w-full items-center gap-2 rounded-md border bg-white px-2 py-0.5 dark:bg-zinc-950 ${inputErrorClass(Boolean(fe("basePrice")))}`}
        >
          <Coins
            className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden
          />
          <input
            ref={priceRef}
            id="p-price"
            name="basePrice"
            value={basePrice}
            onChange={(e) => setBasePrice(sanitizePriceTyping(e.target.value))}
            onBlur={() => setBasePrice((prev) => formatPriceOnBlur(prev))}
            onKeyDown={(e) => handleFieldKeyDown(e, null, "submit")}
            inputMode="decimal"
            autoComplete="off"
            aria-invalid={Boolean(fe("basePrice"))}
            className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm tabular-nums outline-none focus:ring-0"
            placeholder="0.00"
          />
        </div>
        {fe("basePrice") ? (
          <p className="text-xs text-red-600 dark:text-red-400">{fe("basePrice")}</p>
        ) : null}
      </div>

      {serverError ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {serverError}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="submit"
          disabled={pending}
          className="min-h-[40px] flex-1 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? t("saving") : isEditing ? t("update") : t("save")}
        </button>
        {!hideInlineCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[40px] rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium dark:border-zinc-600"
          >
            {t("cancel")}
          </button>
        ) : null}
      </div>
    </form>
  );
}

type ProductFormProps = {
  locale: string;
  categories: CategoryOption[];
  /** Remount key to reset local state between create/edit targets. */
  fieldsKey: string;
  initialValues: ProductFieldValues;
  editingProductId: string | null;
  onCancel: () => void;
  /** Called once after successful server action completion. */
  onSaveSuccess: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  embedTitle?: boolean;
  hideInlineCancel?: boolean;
};

/**
 * Wrapper that binds server action state and renders controlled form fields.
 */
export function ProductForm({
  locale,
  categories,
  fieldsKey,
  initialValues,
  editingProductId,
  onCancel,
  onSaveSuccess,
  onDirtyChange,
  embedTitle = false,
  hideInlineCancel = false,
}: ProductFormProps) {
  const [state, formAction, pending] = useActionState(saveProduct, initial);
  const onSaveSuccessRef = useRef(onSaveSuccess);

  useEffect(() => {
    onSaveSuccessRef.current = onSaveSuccess;
  }, [onSaveSuccess]);

  /**
   * Trigger success callback after state commit to avoid timing races.
   */
  useEffect(() => {
    if (!state.completedAt || !state.success) {
      return;
    }
    const outerTimer = window.setTimeout(() => {
      onSaveSuccessRef.current();
    }, 0);
    return () => window.clearTimeout(outerTimer);
  }, [state.completedAt, state.success]);

  const fieldErrors = state.fieldErrors ?? {};
  const isEditing = Boolean(editingProductId);

  return (
    <ProductFormFields
      key={fieldsKey}
      locale={locale}
      categories={categories}
      initialValues={initialValues}
      editingProductId={editingProductId}
      isEditing={isEditing}
      fieldErrors={fieldErrors}
      serverError={state.error}
      pending={pending}
      onCancel={onCancel}
      formAction={formAction}
      embedTitle={embedTitle}
      hideInlineCancel={hideInlineCancel}
      onDirtyChange={onDirtyChange}
    />
  );
}
