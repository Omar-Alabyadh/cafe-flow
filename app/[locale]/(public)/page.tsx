import { LandingNavbar } from "@/components/public/landing/landing-navbar";
import { LandingPricing } from "@/components/public/landing/landing-pricing";
import {
  LandingDashboardShowcase,
  LandingFAQ,
  LandingFeaturesGrid,
  LandingFinalCta,
  LandingFooter,
  LandingHero,
  LandingInventoryIntel,
  LandingLocaleHighlight,
  LandingPricingIntro,
  LandingProblemSolution,
  LandingProductPreview,
  LandingWorkflow,
} from "@/components/public/landing/landing-page-sections";
import { readLandingContent } from "@/lib/platform/content/landing-content-store";

export default async function PublicHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const cms = await readLandingContent();
  const content = locale === "ar" ? cms.ar : cms.en;

  return (
    <div className="cf-landing-bg relative min-h-full overflow-x-hidden scroll-smooth bg-background">
      <div className="cf-landing-grid pointer-events-none absolute inset-0 -z-10 opacity-40 dark:opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-88 bg-linear-to-b from-primary/10 to-transparent dark:from-primary/14" />
      <LandingNavbar locale={locale} />
      <main id="main-content">
        <LandingHero locale={locale} cms={content} />
        <LandingProductPreview />
        <LandingProblemSolution />
        <LandingFeaturesGrid cms={content} />
        <LandingWorkflow />
        <LandingDashboardShowcase />
        <LandingInventoryIntel />
        <LandingLocaleHighlight />
        <LandingPricingIntro cms={content} />
        <LandingPricing locale={locale} />
        <LandingFAQ cms={content} />
        <LandingFinalCta locale={locale} cms={content} />
      </main>
      <LandingFooter locale={locale} />
    </div>
  );
}
