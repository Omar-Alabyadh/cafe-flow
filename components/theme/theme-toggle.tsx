"use client";

import { useEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

const OPTIONS = ["light", "dark", "system"] as const;

type ThemeOption = (typeof OPTIONS)[number];

/**
 * Theme selector: light / dark / system with icons.
 * Defers rendering until mounted so `next-themes` matches the server HTML and avoids hydration warnings.
 */
export function ThemeToggle() {
  const t = useTranslations("common.theme");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const current: ThemeOption =
    theme === "light" || theme === "dark" || theme === "system" ? theme : "system";

  if (!mounted) {
    return (
      <div
        className="inline-flex h-8 w-30 animate-pulse rounded-md border border-border bg-muted"
        aria-hidden
      />
    );
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <span className="text-[10px] font-medium text-muted-foreground">{t("label")}</span>
      <div
        className="inline-flex items-center rounded-md border border-border bg-card p-0.5 text-xs shadow-sm"
        role="group"
        aria-label={t("label")}
      >
        {OPTIONS.map((option) => {
          const active = current === option;
          const icon =
            option === "light" ? (
              <Sun className="h-3.5 w-3.5" aria-hidden />
            ) : option === "dark" ? (
              <Moon className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Laptop className="h-3.5 w-3.5" aria-hidden />
            );
          return (
            <button
              key={option}
              type="button"
              onClick={() => setTheme(option)}
              title={t(option)}
              className={`inline-flex items-center gap-1 rounded px-2 py-1 font-medium transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {icon}
              <span className="hidden sm:inline">{t(option)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
