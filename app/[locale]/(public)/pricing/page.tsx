import Link from "next/link";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { PricingPlans } from "@/components/billing/pricing-plans";
import { CtaSupportMicrocopy } from "@/components/public/cta-support-microcopy";
import { formatArabicLatnInteger } from "@/lib/format/numbers";
import { getTranslations } from "next-intl/server";

type PageProps = { params: Promise<{ locale: string }> };

export default async function PricingPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("public.pricingPage");
  const trialDays = formatArabicLatnInteger(14);
  const yearlyMonths = formatArabicLatnInteger(12);
  const yearlyPayMonths = formatArabicLatnInteger(10);

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <BrandLockup compact />
        <Link href={`/${locale}/`} className="text-sm underline">
          {t("backHome")}
        </Link>
      </div>
      <SectionHeader
        title={t("title")}
        description={t("description", { trialDays })}
      />
      <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
        {t("promo", { yearlyMonths, yearlyPayMonths })}
      </div>
      <p className="mb-1 text-xs text-zinc-500">{t("trialLine", { trialDays })}</p>
      <p className="mb-4 text-xs text-zinc-500">{t("activationLine")}</p>

      <PricingPlans locale={locale} />
      <CtaSupportMicrocopy className="mt-4" />
    </PageContainer>
  );
}

