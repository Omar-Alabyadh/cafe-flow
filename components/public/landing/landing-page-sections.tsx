import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Languages,
  MoonStar,
  Package,
  ShoppingCart,
  Users,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { CtaSupportMicrocopy } from "@/components/public/cta-support-microcopy";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { FadeIn } from "@/components/ui/motion/fade-in";
import type { LandingLocaleContent } from "@/lib/platform/content/landing-content-store";

type SectionsProps = {
  locale: string;
  cms: LandingLocaleContent;
};

export async function LandingHero({ locale, cms }: SectionsProps) {
  const t = await getTranslations("public.landing.hero");
  const th = await getTranslations("public.home.highlights");
  const tNav = await getTranslations("public.nav");
  const tWa = await getTranslations("public.whatsapp");
  const waHref = `https://wa.me/${tWa("phoneDigits")}?text=${encodeURIComponent(tWa("prefilledMessage"))}`;
  const highlights = [th("noCard"), th("activation"), th("support")];

  return (
    <FadeIn delay={0.01}>
      <section
        className="relative overflow-hidden px-4 pb-22 pt-14 sm:px-6 sm:pb-30 sm:pt-18 lg:px-8 lg:pb-36 lg:pt-26 2xl:pb-40 2xl:pt-30"
        aria-labelledby="landing-hero-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,color-mix(in_oklab,var(--primary)_30%,transparent),transparent)]"
          aria-hidden
        />
        <div className="pointer-events-none absolute -inset-x-24 -top-16 -z-10 h-80 rounded-full bg-primary/12 blur-3xl dark:bg-primary/18" />
        <div className="pointer-events-none absolute -bottom-24 -inset-e-24 -z-10 h-72 w-72 rounded-full bg-amber-400/12 blur-3xl dark:bg-amber-300/10" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16 2xl:gap-24">
          <div className="min-w-0">
            <p className="inline-flex items-center rounded-full border border-primary/25 bg-card/75 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur-md">
              {cms.heroBadge}
            </p>
            <h1 id="landing-hero-heading" className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.45rem] lg:leading-[1.04] 2xl:text-[3.9rem]">
              {cms.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{cms.heroDescription}</p>

            <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-3 max-[430px]:grid-cols-1">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-3 max-[430px]:gap-2.5">
              <Link
                href={`/${locale}/sign-up`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_14px_34px_-10px_color-mix(in_oklab,var(--primary)_60%,transparent)] transition hover:-translate-y-0.5 hover:opacity-95 max-[430px]:w-full"
              >
                {cms.primaryCta}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
              </Link>
              <Link
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-card/90 px-5 py-3.5 text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-muted max-[430px]:w-full"
              >
                {t("secondaryCta")}
              </Link>
              <Link
                href={`/${locale}/sign-in`}
                className="inline-flex min-h-11 items-center text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {tNav("signIn")}
              </Link>
            </div>
            <CtaSupportMicrocopy className="mt-4" />

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-border/80 pt-8 max-[430px]:grid-cols-1 max-[430px]:gap-3">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">{t("metricOrdersLabel")}</dt>
                <dd className="mt-1 text-2xl font-bold tracking-tight text-foreground">{t("metricOrdersValue")}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">{t("metricStockLabel")}</dt>
                <dd className="mt-1 text-2xl font-bold tracking-tight text-foreground">{t("metricStockValue")}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">{t("metricBranchesLabel")}</dt>
                <dd className="mt-1 text-2xl font-bold tracking-tight text-foreground">{t("metricBranchesValue")}</dd>
              </div>
            </dl>
          </div>

          <HeroVisual />
        </div>
      </section>
    </FadeIn>
  );
}

