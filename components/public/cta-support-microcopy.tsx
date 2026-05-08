"use client";

import { useTranslations } from "next-intl";

type CtaSupportMicrocopyProps = {
  className?: string;
};

export function CtaSupportMicrocopy({ className }: CtaSupportMicrocopyProps) {
  const t = useTranslations("public.ctaSupport");
  return (
    <div className={`mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-500 ${className ?? ""}`}>
      <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">{t("noCard")}</span>
      <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">{t("activation")}</span>
      <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">{t("whatsapp")}</span>
    </div>
  );
}
