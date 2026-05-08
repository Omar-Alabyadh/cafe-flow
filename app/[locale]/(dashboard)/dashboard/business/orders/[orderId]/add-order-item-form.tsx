"use client";

import { useActionState } from "react";
import { addOrderItem, type OrderActionState } from "../actions";
import { useTranslations } from "next-intl";

type ProductOption = { id: string; label: string };

const initialState: OrderActionState = { error: null, success: null, formResetKey: 0 };

export function AddOrderItemForm({
  locale,
  orderId,
  products,
}: {
  locale: string;
  orderId: string;
  products: ProductOption[];
}) {
  const t = useTranslations("dashboard.business.orders.details.addItemForm");
  const [state, formAction, pending] = useActionState(addOrderItem, initialState);
  const formKey = state.formResetKey ?? 0;

  return (
    <form
      key={formKey}
      action={formAction}
      className="mb-8 max-w-lg space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="orderId" value={orderId} />
      <h3 className="text-base font-semibold">{t("title")}</h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {t("description")}
      </p>

      <div className="space-y-1">
        <label htmlFor="order-product" className="text-sm font-medium">
          {t("product")}
        </label>
        <select
          id="order-product"
          name="productId"
          required
          autoFocus
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-start text-sm dark:border-zinc-700 dark:bg-zinc-950"
          defaultValue=""
        >
          <option value="" disabled>
            {t("selectProduct")}
          </option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="order-qty" className="text-sm font-medium">
          {t("quantity")}
        </label>
        <input
          id="order-qty"
          name="quantity"
          required
          placeholder={t("quantityPlaceholder")}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || products.length === 0}
        className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? t("submitPending") : t("submit")}
      </button>
    </form>
  );
}
