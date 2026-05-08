"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createRecipeForProduct, type RecipeActionState } from "../actions";

const initial: RecipeActionState = { error: null };

export function CreateRecipeForm({ locale, productId }: { locale: string; productId: string }) {
  const t = useTranslations("dashboard.business.recipes.detail.createForm");
  const [state, formAction, pending] = useActionState(createRecipeForProduct, initial);

  return (
    <form action={formAction} className="max-w-md space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="productId" value={productId} />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {t("description")}
      </p>
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
        {pending ? t("pending") : t("submit")}
      </button>
    </form>
  );
}
