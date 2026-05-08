import type { PaymentMethodCode } from "@/lib/payments/payment-methods";

export type PaymentIntentInput = {
  amount: number;
  currency: string;
  method: PaymentMethodCode;
  customerName: string;
  customerPhone: string;
  notes?: string | null;
};

export type PaymentIntentResult = {
  provider: "manual" | "ezonepay";
  status: "pending" | "requires_action";
  externalReference: string | null;
};

export type VerifyPaymentResult = {
  status: "pending" | "paid" | "failed" | "canceled";
};

/**
 * Payment provider contract.
 * This is intentionally prepared for future ezonepay integration.
 */
export interface PaymentProviderAdapter {
  createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  verifyPayment(externalReference: string): Promise<VerifyPaymentResult>;
  mapProviderStatus(providerStatus: string): VerifyPaymentResult["status"];
}
