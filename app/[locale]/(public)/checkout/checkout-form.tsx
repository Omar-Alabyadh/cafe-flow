"use client";

import { useActionState, useMemo, useState } from "react";
import {
  Banknote,
  Building2,
  CreditCard,
  Landmark,
  QrCode,
  Receipt,
  Smartphone,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { submitCheckout, type CheckoutState } from "./actions";
import { type BillingCycle, type PlanCode, getPlanDefinition } from "@/lib/billing/plans";
import { getPlanPrice, getYearlySavings } from "@/lib/billing/pricing";
import { MoneyValue } from "@/components/ui/foundations/money-value";
import { formatArabicLatnInteger } from "@/lib/format/numbers";
import { PAYMENT_METHODS } from "@/lib/payments/payment-methods";
import { useTranslations } from "next-intl";

type CheckoutFormProps = {
  locale: string;
  planCode: PlanCode;
  defaultBillingCycle: BillingCycle;
  defaultCustomerName: string;
};

const initialState: CheckoutState = { error: null, success: null };

function getMethodIcon(iconKey: string) {
  switch (iconKey) {
    case "wallet":
      return Wallet;
    case "credit-card":
      return CreditCard;
    case "smartphone":
      return Smartphone;
    case "building-2":
      return Building2;
    case "landmark":
      return Landmark;
    case "qr-code":
      return QrCode;
    case "receipt":
      return Receipt;
    case "banknote":
      return Banknote;
    default:
      return Wallet;
  }
}

export function CheckoutForm({
  locale,
  planCode,
  defaultBillingCycle,
  defaultCustomerName,
}: CheckoutFormProps) {
  const t = useTranslations("public.checkout.form");
  const [state, formAction, pending] = useActionState(submitCheckout, initialState);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(defaultBillingCycle);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]?.code ?? "cash");

  const plan = getPlanDefinition(planCode);
  const summary = useMemo(() => {
    const baseMonthly = plan.monthlyPrice;
    const finalAmount = getPlanPrice(planCode, billingCycle);
    const yearlySavings = getYearlySavings(planCode);
    return { baseMonthly, finalAmount, yearlySavings };
  }, [billingCycle, plan.monthlyPrice, planCode]);

  return (
    <form action={formAction} className="grid gap-5 lg:grid-cols-[1fr,340px]">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="plan" value={planCode} />
      <input type="hidden" name="billingCycle" value={billingCycle} />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />

      <section className="cf-surface rounded-xl p-5">
        <h2 className="text-lg font-semibold">{t("customerSectionTitle")}</h2>
        <p className="mt-1 text-sm text-zinc-500">{t("customerSectionDescription")}</p>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium">{t("billingCycleLabel")}</p>
          <div className="inline-flex rounded-lg border border-border bg-card p-1 text-sm">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-md px-3 py-2 ${billingCycle === "monthly" ? "bg-emerald-600 text-white" : ""}`}
            >
              {t("billingCycle.monthly")}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`rounded-md px-3 py-2 ${billingCycle === "yearly" ? "bg-emerald-600 text-white" : ""}`}
            >
              {t("billingCycle.yearly")}
            </button>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-1 text-sm font-medium">{t("paymentMethodLabel")}</p>
          <p className="mb-2 text-xs text-zinc-500">{t("paymentMethodHint")}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PAYMENT_METHODS.map((method) => {
              const Icon = getMethodIcon(method.iconKey);
              const isSelected = paymentMethod === method.code;
              return (
                <button
                  key={method.code}
                  type="button"
                  onClick={() => setPaymentMethod(method.code)}
                  className={`rounded-lg border p-3 text-start transition ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800"
                  }`}
                >
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-emerald-600" />
                    {method.labelAr}
                  </p>
                  {method.descriptionAr ? (
                    <p className="mt-1 text-xs text-zinc-500">{method.descriptionAr}</p>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="customer-name" className="text-sm font-medium">
              {t("fields.customerName")}
            </label>
            <input
              id="customer-name"
              name="customerName"
              defaultValue={defaultCustomerName}
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="customer-phone" className="text-sm font-medium">
              {t("fields.customerPhone")}
            </label>
            <input
              id="customer-phone"
              name="customerPhone"
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="09xxxxxxxx"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label htmlFor="checkout-notes" className="text-sm font-medium">
              {t("fields.notes")}
            </label>
            <textarea
              id="checkout-notes"
              name="notes"
              rows={3}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </div>

        {state.error ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            <p className="font-semibold">{t("success.title")}</p>
            <p className="mt-1">{t("success.description")}</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>{t("success.plan")}: {state.success.planName}</li>
              <li>{t("success.method")}: {state.success.methodLabel}</li>
              <li className="flex flex-wrap items-center gap-1.5">
                {t("success.amount")}: <MoneyValue amount={state.success.chargedAmount} size="sm" />
              </li>
            </ul>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-5 inline-flex rounded-md bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {pending ? t("submitPending") : t("submit")}
        </button>
        <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-950 dark:text-zinc-300">
          <p>{t("notes.security")}</p>
          <p className="mt-1">{t("notes.review")}</p>
          <Link
            href="https://wa.me/218925340789?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D9%86%D8%A8%D9%8A%20%D9%86%D8%AC%D8%B1%D8%A8%20CafeFlow%20%D9%84%D9%84%D9%85%D9%82%D9%87%D9%89%20%D9%85%D8%AA%D8%A7%D8%B9%D9%8A"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex text-emerald-700 underline dark:text-emerald-300"
          >
            {t("notes.whatsapp")}
          </Link>
        </div>
      </section>

      <aside className="cf-surface rounded-xl p-5">
        <p className="text-sm font-semibold">{t("summary.title")}</p>
        <div className="mt-3 space-y-2 text-sm">
          <p className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-950">
            {t("summary.plan")}: <span className="font-semibold">{plan.name}</span>
          </p>
          <p className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-950">
            {t("summary.cycle")}: <span className="font-semibold">{billingCycle === "monthly" ? t("billingCycle.monthly") : t("billingCycle.yearlyShort")}</span>
          </p>
          <p className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-950">
            {t("summary.monthlyPrice")}:{" "}
            <span className="inline-flex items-center font-semibold">
              <MoneyValue amount={summary.baseMonthly} size="sm" />
            </span>
          </p>
          <p className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-950">
            {t("summary.savings")}:{" "}
            <span className="font-semibold">
              {billingCycle === "yearly" ? (
                <MoneyValue amount={summary.yearlySavings} size="sm" />
              ) : (
                <MoneyValue amount={0} size="sm" />
              )}
            </span>
          </p>
          <p className="rounded-lg bg-emerald-50 p-2 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
            {t("summary.total")}:{" "}
            <span className="inline-flex items-center font-semibold">
              <MoneyValue amount={summary.finalAmount} size="sm" />
            </span>
          </p>
          <p className="rounded-lg bg-zinc-50 p-2 text-xs text-zinc-500 dark:bg-zinc-950">
            {t("summary.trialHint", { days: formatArabicLatnInteger(14) })}
          </p>
        </div>
      </aside>
    </form>
  );
}
