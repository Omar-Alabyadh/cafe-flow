"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { PLAN_CODES, PLAN_DEFINITIONS, type BillingCycle } from "@/lib/billing/plans";
import { getPlanPrice, getYearlySavings } from "@/lib/billing/pricing";
import { MoneyValue } from "@/components/ui/foundations/money-value";
import { formatArabicLatnInteger } from "@/lib/format/numbers";
import { useTranslations } from "next-intl";

type LandingPricingProps = {
  locale: string;
};

export function LandingPricing({ locale }: LandingPricingProps) {
  const t = useTranslations("public.landing");
  const tPlans = useTranslations("public.pricingPlans");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const trialDaysLabel = formatArabicLatnInteger(14);

  const cards = useMemo(() => {
    return PLAN_CODES.map((code) => {
      const plan = PLAN_DEFINITIONS[code];
      const price = getPlanPrice(code, billingCycle);
      const monthlyPrice = getPlanPrice(code, "monthly");
      const yearlySavings = getYearlySavings(code);
      const rawBullets = t.raw(`pricing.planBullets.${code}`);
      const bullets = Array.isArray(rawBullets) ? rawBullets : [];
      return { ...plan, price, monthlyPrice, yearlySavings, bullets };
    });
  }, [billingCycle, t]);

  return (
    <section id="pricing" className="scroll-mt-28 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-primary">{t("pricing.sectionEyebrow")}</p>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">{t("pricing.sectionTitle")}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground md:text-base max-[430px]:text-xs">{t("pricing.trialBanner")}</p>

        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-xl border border-border bg-card/90 p-1.5 text-sm shadow-md backdrop-blur-md max-[430px]:w-full max-[430px]:max-w-sm">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`min-h-11 rounded-lg px-4 py-2 font-semibold transition max-[430px]:w-1/2 ${
                billingCycle === "monthly"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
              }`}
            >
              {tPlans("monthly")}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`min-h-11 rounded-lg px-4 py-2 font-semibold transition max-[430px]:w-1/2 ${
                billingCycle === "yearly"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
              }`}
            >
              {tPlans("yearly")}
            </button>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-sm gap-5 md:max-w-none md:grid-cols-3">
          {cards.map((plan) => (
            <article
              key={plan.code}
              className={`cf-surface cf-hover-card relative flex flex-col rounded-2xl p-6 md:p-8 ${
                plan.isRecommended
                  ? "ring-2 ring-amber-400/80 shadow-[0_24px_50px_-20px_rgba(245,158,11,0.45)] md:scale-[1.035]"
                  : ""
              }`}
            >
              <div className={`pointer-events-none absolute inset-0 rounded-2xl ${plan.isRecommended ? "bg-linear-to-br from-amber-400/12 via-primary/7 to-transparent" : "bg-linear-to-br from-primary/6 via-transparent to-transparent"} opacity-80`} />
              {plan.isRecommended ? (
                <p className="absolute -top-3 inset-s-6 inline-flex w-fit items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-amber-500/35">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  {tPlans("mostUsed")}
                </p>
              ) : null}

              <h3 className="text-xl font-semibold text-foreground max-[430px]:text-lg">{plan.nameEn}</h3>
              <p className="mt-3 text-4xl font-bold tracking-tight text-foreground max-[430px]:text-3xl">
                <MoneyValue amount={plan.price} size="lg" />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                / {billingCycle === "monthly" ? tPlans("month") : tPlans("year")}{" "}
                {billingCycle === "yearly" ? (
                  <>
                    · {tPlans("insteadOf")} <MoneyValue amount={plan.monthlyPrice * 12} size="sm" className="inline-flex" />
                  </>
                ) : null}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                  {tPlans("trialDays", { days: trialDaysLabel })}
                </span>
                {billingCycle === "yearly" ? (
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:text-amber-100">
                    {tPlans("save")} <MoneyValue amount={plan.yearlySavings} size="sm" className="inline-flex" />
                  </span>
                ) : null}
              </div>

              <ul className="mt-6 flex flex-1 flex-col gap-2.5 text-sm text-muted-foreground max-[430px]:text-[13px]">
                {(plan.bullets ?? []).map((line) => (
                  <li key={line} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 rounded-xl border border-border/70 bg-muted/50 p-3 text-xs text-muted-foreground">
                {plan.code === "basic"
                  ? tPlans("planHint.basic")
                  : plan.code === "pro"
                    ? tPlans("planHint.pro")
                    : tPlans("planHint.enterprise")}
              </p>

              <Link
                href={`/${locale}/checkout?plan=${plan.code}&billing=${billingCycle}`}
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:opacity-95"
              >
                {tPlans("startNow")}
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href={`/${locale}/pricing`} className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
            {t("pricing.compareLink")}
          </Link>
        </div>
      </div>
    </section>
  );
}
