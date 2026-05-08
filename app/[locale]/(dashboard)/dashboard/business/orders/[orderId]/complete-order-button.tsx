"use client";

import { useState, useTransition } from "react";
import { completeOrder } from "../actions";
import { useTranslations } from "next-intl";

export function CompleteOrderButton({ locale, orderId }: { locale: string; orderId: string }) {
  const t = useTranslations("dashboard.business.orders.details.completeButton");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    const formData = new FormData();
    formData.set("locale", locale);
    formData.set("orderId", orderId);

    startTransition(async () => {
      const result = await completeOrder(formData);
      setError(result.error);
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? t("pending") : t("label")}
      </button>
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

