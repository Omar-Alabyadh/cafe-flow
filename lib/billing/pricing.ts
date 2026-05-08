import {
  type BillingCycle,
  type PlanCode,
  getPlanDefinition,
} from "@/lib/billing/plans";
import { formatLibyanDinar } from "@/lib/format/libyan-dinar";

/**
 * Yearly billing rule required by CafeFlow business team:
 * customer pays only 10 months and gets 12 months access.
 * This means yearly price = monthly price * 10.
 */
const YEARLY_BILLED_MONTHS = 10;
const YEARLY_ACCESS_MONTHS = 12;

export function getPlanPrice(planCode: PlanCode, billingCycle: BillingCycle): number {
  const monthlyPrice = getPlanDefinition(planCode).monthlyPrice;
  if (billingCycle === "yearly") {
    return monthlyPrice * YEARLY_BILLED_MONTHS;
  }
  return monthlyPrice;
}

export function getPlanDurationMonths(billingCycle: BillingCycle): number {
  if (billingCycle === "yearly") {
    return YEARLY_ACCESS_MONTHS;
  }
  return 1;
}

export function getYearlySavings(planCode: PlanCode): number {
  const monthlyPrice = getPlanDefinition(planCode).monthlyPrice;
  const fullYearWithoutDiscount = monthlyPrice * YEARLY_ACCESS_MONTHS;
  const yearlyDiscountedPrice = monthlyPrice * YEARLY_BILLED_MONTHS;
  return fullYearWithoutDiscount - yearlyDiscountedPrice;
}

/** Subscription and checkout amounts use the same Libyan Dinar display as the rest of the app. */
export function formatCurrency(amount: number, locale?: string): string {
  return formatLibyanDinar(amount, locale);
}

export {
  formatLibyanDinar,
  LIBYAN_DINAR_SUFFIX,
  LIBYAN_DINAR_SUFFIX_AR,
  LIBYAN_DINAR_SUFFIX_EN,
  libyanDinarTextDir,
} from "@/lib/format/libyan-dinar";

export function toPlanCode(value: string | null | undefined): PlanCode {
  if (value === "basic" || value === "pro" || value === "business") {
    return value;
  }
  return "pro";
}

export function toBillingCycle(value: string | null | undefined): BillingCycle {
  if (value === "monthly" || value === "yearly") {
    return value;
  }
  return "monthly";
}
