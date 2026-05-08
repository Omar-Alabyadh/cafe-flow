"use client";

import { useActionState } from "react";
import { createBusiness, type CreateBusinessState } from "./actions";
import { useTranslations } from "next-intl";

type CreateBusinessFormProps = {
  locale: string;
};

const initial: CreateBusinessState = { error: null };

/**
 * Simple create-business form (Phase 4).
 * Server action performs validation and creates Business + OWNER membership.
 */
export function CreateBusinessForm({ locale }: CreateBusinessFormProps) {
  const t = useTranslations("dashboard.business.createForm");
  const [state, formAction, pending] = useActionState(createBusiness, initial);

  return (
    <form action={formAction} className="max-w-md space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <input type="hidden" name="locale" value={locale} />

      <div className="space-y-1">
        <label htmlFor="code" className="text-sm font-medium">
          {t("code")}
        </label>
        <input
          id="code"
          name="code"
          required
          placeholder="my-cafe"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <p className="text-xs text-zinc-500">{t("codeHint")}</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="nameAr" className="text-sm font-medium">
          {t("nameAr")}
        </label>
        <input
          id="nameAr"
          name="nameAr"
          required
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="nameEn" className="text-sm font-medium">
          {t("nameEn")}
        </label>
        <input
          id="nameEn"
          name="nameEn"
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
        className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {pending ? t("submitPending") : t("submit")}
      </button>
    </form>
  );
}
