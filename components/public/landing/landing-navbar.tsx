"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useTranslations } from "next-intl";

type LandingNavbarProps = {
  locale: string;
};

const NAV_ANCHORS = [
  { href: "#features", key: "features" as const },
  { href: "#how-it-works", key: "howItWorks" as const },
  { href: "#pricing", key: "pricing" as const },
  { href: "#faq", key: "faq" as const },
];

export function LandingNavbar({ locale }: LandingNavbarProps) {
  const t = useTranslations("public.landing.nav");
  const tNav = useTranslations("public.nav");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200 ${
        scrolled
          ? "border-border/70 bg-background/85 shadow-[0_12px_36px_-18px_rgba(2,6,23,0.55)] backdrop-blur-2xl supports-backdrop-filter:bg-background/72"
          : "border-transparent bg-background/65 backdrop-blur-xl supports-backdrop-filter:bg-background/56"
      }`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-14 focus:z-60 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}/`} className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <BrandLockup compact />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t("mainNavAria")}>
          {NAV_ANCHORS.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-foreground"
            >
              {t(item.key)}
            </a>
          ))}
          <Link
            href={`/${locale}/terms`}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            {t("terms")}
          </Link>
        </nav>

        <div className="hidden flex-wrap items-center justify-end gap-2 lg:flex">
          <LocaleSwitcher locale={locale} />
          <ThemeToggle />
          <Link
            href={`/${locale}/sign-in`}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-foreground"
          >
            {tNav("signIn")}
          </Link>
          <Link
            href={`/${locale}/sign-up`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:opacity-95"
          >
            {tNav("startFree")}
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LocaleSwitcher locale={locale} />
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-card/90 p-2 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-muted"
            aria-expanded={open}
            aria-controls="landing-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            <span className="sr-only">{open ? t("closeMenu") : t("openMenu")}</span>
          </button>
        </div>
      </div>

      {open ? (
        <div id="landing-mobile-nav" className="border-t border-border bg-background/96 shadow-xl backdrop-blur-2xl lg:hidden">
          <div className="mx-auto flex max-h-[calc(100dvh-4rem)] max-w-7xl flex-col gap-1 overflow-y-auto px-4 py-5">
            {NAV_ANCHORS.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="rounded-xl px-4 py-3.5 text-base font-medium text-foreground transition hover:bg-primary/10"
                onClick={() => setOpen(false)}
              >
                {t(item.key)}
              </a>
            ))}
            <Link
              href={`/${locale}/terms`}
              className="rounded-xl px-4 py-3.5 text-base font-medium text-foreground transition hover:bg-primary/10"
              onClick={() => setOpen(false)}
            >
              {t("terms")}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="rounded-xl px-4 py-3.5 text-base font-medium text-foreground transition hover:bg-primary/10"
              onClick={() => setOpen(false)}
            >
              {tNav("pricing")}
            </Link>
            <div className="mt-2 border-t border-border pt-3">
              <ThemeToggle />
            </div>
            <Link
              href={`/${locale}/sign-in`}
              className="mt-2 rounded-xl border border-border bg-card px-4 py-3.5 text-center text-base font-semibold shadow-sm"
              onClick={() => setOpen(false)}
            >
              {tNav("signIn")}
            </Link>
            <Link
              href={`/${locale}/sign-up`}
              className="rounded-xl bg-primary px-4 py-3.5 text-center text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25"
              onClick={() => setOpen(false)}
            >
              {tNav("startFree")}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
