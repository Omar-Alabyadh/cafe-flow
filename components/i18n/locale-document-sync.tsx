"use client";

import { useEffect } from "react";
import { getDirection } from "@/lib/i18n";

type LocaleDocumentSyncProps = {
  locale: string;
};

/**
 * Keeps the root HTML attributes in sync during client-side locale changes.
 * This avoids stale `lang`/`dir` values after router.replace language switch.
 */
export function LocaleDocumentSync({ locale }: LocaleDocumentSyncProps) {
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = getDirection(locale);
  }, [locale]);

  return null;
}
