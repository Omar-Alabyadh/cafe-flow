export type PaymentMethodCode =
  | "cash"
  | "bank_card"
  | "edfa_li"
  | "mobi_cash"
  | "masrafi_pay"
  | "yusur_pay"
  | "yusur_qr"
  | "sadad"
  | "sahara_pay";

export type PaymentMethodDefinition = {
  code: PaymentMethodCode;
  labelAr: string;
  descriptionAr?: string;
  iconKey: string;
  isAvailable: boolean;
};

/**
 * Payment methods list requested by product/business requirements.
 * This config can later map directly to provider-specific adapters (e.g. ezonepay).
 */
export const PAYMENT_METHODS: PaymentMethodDefinition[] = [
  {
    code: "cash",
    labelAr: "Cash",
    descriptionAr: "A representative can visit you, or you can visit us to complete everything.",
    iconKey: "wallet",
    isAvailable: true,
  },
  {
    code: "bank_card",
    labelAr: "Bank Card",
    descriptionAr: "Enabled online",
    iconKey: "credit-card",
    isAvailable: true,
  },
  { code: "edfa_li", labelAr: "Edfa Li", iconKey: "smartphone", isAvailable: true },
  { code: "mobi_cash", labelAr: "Mobi Cash", iconKey: "smartphone", isAvailable: true },
  { code: "masrafi_pay", labelAr: "Masrafi Pay", iconKey: "building-2", isAvailable: true },
  { code: "yusur_pay", labelAr: "Yusur Pay", iconKey: "landmark", isAvailable: true },
  { code: "yusur_qr", labelAr: "Yusur Pay - QR", iconKey: "qr-code", isAvailable: true },
  { code: "sadad", labelAr: "Sadad", iconKey: "receipt", isAvailable: true },
  { code: "sahara_pay", labelAr: "Sahara Pay", iconKey: "banknote", isAvailable: true },
];

export function getPaymentMethodByCode(code: string): PaymentMethodDefinition | null {
  return PAYMENT_METHODS.find((method) => method.code === code) ?? null;
}
