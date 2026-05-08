import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { EmptyState } from "@/components/ui/foundations/empty-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnerBusinessIdForUser } from "@/lib/business/current-business";
import { type BillingCycle, type PlanCode } from "@/lib/billing/plans";
import { toBillingCycle, toPlanCode } from "@/lib/billing/pricing";
import { CheckoutForm } from "./checkout-form";
import { getTranslations } from "next-intl/server";

type CheckoutPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ plan?: string; billing?: string }>;
};

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { locale } = await params;
  const t = await getTranslations("public.checkout");
  const query = await searchParams;
  const selectedPlan: PlanCode = toPlanCode(query.plan);
  const selectedBilling: BillingCycle = toBillingCycle(query.billing);

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  const businessId = await getOwnerBusinessIdForUser(user.id);
  if (!businessId) {
    return (
      <PageContainer>
        <SectionHeader
          title={t("missingBusiness.title")}
          description={t("missingBusiness.description")}
        />
        <EmptyState
          title={t("missingBusiness.emptyTitle")}
          description={t("missingBusiness.emptyDescription")}
          action={
            <Link
              href={`/${locale}/dashboard/business`}
              className="inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              {t("missingBusiness.goToBusiness")}
            </Link>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <BrandLockup compact />
        <Link href={`/${locale}/pricing`} className="text-sm underline">
          {t("backToPricing")}
        </Link>
      </div>

      <SectionHeader
        title={t("title")}
        description={t("description")}
      />
      <div className="mb-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
        {t("promo")}
      </div>
      <p className="mb-1 text-xs text-zinc-500">{t("trialLine")}</p>
      <p className="mb-4 text-xs text-zinc-500">{t("activationLine")}</p>
      <div className="mb-5 grid gap-2 sm:grid-cols-3">
        <p className="rounded-lg bg-zinc-100 p-2 text-center text-xs font-medium dark:bg-zinc-800">{t("chips.secure")}</p>
        <p className="rounded-lg bg-zinc-100 p-2 text-center text-xs font-medium dark:bg-zinc-800">{t("chips.fast")}</p>
        <p className="rounded-lg bg-zinc-100 p-2 text-center text-xs font-medium dark:bg-zinc-800">{t("chips.support")}</p>
      </div>

      <CheckoutForm
        locale={locale}
        planCode={selectedPlan}
        defaultBillingCycle={selectedBilling}
        defaultCustomerName={user.fullName}
      />
    </PageContainer>
  );
}
