"use client";

import { useActionState } from "react";
import { updateOrderItemQuantity, type OrderActionState } from "../actions";
import { useTranslations } from "next-intl";

const initialState: OrderActionState = { error: null, success: null };

export function OrderItemQuantityEditor({
  locale,
  orderId,
  orderItemId,
  defaultQuantity,
  productNameAr,
}: {
  locale: string;
  orderId: string;
  orderItemId: string;
  defaultQuantity: string;
  productNameAr: string;
}) {
  const t = useTranslations("dashboard.business.orders.details.quantityEditor");
  const [state, formAction, pending] = useActionState(updateOrderItemQuantity, initialState);

  return (
    <div className="space-y-1">
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="orderId" value={orderId} />
        <input type="hidden" name="orderItemId" value={orderItemId} />
        <input
          name="quantity"
          type="text"
          inputMode="decimal"
          required
          defaultValue={defaultQuantity}
          className="w-24 rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          aria-label={t("inputAria", { name: productNameAr })}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium disabled:opacity-60 dark:border-zinc-600"
        >
          {pending ? "…" : t("save")}
        </button>
      </form>
      {state.error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-xs text-emerald-700 dark:text-emerald-400">{state.success}</p>
      ) : null}
    </div>
  );
}
