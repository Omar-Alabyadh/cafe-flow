"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { saveCategory, type CategoryFormState } from "./actions";

const initial: CategoryFormState = { error: null };

export type CategoryDraft = {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string | null;
  description: string | null;
};

export type CategoryFieldValues = {
  code: string;
  nameAr: string;
  nameEn: string;
  description: string;
};

function snapshotValues(v: CategoryFieldValues) {
  return JSON.stringify(v);
}

type CategoryFormFieldsProps = {
  locale: string;
  initialValues: CategoryFieldValues;
  editingCategoryId: string | null;
  isEditing: boolean;
  serverError: string | null;
  pending: boolean;
  onCancel: () => void;
  formAction: (payload: FormData) => void;
  embedTitle?: boolean;
  hideInlineCancel?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
};

/**
 * Controlled fields for create/edit category with keyboard-friendly navigation.
 */
function CategoryFormFields({
  locale,
  initialValues,
  editingCategoryId,
  isEditing,
  serverError,
  pending,
  onCancel,
  formAction,
  embedTitle = false,
  hideInlineCancel = false,
  onDirtyChange,
}: CategoryFormFieldsProps) {
  const t = useTranslations("dashboard.business.categories.form");
  const [code, setCode] = useState(initialValues.code);
  const [nameAr, setNameAr] = useState(initialValues.nameAr);
  const [nameEn, setNameEn] = useState(initialValues.nameEn);
  const [description, setDescription] = useState(initialValues.description);

  const baselineJson = useRef(snapshotValues(initialValues));
  const formRef = useRef<HTMLFormElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const nameArRef = useRef<HTMLInputElement>(null);
  const nameEnRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => codeRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!onDirtyChange) return;
    const now = snapshotValues({ code, nameAr, nameEn, description });
    onDirtyChange(now !== baselineJson.current);
  }, [code, nameAr, nameEn, description, onDirtyChange]);

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
      <input type="hidden" name="categoryId" value={editingCategoryId ?? ""} />

      {embedTitle ? null : (
        <h3 className="text-base font-semibold">{isEditing ? t("editTitle") : t("createTitle")}</h3>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="cat-code">
          {t("code")}
        </label>
        <input
          ref={codeRef}
          id="cat-code"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => handleFieldKeyDown(e, nameArRef.current, "focus-next")}
          autoComplete="off"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          placeholder="hot-drinks"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="cat-nameAr">
          {t("nameAr")}
        </label>
        <input
          ref={nameArRef}
          id="cat-nameAr"
          name="nameAr"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          onKeyDown={(e) => handleFieldKeyDown(e, nameEnRef.current, "focus-next")}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="cat-nameEn">
          {t("nameEn")}
        </label>
        <input
          ref={nameEnRef}
          id="cat-nameEn"
          name="nameEn"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          onKeyDown={(e) => handleFieldKeyDown(e, descRef.current, "focus-next")}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="cat-desc">
          {t("description")}
        </label>
        <textarea
          ref={descRef}
          id="cat-desc"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
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

type CategoryFormProps = {
  locale: string;
  fieldsKey: string;
  initialValues: CategoryFieldValues;
  editingCategoryId: string | null;
  onCancel: () => void;
  onSaveSuccess: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  embedTitle?: boolean;
  hideInlineCancel?: boolean;
};

/**
 * Connects form UI to `saveCategory` action state and completion callback.
 */
export function CategoryForm({
  locale,
  fieldsKey,
  initialValues,
  editingCategoryId,
  onCancel,
  onSaveSuccess,
  onDirtyChange,
  embedTitle = false,
  hideInlineCancel = false,
}: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(saveCategory, initial);
  const onSaveSuccessRef = useRef(onSaveSuccess);

  useEffect(() => {
    onSaveSuccessRef.current = onSaveSuccess;
  }, [onSaveSuccess]);

  useEffect(() => {
    if (!state.completedAt || !state.success) return;
    const t = window.setTimeout(() => onSaveSuccessRef.current(), 0);
    return () => window.clearTimeout(t);
  }, [state.completedAt, state.success]);

  const isEditing = Boolean(editingCategoryId);

  return (
    <CategoryFormFields
      key={fieldsKey}
      locale={locale}
      initialValues={initialValues}
      editingCategoryId={editingCategoryId}
      isEditing={isEditing}
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
