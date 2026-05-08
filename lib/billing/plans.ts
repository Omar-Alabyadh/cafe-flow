export const BILLING_CURRENCY = "LYD";

export const BILLING_CYCLES = ["monthly", "yearly"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const PLAN_CODES = ["basic", "pro", "business"] as const;
export type PlanCode = (typeof PLAN_CODES)[number];

export type PlanDefinition = {
  code: PlanCode;
  name: string;
  nameAr: string;
  nameEn: string;
  monthlyPrice: number;
  branchLimit: number;
  staffLimit: number;
  branchLimitLabelAr: string;
  staffLimitLabelAr: string;
  featuresAr: string[];
  isRecommended?: boolean;
};

/**
 * Central plan catalog used by pricing and checkout UIs.
 * Keeping it in one place avoids duplicated numbers across pages.
 */
export const PLAN_DEFINITIONS: Record<PlanCode, PlanDefinition> = {
  basic: {
    code: "basic",
    name: "Basic",
    nameAr: "Basic",
    nameEn: "Basic",
    monthlyPrice: 49,
    branchLimit: 1,
    staffLimit: 3,
    branchLimitLabelAr: "Branches: 1",
    staffLimitLabelAr: "Staff: 3",
    featuresAr: [
      "Manage daily cafe orders",
      "Basic inventory and recipes",
      "Clear operational reports",
    ],
  },
  pro: {
    code: "pro",
    name: "Pro",
    nameAr: "Pro",
    nameEn: "Pro",
    monthlyPrice: 99,
    branchLimit: 3,
    staffLimit: 10,
    branchLimitLabelAr: "Branches: 3",
    staffLimitLabelAr: "Staff: 10",
    featuresAr: [
      "All Basic features",
      "Operate multiple branches with ease",
      "Deeper inventory and sales tracking",
    ],
    isRecommended: true,
  },
  business: {
    code: "business",
    name: "Business",
    nameAr: "Business",
    nameEn: "Business",
    monthlyPrice: 199,
    branchLimit: 9999,
    staffLimit: 9999,
    branchLimitLabelAr: "Branches: Unlimited",
    staffLimitLabelAr: "Staff: Unlimited",
    featuresAr: [
      "All Pro features",
      "High limits for scaling",
      "Ready for large cafe chains",
    ],
  },
};

export function getPlanDefinition(planCode: PlanCode): PlanDefinition {
  return PLAN_DEFINITIONS[planCode];
}
