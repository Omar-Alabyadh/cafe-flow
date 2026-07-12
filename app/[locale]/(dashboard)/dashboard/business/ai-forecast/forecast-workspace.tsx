"use client";

import { startTransition, useActionState, useMemo, useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { requestForecast } from "./actions";
import type { ForecastUiActionState } from "@/lib/ai/forecast/ui/action-core";
import type { ClientForecastProduct, ForecastClientResponse } from "@/lib/ai/forecast/server/types";

type BranchOption = { reference: string; label: string };
type ForecastWorkspaceProps = { locale: string; branches: BranchOption[] };

const initialState: ForecastUiActionState = { response: null, submittedControls: null };

function isFiniteQuantity(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value >= 0;
}

function qualityTone(quality: string) {
  if (quality === "HIGH") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200";
  if (quality === "MEDIUM") return "border-sky-500/40 bg-sky-500/10 text-sky-800 dark:text-sky-200";
  if (quality === "LOW") return "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200";
  return "border-zinc-400/40 bg-zinc-500/10 text-zinc-700 dark:text-zinc-200";
}

export function ForecastWorkspace({ locale, branches }: ForecastWorkspaceProps) {
  const t = useTranslations("dashboard.business.forecast");
  const [state, formAction, pending] = useActionState(requestForecast, initialState);
  const [mode, setMode] = useState<"REAL_PILOT" | "ACADEMIC_DEMO">("REAL_PILOT");
  const [scopeType, setScopeType] = useState<"BUSINESS" | "BRANCH">("BUSINESS");
  const [horizonDays, setHorizonDays] = useState<"1" | "7">("1");
  const [branchSelection, setBranchSelection] = useState("");
  const response = state.response;
  const submittedControls = state.submittedControls;

  const rows = useMemo(() => response && response.ok ? response.products.flatMap((product) => product.forecasts.map((forecast) => ({ product, forecast }))) : [], [response]);
  const highestProducts = useMemo(() => {
    const values = rows.filter((row) => isFiniteQuantity(row.forecast.predictedQuantity));
    const maximum = Math.max(...values.map((row) => row.forecast.predictedQuantity).filter(isFiniteQuantity), -Infinity);
    return maximum > -Infinity ? values.filter((row) => row.forecast.predictedQuantity === maximum).map((row) => row.product.productLabel) : [];
  }, [rows]);

  const number = (value: number | null) => isFiniteQuantity(value)
    ? new Intl.NumberFormat(locale === "ar" ? "ar-LY" : "en-US", { maximumFractionDigits: 2 }).format(value)
    : t("results.unavailable");
  const date = (value: string | null) => {
    if (!value || Number.isNaN(Date.parse(`${value}T12:00:00.000Z`))) return t("results.unavailable");
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-LY" : "en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T12:00:00.000Z`));
  };
  const timestamp = (value: string) => Number.isNaN(Date.parse(value))
    ? t("results.unavailable")
    : new Intl.DateTimeFormat(locale === "ar" ? "ar-LY" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  const modeLabel = (value: "REAL_PILOT" | "ACADEMIC_DEMO") => t(value === "REAL_PILOT" ? "modes.real.title" : "modes.demo.title");
  const sourceLabel = (value: "NATIVE_ONLY" | "DEMO_ONLY") => t(value === "NATIVE_ONLY" ? "sources.native" : "sources.demo");
  const qualityLabel = (value: string) => t(`quality.${value}.label`);
  const qualityDescription = (value: string) => t(`quality.${value}.description`);

  const selectMode = (next: "REAL_PILOT" | "ACADEMIC_DEMO") => {
    setMode(next);
    if (next === "ACADEMIC_DEMO") {
      setScopeType("BUSINESS");
      setBranchSelection("");
    }
  };

  const submitForecast = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };

  return (
    <div className="space-y-6">
      <section className="cf-surface rounded-2xl border border-border p-4 shadow-sm md:p-6" aria-labelledby="forecast-controls-title">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-700 dark:text-emerald-300"><Sparkles className="h-5 w-5" aria-hidden /></div>
          <div>
            <h3 id="forecast-controls-title" className="text-lg font-semibold">{t("controls.title")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("controls.description")}</p>
          </div>
        </div>
        <form onSubmit={submitForecast} onReset={(event) => event.preventDefault()} className="mt-5 space-y-5">
          <input type="hidden" name="scopeType" value={scopeType} />
          <fieldset disabled={pending} className="space-y-3 disabled:opacity-70">
            <legend className="text-sm font-semibold">{t("controls.mode")}</legend>
            <div className="grid gap-3 md:grid-cols-2">
              {(["REAL_PILOT", "ACADEMIC_DEMO"] as const).map((candidate) => (
                <label key={candidate} className={`cursor-pointer rounded-xl border p-4 transition focus-within:ring-2 focus-within:ring-emerald-500 ${mode === candidate ? "border-emerald-500 bg-emerald-500/10" : "border-border bg-card"}`}>
                  <input className="sr-only" type="radio" name="forecastMode" value={candidate} checked={mode === candidate} onChange={() => selectMode(candidate)} />
                  <span className="block text-sm font-semibold">{modeLabel(candidate)}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{t(candidate === "REAL_PILOT" ? "modes.real.description" : "modes.demo.description")}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm font-medium">
              <span>{t("controls.scope")}</span>
              <select value={scopeType} onChange={(event) => setScopeType(event.target.value as "BUSINESS" | "BRANCH")} disabled={pending || mode === "ACADEMIC_DEMO"} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="BUSINESS">{t("controls.business")}</option>
                <option value="BRANCH" disabled={mode === "ACADEMIC_DEMO"}>{t("controls.branch")}</option>
              </select>
            </label>
            <label className="space-y-1 text-sm font-medium">
              <span>{t("controls.branch")}</span>
              <select name="branchSelection" value={branchSelection} onChange={(event) => setBranchSelection(event.target.value)} disabled={pending || scopeType !== "BRANCH"} required={scopeType === "BRANCH"} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60">
                <option value="">{t("controls.chooseBranch")}</option>
                {branches.map((branch) => <option key={branch.reference} value={branch.reference}>{branch.label}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm font-medium">
              <span>{t("controls.horizon")}</span>
              <select name="horizonDays" value={horizonDays} onChange={(event) => setHorizonDays(event.target.value as "1" | "7")} disabled={pending} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="1">{t("controls.nextDay")}</option>
                <option value="7">{t("controls.nextSevenDays")}</option>
              </select>
            </label>
          </div>
          <button type="submit" disabled={pending || (scopeType === "BRANCH" && !branchSelection)} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-zinc-950">
            {pending ? t("controls.loading") : t("controls.generate")}
          </button>
        </form>
      </section>

      <section aria-live="polite" aria-atomic="true">
        {!response ? <InitialState t={t} /> : !response.ok ? <ErrorState response={response} t={t} /> : response.state === "INSUFFICIENT_HISTORY" ? <InsufficientHistory t={t} /> : <ForecastResults response={response} submittedControls={submittedControls} t={t} date={date} timestamp={timestamp} number={number} sourceLabel={sourceLabel} qualityLabel={qualityLabel} qualityDescription={qualityDescription} highestProducts={highestProducts} />}
      </section>

      <ModelExplanation t={t} />
    </div>
  );
}

function InitialState({ t }: { t: ReturnType<typeof useTranslations> }) {
  return <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground"><h3 className="text-base font-semibold text-foreground">{t("initial.title")}</h3><p className="mt-2 max-w-3xl leading-6">{t("initial.description")}</p></div>;
}

function ErrorState({ response, t }: { response: Exclude<ForecastClientResponse, { ok: true }>; t: ReturnType<typeof useTranslations> }) {
  return <div role="alert" className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5"><h3 className="font-semibold text-rose-900 dark:text-rose-100">{t("errors.title")}</h3><p className="mt-1 text-sm text-rose-800 dark:text-rose-200">{t(`errors.${response.code}`)}</p></div>;
}

function InsufficientHistory({ t }: { t: ReturnType<typeof useTranslations> }) {
  return <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6"><h3 className="text-lg font-semibold text-foreground">{t("insufficient.title")}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{t("insufficient.message")}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{t("insufficient.explanation")}</p></div>;
}

function ForecastResults({ response, submittedControls, t, date, timestamp, number, sourceLabel, qualityLabel, qualityDescription, highestProducts }: { response: Extract<ForecastClientResponse, { ok: true }>; submittedControls: ForecastUiActionState["submittedControls"]; t: ReturnType<typeof useTranslations>; date: (value: string | null) => string; timestamp: (value: string) => string; number: (value: number | null) => string; sourceLabel: (value: "NATIVE_ONLY" | "DEMO_ONLY") => string; qualityLabel: (value: string) => string; qualityDescription: (value: string) => string; highestProducts: string[] }) {
  const rows = response.products.flatMap((product) => product.forecasts.map((forecast) => ({ product, forecast })));
  const first = rows[0]?.forecast;
  return <div className="space-y-5">
    {response.demo.isDemo ? <div className="rounded-2xl border border-violet-500/50 bg-violet-500/10 p-5"><p className="font-semibold text-violet-900 dark:text-violet-100">{t("demo.banner")}</p><p className="mt-1 text-sm text-violet-800 dark:text-violet-200">{t("demo.description")}</p></div> : null}
    <div className="cf-surface rounded-2xl border border-border p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-semibold">{t("results.title")}</h3><p className="mt-1 text-sm text-muted-foreground">{t("results.mode")}: {submittedControls?.forecastMode === "REAL_PILOT" ? t("modes.real.title") : submittedControls?.forecastMode === "ACADEMIC_DEMO" ? t("modes.demo.title") : t("results.unavailable")} · {sourceLabel(response.dataSource)}</p></div><span className="rounded-full border border-border px-3 py-1 text-xs font-medium">{submittedControls?.scopeType === "BUSINESS" ? t("controls.business") : submittedControls?.scopeType === "BRANCH" ? response.branchLabel : t("results.unavailable")}</span></div>
      {highestProducts.length ? <p className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-900 dark:text-emerald-100">{t("results.highDemand")}: {highestProducts.join("، ")}</p> : null}
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[880px] text-start text-sm"><thead className="border-b border-border text-xs text-muted-foreground"><tr><th className="px-3 py-2 text-start">{t("table.product")}</th><th className="px-3 py-2 text-start">{t("table.date")}</th><th className="px-3 py-2 text-start">{t("table.predicted")}</th><th className="px-3 py-2 text-start">{t("table.lower")}</th><th className="px-3 py-2 text-start">{t("table.upper")}</th><th className="px-3 py-2 text-start">{t("table.quality")}</th><th className="px-3 py-2 text-start">{t("table.model")}</th></tr></thead><tbody>{rows.map(({ product, forecast }) => <tr key={`${product.productReference}-${forecast.forecastDate}`} className="border-b border-border/70"><td className="px-3 py-3 font-medium">{product.productLabel}</td><td className="px-3 py-3">{date(forecast.forecastDate)}</td><td className="px-3 py-3 tabular-nums">{number(forecast.predictedQuantity)}</td><td className="px-3 py-3 tabular-nums">{number(forecast.lowerBound)}</td><td className="px-3 py-3 tabular-nums">{number(forecast.upperBound)}</td><td className="px-3 py-3"><span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${qualityTone(forecast.quality)}`}>{qualityLabel(forecast.quality)}<span className="sr-only">: {qualityDescription(forecast.quality)}</span></span></td><td className="px-3 py-3 text-xs">{t(`models.${forecast.modelFamily}.title`)}</td></tr>)}</tbody></table></div>
      {first ? <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5"><div><dt className="text-muted-foreground">{t("summary.generated")}</dt><dd className="mt-1 font-medium">{timestamp(first.generatedAt)}</dd></div><div><dt className="text-muted-foreground">{t("summary.horizon")}</dt><dd className="mt-1 font-medium">{submittedControls?.horizonDays === "7" ? t("controls.nextSevenDays") : submittedControls?.horizonDays === "1" ? t("controls.nextDay") : t("results.unavailable")}</dd></div><div><dt className="text-muted-foreground">{t("summary.training")}</dt><dd className="mt-1 font-medium">{date(first.trainingStartDate)} — {date(first.trainingEndDate)}</dd></div><div><dt className="text-muted-foreground">{t("summary.observations")}</dt><dd className="mt-1 font-medium">{number(first.observationCount)}</dd></div><div><dt className="text-muted-foreground">{t("summary.activeDays")}</dt><dd className="mt-1 font-medium">{number(first.activeSalesDays)}</dd></div></dl> : null}
    </div>
    <Metrics products={response.products} t={t} number={number} />
  </div>;
}

