import type {
  PaymentIntentInput,
  PaymentIntentResult,
  PaymentProviderAdapter,
  VerifyPaymentResult,
} from "@/lib/payments/providers/types";

/**
 * Manual provider used in current phase.
 * This keeps checkout functional now and leaves clean extension points for ezonepay later.
 */
export class ManualPaymentProvider implements PaymentProviderAdapter {
  async createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    void input;
    return {
      provider: "manual",
      status: "pending",
      externalReference: null,
    };
  }

  async verifyPayment(externalReference: string): Promise<VerifyPaymentResult> {
    void externalReference;
    return { status: "pending" };
  }

  mapProviderStatus(providerStatus: string): VerifyPaymentResult["status"] {
    if (providerStatus === "paid") return "paid";
    if (providerStatus === "failed") return "failed";
    if (providerStatus === "canceled") return "canceled";
    return "pending";
  }
}
