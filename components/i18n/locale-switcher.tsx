"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

type LocaleSwitcherProps = {
  locale: string;
};

const LOCALE_COOKIE = "cafeflow_locale";

/**
 * Compact AR/EN switcher.
 * It preserves current route/query and stores explicit user preference in a cookie.
 */
export function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const t = useTranslations("common.localeSwitcher");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function switchLocale(nextLocale: "ar" | "en") {
    if (nextLocale === locale) return;
    const segments = pathname.split("/");
    if (segments.length > 1) {
      segments[1] = nextLocale;
    }
    const nextPath = segments.join("/") || `/${nextLocale}`;
    const qs = searchParams.toString();
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.replace(qs ? `${nextPath}?${qs}` : nextPath);
  }

  return (
    <div className="inline-flex items-center rounded-md border border-border bg-card p-0.5 text-xs">
      <button
        type="button"
        onClick={() => switchLocale("ar")}
        className={`rounded px-2 py-1 font-medium ${locale === "ar" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-zinc-700 dark:text-zinc-200"}`}
      >
        {t("arabic")}
      </button>
      <button
        type="button"
        onClick={() => switchLocale("en")}
        className={`rounded px-2 py-1 font-medium ${locale === "en" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-zinc-700 dark:text-zinc-200"}`}
      >
        {t("english")}
      </button>
    </div>
  );
}
