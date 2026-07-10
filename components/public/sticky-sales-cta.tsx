"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CtaSupportMicrocopy } from "@/components/public/cta-support-microcopy";
import { useTranslations } from "next-intl";

type StickySalesCtaProps = {
  locale: string;
};

/**
 * Sticky conversion CTA.
 * It stays visible while scrolling without blocking the page aggressively.
 */
export function StickySalesCta({ locale }: StickySalesCtaProps) {
  const t = useTranslations("public.stickyCta");
  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    let footerObserver: IntersectionObserver | null = null;
    const footer = document.querySelector("footer");

    const updateFromBottom = () => {
      const scrollBottom = window.scrollY + window.innerHeight;
      const pageBottom = document.documentElement.scrollHeight;
      const isAtBottom = pageBottom - scrollBottom <= 24;
      setShouldHide(isAtBottom);
    };

    updateFromBottom();
    window.addEventListener("scroll", updateFromBottom, { passive: true });
    window.addEventListener("resize", updateFromBottom);

    if (footer) {
      footerObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting) {
            setShouldHide(true);
            return;
          }
          updateFromBottom();
        },
        { threshold: 0.05 },
      );

      footerObserver.observe(footer);
    }

    return () => {
      window.removeEventListener("scroll", updateFromBottom);
      window.removeEventListener("resize", updateFromBottom);
      footerObserver?.disconnect();
    };
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-2 z-40 px-3 transition-all duration-300 sm:bottom-3 ${
        shouldHide ? "translate-y-2 opacity-0" : "translate-y-0 opacity-95"
      }`}
      aria-hidden={shouldHide}
    >
      <div className="pointer-events-auto mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card/92 p-3 shadow-[0_16px_40px_-20px_rgba(2,6,23,0.65)] backdrop-blur-xl max-[430px]:rounded-xl max-[430px]:p-2.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-muted-foreground max-[430px]:text-[11px]">
            {t("text")}
          </p>
          <Link
            href={`/${locale}/sign-up`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:-translate-y-0.5 hover:opacity-95 max-[430px]:py-2.5"
          >
            {t("button")}
          </Link>
        </div>
        <CtaSupportMicrocopy className="mt-2" />
      </div>
    </div>
  );
}
