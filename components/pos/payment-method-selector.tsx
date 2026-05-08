"use client";

import { useTranslations } from "next-intl";

export type PosPaymentMode = "cash" | "banking";
export type PosBankingMethod =
  | "bank_card"
  | "edfa_li"
  | "mobi_cash"
  | "masrafi_pay"
  | "yusr_pay"
  | "yusr_pay_qr"
  | "sadad"
  | "sahara_pay";

type PaymentMethodSelectorProps = {
  mode: PosPaymentMode;
  selectedBankingMethod: PosBankingMethod;
  onModeChange: (mode: PosPaymentMode) => void;
  onBankingMethodChange: (method: PosBankingMethod) => void;
};

const BANKING_METHOD_OPTIONS: Array<{ value: PosBankingMethod; labelKey: string }> = [
  { value: "bank_card", labelKey: "bank_card" },
  { value: "edfa_li", labelKey: "edfa_li" },
  { value: "mobi_cash", labelKey: "mobi_cash" },
  { value: "masrafi_pay", labelKey: "masrafi_pay" },
  { value: "yusr_pay", labelKey: "yusr_pay" },
  { value: "yusr_pay_qr", labelKey: "yusr_pay_qr" },
  { value: "sadad", labelKey: "sadad" },
  { value: "sahara_pay", labelKey: "sahara_pay" },
];

/**
 * POS payment selector is intentionally local UI state in this phase.
 * Why:
 * - cashier needs clear payment intent before checkout.
 * - backend persistence can be added later without changing the UX contract.
 */
export function PaymentMethodSelector({
  mode,
  selectedBankingMethod,
  onModeChange,
  onBankingMethodChange,
}: PaymentMethodSelectorProps) {
  const t = useTranslations("pos.payment");
  const tBank = useTranslations("pos.payment.bankingMethods");

  return (
    <section className="space-y-2 rounded-md border border-border bg-muted/50 p-2">
      <p className="text-xs font-extrabold text-zinc-700 dark:text-zinc-200">{t("title")}</p>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => onModeChange("cash")}
          className={`flex min-h-8 items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-[11px] font-bold transition ${
            mode === "cash"
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-border bg-card text-foreground hover:bg-muted"
          }`}
        >
          <span aria-hidden>💵</span>
          <span>{t("cash")}</span>
        </button>
        <button
          type="button"
          onClick={() => onModeChange("banking")}
          className={`flex min-h-8 items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-[11px] font-bold transition ${
            mode === "banking"
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-border bg-card text-foreground hover:bg-muted"
          }`}
        >
          <span aria-hidden>🏦</span>
          <span>{t("banking")}</span>
        </button>
      </div>

      {mode === "banking" ? (
        <div className="grid grid-cols-2 gap-1.5">
          {BANKING_METHOD_OPTIONS.map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => onBankingMethodChange(method.value)}
              className={`min-h-7 rounded-md border px-2 py-1 text-[11px] font-bold transition ${
                selectedBankingMethod === method.value
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {tBank(method.labelKey)}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