async function HeroVisual() {
  const t = await getTranslations("public.landing.hero");
  const tp = await getTranslations("public.landing.preview");

  return (
    <div
      className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none 2xl:-me-6 2xl:scale-[1.06]"
      aria-label={t("mockupAriaLabel")}
      role="img"
    >
      <div className="cf-surface relative rounded-3xl border-primary/20 bg-card/75 p-4 shadow-[0_30px_70px_-28px_rgba(2,6,23,0.65)] backdrop-blur-sm sm:p-6">
        <div className="pointer-events-none absolute -inset-px rounded-3xl bg-linear-to-br from-primary/20 via-transparent to-amber-400/20 opacity-70" />
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold text-primary">{t("pillPos")}</span>
          <span className="rounded-full bg-accent/20 px-3 py-1 text-[11px] font-semibold text-amber-900 dark:text-amber-100">{t("pillInventory")}</span>
          <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">{t("pillStaff")}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="cf-hover-card rounded-2xl border border-border bg-background/80 p-4 shadow-inner backdrop-blur-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{tp("cardDashTitle")}</p>
            <p className="mt-2 text-sm font-semibold text-foreground">{tp("cardDashBody")}</p>
            <div className="mt-4 h-16 rounded-xl bg-linear-to-r from-primary/30 via-primary/10 to-transparent" />
          </div>
          <div className="cf-hover-card rounded-2xl border border-border bg-background/80 p-4 shadow-inner backdrop-blur-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{tp("cardPosTitle")}</p>
            <p className="mt-2 text-sm text-foreground">{tp("cardPosBody")}</p>
            <p className="mt-4 inline-flex rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">{t("completeSale")}</p>
          </div>
          <div className="cf-hover-card rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 dark:bg-amber-500/15">
            <p className="text-[11px] font-semibold text-amber-900 dark:text-amber-100">{tp("cardLowStockTitle")}</p>
            <p className="mt-1 text-sm text-amber-950 dark:text-amber-50">{tp("cardLowStockBody")}</p>
          </div>
          <div className="cf-hover-card rounded-2xl border border-border bg-background/80 p-4 shadow-inner backdrop-blur-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{tp("cardSalesTitle")}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{tp("cardSalesValue")}</p>
          </div>
        </div>
        <p className="pointer-events-none absolute -bottom-3 inset-s-6 max-w-48 rounded-xl border border-border bg-card px-3 py-2 text-[11px] font-medium text-foreground shadow-lg">
          {t("floatingAlert")}
        </p>
      </div>
    </div>
  );
}

