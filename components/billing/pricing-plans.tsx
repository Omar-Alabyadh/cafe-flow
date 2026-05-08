"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { PLAN_CODES, type BillingCycle } from "@/lib/billing/plans";
import { getPlanPrice, getYearlySavings } from "@/lib/billing/pricing";
import { MoneyValue } from "@/components/ui/foundations/money-value";
import { PLAN_DEFINITIONS } from "@/lib/billing/plans";
import { CtaSupportMicrocopy } from "@/components/public/cta-support-microcopy";
import { formatArabicLatnInteger } from "@/lib/format/numbers";
import { useTranslations } from "next-intl";

type PricingPlansProps = {
  locale: string;
};

export function PricingPlans({ locale }: PricingPlansProps) {
  const t = useTranslations("public.pricingPlans");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const trialDaysLabel = formatArabicLatnInteger(14);

  const cards = useMemo(() => {
    return PLAN_CODES.map((code) => {
      const plan = PLAN_DEFINITIONS[code];
      const price = getPlanPrice(code, billingCycle);
      const monthlyPrice = getPlanPrice(code, "monthly");
      const yearlySavings = getYearlySavings(code);
      return { ...plan, price, monthlyPrice, yearlySavings };
    });
  }, [billingCycle]);

  return (
    <>
      <div className="mb-6 inline-flex rounded-lg border border-zinc-200 bg-white p-1 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={() => setBillingCycle("monthly")}
          className={`rounded-md px-4 py-2 transition ${
            billingCycle === "monthly"
              ? "bg-emerald-600 text-white"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {t("monthly")}
        </button>
        <button
          type="button"
          onClick={() => setBillingCycle("yearly")}
          className={`rounded-md px-4 py-2 transition ${
            billingCycle === "yearly"
              ? "bg-emerald-600 text-white"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {t("yearly")}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((plan) => (
          <article
            key={plan.code}
            className={`cf-surface relative rounded-xl p-6 transition ${plan.isRecommended ? "ring-2 ring-amber-400/70" : ""}`}
          >
            {plan.isRecommended ? (
              <p className="absolute -top-3 inset-s-4 inline-flex w-fit items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                <Sparkles className="h-3 w-3" />
                {t("mostUsed")}
              </p>
            ) : null}

            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <p className="mt-2 text-3xl font-bold">
              <MoneyValue amount={plan.price} size="lg" />
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              / {billingCycle === "monthly" ? t("month") : t("year")}{" "}
              {billingCycle === "yearly" ? (
                <>
                  - {t("insteadOf")} <MoneyValue amount={plan.monthlyPrice * 12} size="sm" className="inline-flex" />
                </>
              ) : null}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                {t("trialDays", { days: trialDaysLabel })}
              </span>
              {billingCycle === "yearly" ? (
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  {t("save")} <MoneyValue amount={plan.yearlySavings} size="sm" className="inline-flex" />
                </span>
              ) : null}
            </div>

            <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" /> {plan.branchLimitLabelAr}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" /> {plan.staffLimitLabelAr}
              </li>
              {plan.featuresAr.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" /> {feature}
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-lg bg-zinc-50 p-2 text-xs text-zinc-500 dark:bg-zinc-950">
              {plan.code === "basic"
                ? t("planHint.basic")
                : plan.code === "pro"
                  ? t("planHint.pro")
                  : t("planHint.enterprise")}
            </p>

            <Link
              href={`/${locale}/checkout?plan=${plan.code}&billing=${billingCycle}`}
              className="mt-6 inline-flex w-full justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              {t("startNow")}
            </Link>
            <CtaSupportMicrocopy className="mt-2" />
          </article>
        ))}
      </div>
    </>
  );
}
