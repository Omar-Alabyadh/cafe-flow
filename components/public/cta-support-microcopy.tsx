"use client";

import { useTranslations } from "next-intl";

type CtaSupportMicrocopyProps = {
  className?: string;
};

export function CtaSupportMicrocopy({ className }: CtaSupportMicrocopyProps) {
  const t = useTranslations("public.ctaSupport");
  return (
    <div className={`mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground ${className ?? ""}`}>
      <span className="rounded-full bg-muted px-2 py-1 font-medium">{t("noCard")}</span>
      <span className="rounded-full bg-muted px-2 py-1 font-medium">{t("activation")}</span>
      <span className="rounded-full bg-muted px-2 py-1 font-medium">{t("whatsapp")}</span>
    </div>
  );
}