function Metrics({ products, t, number }: { products: ClientForecastProduct[]; t: ReturnType<typeof useTranslations>; number: (value: number | null) => string }) {
  const metric = products.find((product) => product.backtesting)?.backtesting;
  if (!metric) return null;
  return <div className="cf-surface rounded-2xl border border-border p-5"><h3 className="text-lg font-semibold">{t("metrics.title")}</h3><p className="mt-1 text-sm text-muted-foreground">{t("metrics.description")}</p><dl className="mt-4 grid gap-3 sm:grid-cols-3"><div><dt className="font-medium">MAE</dt><dd className="mt-1 tabular-nums">{number(metric.mae)}</dd><p className="mt-1 text-xs text-muted-foreground">{t("metrics.mae")}</p></div><div><dt className="font-medium">WAPE</dt><dd className="mt-1 tabular-nums">{number(metric.wape)}</dd><p className="mt-1 text-xs text-muted-foreground">{t("metrics.wape")}</p></div><div><dt className="font-medium">{t("metrics.biasLabel")}</dt><dd className="mt-1 tabular-nums">{number(metric.bias)}</dd><p className="mt-1 text-xs text-muted-foreground">{t("metrics.bias")}</p></div></dl></div>;
}

function ModelExplanation({ t }: { t: ReturnType<typeof useTranslations> }) {
  return <details className="cf-surface rounded-2xl border border-border p-5"><summary className="cursor-pointer text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500">{t("models.title")}</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">{t("models.intro")}</p><div className="mt-4 grid gap-3 md:grid-cols-3">{(["SEASONAL_NAIVE", "MOVING_AVERAGE", "CROSTON"] as const).map((model) => <div key={model} className="rounded-xl border border-border p-4"><h4 className="font-semibold">{t(`models.${model}.title`)}</h4><p className="mt-2 text-sm leading-6 text-muted-foreground">{t(`models.${model}.description`)}</p></div>)}</div></details>;
}
