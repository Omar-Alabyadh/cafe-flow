"use client";

import { CURATED_TIME_ZONE_OPTIONS } from "@/lib/time-zone/options";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useMemo, useState } from "react";
import { saveBusinessTimeZone, type SaveBusinessTimeZoneState } from "./actions";

const initialState: SaveBusinessTimeZoneState = { error: null };

export function BusinessTimeZoneForm({
  locale,
  currentTimeZone,
}: {
  locale: string;
  currentTimeZone: string;
}) {
  const t = useTranslations("dashboard.business.timeZone");
  const [state, formAction, pending] = useActionState(saveBusinessTimeZone, initialState);
  const [timeZone, setTimeZone] = useState(currentTimeZone);
  const [toast, setToast] = useState<string | null>(null);

  const selectedKnownOption = useMemo(
    () => CURATED_TIME_ZONE_OPTIONS.some((option) => option.value === timeZone),
    [timeZone],
  );

  useEffect(() => {
    if (!state.success || !state.completedAt) return;
    const showTimer = window.setTimeout(() => {
      setToast(t("saveSuccess"));
    }, 0);
    const hideTimer = window.setTimeout(() => setToast(null), 2500);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [state.success, state.completedAt, t]);

  return (
    <form action={formAction} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <input type="hidden" name="locale" value={locale} />
      <div className="mb-3">
        <p className="text-sm font-semibold">{t("businessTitle")}</p>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{t("help")}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <label className="space-y-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{t("label")}</span>
          <input
            name="timeZone"
            list="business-time-zone-options"
            value={timeZone}
            onChange={(event) => setTimeZone(event.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            required
          />
          <datalist id="business-time-zone-options">
            {CURATED_TIME_ZONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.group} - {option.label}
              </option>
            ))}
          </datalist>
          {!selectedKnownOption ? <span className="text-xs text-zinc-500">{t("customHint")}</span> : null}
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? t("saving") : t("save")}
        </button>
      </div>

      {state.error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p> : null}
      {toast ? <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{toast}</p> : null}
    </form>
  );
}