export async function LandingProductPreview() {
  const t = await getTranslations("public.landing.preview");

  const cards = [
    { title: t("cardInventoryTitle"), body: t("cardInventoryBody"), tone: "muted" as const },
    { title: t("cardStaffTitle"), body: t("cardStaffBody"), tone: "muted" as const },
    { title: t("cardBranchesTitle"), body: t("cardBranchesBody"), tone: "accent" as const },
  ];

  return (
    <FadeIn delay={0.04}>
      <section className="relative border-y border-border bg-muted/35 px-4 py-22 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-primary/4 to-transparent" />
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">{t("sectionTitle")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">{t("sectionSubtitle")}</p>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {cards.map((card) => (
              <article
                key={card.title}
                className={`cf-surface cf-hover-card rounded-2xl p-6 ${
                  card.tone === "accent" ? "border-primary/35 bg-primary/6" : ""
                }`}
              >
                <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

export async function LandingProblemSolution() {
  const t = await getTranslations("public.landing.problemSolution");
  const before = [t("before1"), t("before2"), t("before3"), t("before4")];
  const after = [t("after1"), t("after2"), t("after3"), t("after4")];

  return (
    <FadeIn delay={0.07}>
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">{t("sectionTitle")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">{t("sectionSubtitle")}</p>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <div className="cf-surface cf-hover-card rounded-2xl border-red-500/30 bg-red-500/5 p-6 md:p-8 dark:border-red-400/35 dark:bg-red-500/10">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <XCircle className="h-5 w-5" aria-hidden />
                <h3 className="text-lg font-semibold">{t("beforeTitle")}</h3>
              </div>
              <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
                {before.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500/70 dark:bg-red-400/70" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="cf-surface cf-hover-card rounded-2xl border-primary/35 bg-primary/6 p-6 md:p-8">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-5 w-5" aria-hidden />
                <h3 className="text-lg font-semibold">{t("afterTitle")}</h3>
              </div>
              <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
                {after.map((line) => (
                  <li key={line} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

const FEATURE_ICONS = [
  ShoppingCart,
  ClipboardList,
  Package,
  UtensilsCrossed,
  Users,
  Building2,
  BarChart3,
  CreditCard,
  Languages,
  MoonStar,
] as const;

export async function LandingFeaturesGrid({ cms }: { cms: LandingLocaleContent }) {
  const t = await getTranslations("public.landing.features");
  const keys = [
    ["posTitle", "posDesc"],
    ["ordersTitle", "ordersDesc"],
    ["inventoryTitle", "inventoryDesc"],
    ["recipesTitle", "recipesDesc"],
    ["staffTitle", "staffDesc"],
    ["branchesTitle", "branchesDesc"],
    ["reportsTitle", "reportsDesc"],
    ["subscriptionTitle", "subscriptionDesc"],
    ["bilingualTitle", "bilingualDesc"],
    ["darkModeTitle", "darkModeDesc"],
  ] as const;

  return (
    <FadeIn delay={0.09}>
      <section id="features" className="scroll-mt-28 bg-muted/30 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-primary">{t("sectionSubtitle")}</p>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight md:text-4xl">{cms.featuresTitle}</h2>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {keys.map(([titleKey, descKey], i) => {
              const Icon = FEATURE_ICONS[i] ?? ShoppingCart;
              return (
                <article key={titleKey} className="cf-surface cf-hover-card group relative flex flex-col overflow-hidden rounded-2xl p-5">
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/7 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="inline-flex rounded-xl bg-primary/12 p-2.5 text-primary shadow-sm">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{t(titleKey)}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{t(descKey)}</p>
                  <div className="mt-4 h-1 w-10 rounded-full bg-linear-to-r from-primary to-accent opacity-80" aria-hidden />
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

export async function LandingWorkflow() {
  const t = await getTranslations("public.landing.workflow");
  const steps = [
    { title: t("step1Title"), desc: t("step1Desc") },
    { title: t("step2Title"), desc: t("step2Desc") },
    { title: t("step3Title"), desc: t("step3Desc") },
    { title: t("step4Title"), desc: t("step4Desc") },
    { title: t("step5Title"), desc: t("step5Desc") },
  ];

  return (
    <FadeIn delay={0.11}>
      <section id="how-it-works" className="scroll-mt-28 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">{t("sectionTitle")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">{t("sectionSubtitle")}</p>
          <ol className="mt-14 grid gap-6 md:grid-cols-5">
            {steps.map((step, idx) => (
              <li key={step.title} className="relative cf-surface cf-hover-card rounded-2xl p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {idx + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </FadeIn>
  );
}

export async function LandingDashboardShowcase() {
  const t = await getTranslations("public.landing.dashboardShowcase");

  return (
    <FadeIn delay={0.13}>
      <section className="border-y border-border bg-muted/35 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">{t("sectionTitle")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">{t("sectionSubtitle")}</p>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            <div className="cf-surface cf-hover-card rounded-2xl p-6 lg:col-span-2">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("salesToday")}</p>
                  <p className="mt-1 text-4xl font-bold tracking-tight text-foreground">{t("salesTodayValue")}</p>
                </div>
                <div className="text-end">
                  <p className="text-sm font-medium text-muted-foreground">{t("ordersToday")}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{t("ordersTodayValue")}</p>
                </div>
              </div>
              <div
                className="mt-8 h-40 rounded-xl bg-linear-to-t from-primary/25 via-primary/10 to-transparent"
                role="img"
                aria-label={t("chartAria")}
              />
            </div>
            <div className="grid gap-4">
              <div className="cf-surface cf-hover-card rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("lowStock")}</p>
                <p className="mt-2 text-lg font-semibold text-red-600 dark:text-red-400">{t("lowStockValue")}</p>
              </div>
              <div className="cf-surface cf-hover-card rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("topProducts")}</p>
                <ul className="mt-3 space-y-2 text-sm text-foreground">
                  <li className="flex justify-between gap-2">
                    <span>{t("product1")}</span>
                    <span className="text-muted-foreground">{t("product1Percent")}</span>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span>{t("product2")}</span>
                    <span className="text-muted-foreground">{t("product2Percent")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="cf-surface cf-hover-card rounded-2xl p-6">
              <p className="text-sm font-semibold text-foreground">{t("branchesTitle")}</p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                  {t("branchMain")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />
                  {t("branchSatellite")}
                </li>
              </ul>
            </div>
            <div className="cf-surface cf-hover-card rounded-2xl p-6">
              <p className="text-sm font-semibold text-foreground">{t("rolesTitle")}</p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>{t("roleOwner")}</li>
                <li>{t("roleCashier")}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

export async function LandingInventoryIntel() {
  const t = await getTranslations("public.landing.inventoryIntel");
  const blocks = [
    { title: t("point1Title"), desc: t("point1Desc") },
    { title: t("point2Title"), desc: t("point2Desc") },
    { title: t("point3Title"), desc: t("point3Desc") },
    { title: t("point4Title"), desc: t("point4Desc") },
  ];

  return (
    <FadeIn delay={0.15}>
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">{t("sectionTitle")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">{t("sectionSubtitle")}</p>
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {blocks.map((b) => (
              <article key={b.title} className="cf-surface cf-hover-card rounded-2xl p-6 md:p-8">
                <h3 className="text-lg font-semibold text-foreground">{b.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

export async function LandingLocaleHighlight() {
  const t = await getTranslations("public.landing.localeHighlight");

  return (
    <FadeIn delay={0.17}>
      <section className="border-y border-border bg-linear-to-br from-primary/12 via-background to-accent/10 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap justify-center gap-2">
            <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold">{t("badgeRtl")}</span>
            <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold">{t("badgeLtr")}</span>
            <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold">{t("badgeLocals")}</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight md:text-4xl">{t("sectionTitle")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">{t("sectionSubtitle")}</p>
          <ul className="mx-auto mt-10 max-w-3xl space-y-4 text-center text-sm text-muted-foreground md:text-base">
            <li className="cf-surface cf-hover-card rounded-2xl px-6 py-4">{t("point1")}</li>
            <li className="cf-surface cf-hover-card rounded-2xl px-6 py-4">{t("point2")}</li>
            <li className="cf-surface cf-hover-card rounded-2xl px-6 py-4">{t("point3")}</li>
          </ul>
        </div>
      </section>
    </FadeIn>
  );
}

export async function LandingPricingIntro({ cms }: { cms: LandingLocaleContent }) {
  const t = await getTranslations("public.landing.pricing");

  return (
    <FadeIn delay={0.19}>
      <div className="mx-auto max-w-7xl px-4 pt-16 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{t("sectionEyebrow")}</p>
        <p className="mx-auto mt-3 max-w-3xl text-lg text-muted-foreground">{cms.pricingIntro}</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm font-medium text-foreground">{t("trialBanner")}</p>
      </div>
    </FadeIn>
  );
}

export async function LandingFAQ({ cms }: { cms: LandingLocaleContent }) {
  const t = await getTranslations("public.landing.faq");
  const items = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
    { q: t("q5"), a: t("a5") },
    { q: t("q6"), a: t("a6") },
  ];

  return (
    <FadeIn delay={0.21}>
      <section id="faq" className="scroll-mt-28 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">{cms.faqTitle}</h2>
          <div className="mt-10 space-y-3">
            {items.map((item) => (
              <details
                key={item.q}
                className="group cf-surface cf-hover-card rounded-2xl border border-border/80 px-5 py-1 transition open:border-primary/35 open:bg-primary/5"
              >
                <summary className="cursor-pointer list-none py-4 font-semibold text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {item.q}
                    <span className="text-primary transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="border-t border-border pb-4 pt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

export async function LandingFinalCta({ locale, cms }: SectionsProps) {
  const t = await getTranslations("public.landing.finalCta");
  const tWa = await getTranslations("public.whatsapp");
  const tChip = await getTranslations("public.ctaSupport");
  const waHref = `https://wa.me/${tWa("phoneDigits")}?text=${encodeURIComponent(tWa("prefilledMessage"))}`;

  return (
    <FadeIn delay={0.23}>
      <section className="px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-4xl border border-border bg-linear-to-br from-zinc-900 via-zinc-950 to-zinc-900 px-6 py-14 text-center text-white shadow-2xl dark:from-zinc-100 dark:via-white dark:to-zinc-100 dark:text-zinc-950">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed opacity-90 md:text-base">{t("subtitle")}</p>
          <p className="mx-auto mt-4 max-w-xl text-sm font-medium opacity-95">{cms.contactText}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={`/${locale}/sign-up`}
              className="inline-flex min-h-11 items-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-950 shadow-lg transition hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
            >
              {t("primaryButton")}
            </Link>
            <Link
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 dark:border-zinc-300 dark:text-zinc-900 dark:hover:bg-zinc-900/10"
            >
              {t("secondaryButton")}
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-[11px] text-white/85 dark:text-zinc-700">
            <span className="rounded-full border border-white/20 bg-white/10 px-2 py-1 font-medium dark:border-zinc-900/15 dark:bg-zinc-900/8">
              {tChip("noCard")}
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-2 py-1 font-medium dark:border-zinc-900/15 dark:bg-zinc-900/8">
              {tChip("activation")}
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-2 py-1 font-medium dark:border-zinc-900/15 dark:bg-zinc-900/8">
              {tChip("whatsapp")}
            </span>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

export async function LandingFooter({ locale }: { locale: string }) {
  const t = await getTranslations("public.landing.footer");
  const tNav = await getTranslations("public.nav");
  const tCommon = await getTranslations("common");
  const tLandingNav = await getTranslations("public.landing.nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/20 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.25fr_1fr_1fr] md:gap-10">
        <div>
          <BrandLockup />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{t("blurb")}</p>
          <div className="mt-6 flex flex-wrap items-end gap-4">
            <LocaleSwitcher locale={locale} />
            <ThemeToggle />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{t("columnProduct")}</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <a href="#features" className="rounded px-1 py-0.5 transition hover:bg-muted hover:text-foreground hover:underline">
                {tLandingNav("features")}
              </a>
            </li>
            <li>
              <a href="#pricing" className="rounded px-1 py-0.5 transition hover:bg-muted hover:text-foreground hover:underline">
                {tLandingNav("pricing")}
              </a>
            </li>
            <li>
              <Link href={`/${locale}/pricing`} className="rounded px-1 py-0.5 transition hover:bg-muted hover:text-foreground hover:underline">
                {tNav("pricing")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{t("columnLegal")}</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <Link href={`/${locale}/terms`} className="rounded px-1 py-0.5 transition hover:bg-muted hover:text-foreground hover:underline">
                {tNav("terms")}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/sign-in`} className="rounded px-1 py-0.5 transition hover:bg-muted hover:text-foreground hover:underline">
                {tNav("signIn")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl border-t border-border pt-8 text-center text-xs text-muted-foreground">
        {t("copyright", { year: String(year), brand: tCommon("appName"), rights: t("rights") })}
      </p>
    </footer>
  );
}
