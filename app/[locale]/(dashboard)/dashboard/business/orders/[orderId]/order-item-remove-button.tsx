"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { removeOrderItem, type OrderActionState } from "../actions";
import { useTranslations } from "next-intl";

const initialState: OrderActionState = { error: null, success: null };

export function OrderItemRemoveButton({
  locale,
  orderId,
  orderItemId,
  productNameAr,
}: {
  locale: string;
  orderId: string;
  orderItemId: string;
  productNameAr: string;
}) {
  const t = useTranslations("dashboard.business.orders.details.removeButton");
  const [state, formAction, pending] = useActionState(removeOrderItem, initialState);

  return (
    <div className="space-y-1">
      <form action={formAction}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="orderId" value={orderId} />
        <input type="hidden" name="orderItemId" value={orderItemId} />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-md border border-red-200 p-2 text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
          aria-label={t("ariaLabel", { name: productNameAr })}
          title={t("title")}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </form>
      {state.error ? <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p> : null}
    </div>
  );
}
