"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { addRecipeItem, type RecipeActionState } from "../actions";

const initial: RecipeActionState = { error: null };

type MatOption = { id: string; label: string };

export function AddRecipeItemForm({
  locale,
  recipeId,
  materials,
}: {
  locale: string;
  recipeId: string;
  materials: MatOption[];
}) {
  const t = useTranslations("dashboard.business.recipes.detail.addItemForm");
  const [state, formAction, pending] = useActionState(addRecipeItem, initial);

  return (
    <form action={formAction} className="mb-8 max-w-md space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="recipeId" value={recipeId} />
      <h3 className="text-base font-semibold">{t("title")}</h3>
      <p className="text-xs text-zinc-500">{t("description")}</p>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="ri-mat">
          {t("material")}
        </label>
        <select
          id="ri-mat"
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
        <label className="text-sm font-medium" htmlFor="ri-qty">
          {t("quantityPerUnit")}
        </label>
        <input
          id="ri-qty"
          name="quantity"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          placeholder="0.035"
        />
      </div>

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
        {pending ? t("pending") : t("submit")}
      </button>
    </form>
  );
}
