import { BrandLockup } from "@/components/brand/brand-lockup";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { CtaSupportMicrocopy } from "@/components/public/cta-support-microcopy";
import { FadeIn } from "@/components/ui/motion/fade-in";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { readLandingContent } from "@/lib/platform/content/landing-content-store";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function PublicHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  const tNav = await getTranslations("public.nav");
  const tHome = await getTranslations("public.home");
  const tWhatsApp = await getTranslations("public.whatsapp");

  const cms = await readLandingContent();
  const content = isArabic ? cms.ar : cms.en;

  const highlights = [
    tHome("highlights.noCard"),
    tHome("highlights.activation"),
    tHome("highlights.support"),
  ];

  return (
    <div className="min-h-full bg-linear-to-b from-muted/50 to-background">
      <PageContainer>
        <FadeIn>
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/85 p-4 backdrop-blur">
            <BrandLockup />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <LocaleSwitcher locale={locale} />
              <Link href={`/${locale}/pricing`} className="rounded-md px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">{tNav("pricing")}</Link>
              <Link href={`/${locale}/terms`} className="rounded-md px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">{tNav("terms")}</Link>
              <Link href={`/${locale}/sign-in`} className="rounded-md px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">{tNav("signIn")}</Link>
              <Link href={`/${locale}/sign-up`} className="rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-500">{tNav("startFree")}</Link>
            </div>
          </header>
        </FadeIn>

        <FadeIn delay={0.05}>
          <section className="cf-surface rounded-xl p-6 md:p-10">
            <p className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
              {content.heroBadge}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">{content.heroTitle}</h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400 md:text-base">{content.heroDescription}</p>

            <div className="mt-4 grid max-w-3xl gap-2 text-sm text-zinc-600 dark:text-zinc-400 sm:grid-cols-3">
              {highlights.map((item) => (
                <p key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item}
                </p>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/sign-up`}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
              >
                {content.primaryCta}
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link
                href="https://wa.me/218925340789"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-md border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
              >
                {tWhatsApp("button")}
              </Link>
            </div>
            <CtaSupportMicrocopy />
          </section>
        </FadeIn>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="cf-surface rounded-xl p-6">
            <h2 className="text-xl font-semibold">{content.featuresTitle}</h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>{tHome("features.line1")}</li>
              <li>{tHome("features.line2")}</li>
              <li>{tHome("features.line3")}</li>
            </ul>
          </div>
          <div className="cf-surface rounded-xl p-6">
            <h2 className="text-xl font-semibold">{tHome("pricingBlock.title")}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{content.pricingIntro}</p>
            <Link
              href={`/${locale}/pricing`}
              className="mt-4 inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {tHome("pricingBlock.cta")}
            </Link>
          </div>
        </section>

        <section className="mt-8 cf-surface rounded-xl p-6">
          <h2 className="text-xl font-semibold">{content.faqTitle}</h2>
          <div className="mt-3 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <p>{tHome("faq.line1")}</p>
            <p>{tHome("faq.line2")}</p>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-zinc-200 bg-zinc-900 p-6 text-white dark:border-zinc-800 dark:bg-zinc-100 dark:text-zinc-900">
          <h2 className="text-xl font-semibold">{tHome("finalCta.title")}</h2>
          <p className="mt-2 text-sm opacity-90">{content.contactText}</p>
          <Link
            href={`/${locale}/sign-up`}
            className="mt-4 inline-flex rounded-md bg-card px-4 py-2 text-sm font-medium text-card-foreground shadow-sm transition hover:bg-muted"
          >
            {tHome("finalCta.button")}
          </Link>
          <CtaSupportMicrocopy className="text-zinc-300 dark:text-zinc-700" />
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border py-6 text-sm text-muted-foreground">
          <BrandLockup compact />
          <div className="flex gap-4">
            <Link href={`/${locale}/pricing`} className="underline">{tNav("pricing")}</Link>
            <Link href={`/${locale}/terms`} className="underline">{tNav("terms")}</Link>
            <Link href={`/${locale}/sign-in`} className="underline">{tNav("signIn")}</Link>
          </div>
        </footer>
      </PageContainer>
    </div>
  );
}
