"use client";

import { Coffee } from "lucide-react";
import { useTranslations } from "next-intl";

type BrandLockupProps = {
  compact?: boolean;
};

export function BrandLockup({ compact = false }: BrandLockupProps) {
  const t = useTranslations("common");

  return (
    <div className="flex items-center gap-2">
      <div className="rounded-lg bg-emerald-600 p-2 text-white shadow-sm dark:bg-emerald-500">
        <Coffee className="h-4 w-4" aria-hidden />
      </div>
      <div>
        <p className={`font-semibold leading-none ${compact ? "text-sm" : "text-base"}`}>{t("appName")}</p>
        <p className="text-xs text-muted-foreground">{t("brandSubtitle")}</p>
      </div>
    </div>
  );
}
