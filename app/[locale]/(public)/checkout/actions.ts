"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { getOwnerBusinessIdForUser } from "@/lib/business/current-business";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import { getPlanDefinition, type BillingCycle, type PlanCode } from "@/lib/billing/plans";
import { getPlanDurationMonths, getPlanPrice, toBillingCycle, toPlanCode } from "@/lib/billing/pricing";
import { getPaymentMethodByCode } from "@/lib/payments/payment-methods";
import { ManualPaymentProvider } from "@/lib/payments/providers/manual-provider";
import { revalidateDashboardHome } from "@/lib/cache/revalidate-tenant-ui";
import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type CheckoutState = {
  error: string | null;
  success: {
    planName: string;
    chargedAmount: number;
    methodLabel: string;
  } | null;
};

const initialState: CheckoutState = {
  error: null,
  success: null,
};

function toPaymentMethodEnum(methodCode: string): PaymentMethod | null {
  switch (methodCode) {
    case "cash":
      return PaymentMethod.CASH;
    case "bank_card":
      return PaymentMethod.BANK_CARD;
    case "edfa_li":
      return PaymentMethod.EDFA_LI;
    case "mobi_cash":
      return PaymentMethod.MOBI_CASH;
    case "masrafi_pay":
      return PaymentMethod.MASRAFI_PAY;
    case "yusur_pay":
      return PaymentMethod.YUSUR_PAY;
    case "yusur_qr":
      return PaymentMethod.YUSUR_QR;
    case "sadad":
      return PaymentMethod.SADAD;
    case "sahara_pay":
      return PaymentMethod.SAHARA_PAY;
    default:
      return null;
  }
}

/**
 * Checkout submission flow.
 * We intentionally use a trial-first strategy:
 * - create TRIALING subscription (14 days),
 * - store intended paid plan/cycle/amount,
 * - create manual PaymentRequest in pending state.
 * This keeps onboarding smooth while payment processing remains manual for now.
 */
export async function submitCheckout(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  const planCode: PlanCode = toPlanCode(String(formData.get("plan") ?? ""));
  const billingCycle: BillingCycle = toBillingCycle(String(formData.get("billingCycle") ?? ""));
  const paymentMethodCode = String(formData.get("paymentMethod") ?? "");
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = notesRaw.length > 0 ? notesRaw : null;

  if (customerName.length < 2) {
    return { ...initialState, error: t("checkout.customerNameShort") };
  }
  if (customerPhone.length < 7) {
    return { ...initialState, error: t("checkout.customerPhoneShort") };
  }

  const paymentMethod = getPaymentMethodByCode(paymentMethodCode);
  const paymentMethodEnum = toPaymentMethodEnum(paymentMethodCode);
  if (!paymentMethod || !paymentMethodEnum) {
    return { ...initialState, error: t("checkout.invalidPaymentMethod") };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ...initialState, error: t("checkout.mustSignIn") };
  }

  const businessId = await getOwnerBusinessIdForUser(user.id);
  if (!businessId) {
    return { ...initialState, error: t("checkout.noBusinessForUser") };
  }

  const plan = getPlanDefinition(planCode);
  const chargedAmount = getPlanPrice(planCode, billingCycle);
  const durationMonths = getPlanDurationMonths(billingCycle);
  const monthlyPrice = plan.monthlyPrice;
  const startsAt = new Date();
  const trialEndsAt = new Date(startsAt.getTime() + 14 * 24 * 60 * 60 * 1000);
  const endsAt = new Date(startsAt);
  endsAt.setMonth(endsAt.getMonth() + durationMonths);

  const provider = new ManualPaymentProvider();
  const paymentIntent = await provider.createPaymentIntent({
    amount: chargedAmount,
    currency: "LYD",
    method: paymentMethod.code,
    customerName,
    customerPhone,
    notes,
  });

  await prisma.$transaction(async (tx) => {
    const persistedPlan = await tx.plan.upsert({
      where: { code: plan.code },
      update: {
        nameAr: plan.nameAr,
        nameEn: plan.nameEn,
        price: plan.monthlyPrice,
        branchLimit: plan.branchLimit,
        staffLimit: plan.staffLimit,
        isActive: true,
      },
      create: {
        code: plan.code,
        nameAr: plan.nameAr,
        nameEn: plan.nameEn,
        price: plan.monthlyPrice,
        branchLimit: plan.branchLimit,
        staffLimit: plan.staffLimit,
        isActive: true,
      },
    });

    const subscription = await tx.subscription.create({
      data: {
        businessId,
        planId: persistedPlan.id,
        status: "TRIALING",
        billingCycle: billingCycle === "yearly" ? "YEARLY" : "MONTHLY",
        monthlyPrice,
        chargedAmount,
        currency: "LYD",
        startsAt,
        trialEndsAt,
        endsAt,
      },
    });

    await tx.paymentRequest.create({
      data: {
        subscriptionId: subscription.id,
        paymentMethod: paymentMethodEnum,
        amount: chargedAmount,
        currency: "LYD",
        status: "PENDING",
        provider: paymentIntent.provider === "manual" ? "MANUAL" : "EZONEPAY",
        externalReference: paymentIntent.externalReference,
        customerName,
        customerPhone,
        notes,
      },
    });
  });

  revalidateDashboardHome(locale);
  revalidatePath(`/${locale}/dashboard/business`, "page");
  revalidatePath(`/${locale}/dashboard/platform`, "page");
  revalidatePath(`/${locale}/checkout`, "page");

  return {
    error: null,
    success: {
      planName: plan.name,
      chargedAmount,
      methodLabel: paymentMethod.labelAr,
    },
  };
}
