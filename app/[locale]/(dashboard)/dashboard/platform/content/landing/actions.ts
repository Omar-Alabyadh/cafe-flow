"use server";

import { getCurrentUserId } from "@/lib/auth/session";
import { getServerActionTranslator, normalizeServerActionLocale } from "@/lib/i18n/server-action-translator";
import { hasPlatformConsoleAccess } from "@/lib/platform/require-platform-console";
import { readLandingContent, saveLandingContent, type LandingContent } from "@/lib/platform/content/landing-content-store";
import { revalidatePath } from "next/cache";

const fields: Array<keyof LandingContent["ar"]> = [
  "heroBadge",
  "heroTitle",
  "heroDescription",
  "primaryCta",
  "pricingIntro",
  "featuresTitle",
  "faqTitle",
  "contactText",
];

/**
 * Platform-only CMS action. Tenant owners/staff must never control shared landing messaging.
 */
export async function updateLandingContent(
  formData: FormData,
): Promise<void> {
  const locale = normalizeServerActionLocale(String(formData.get("locale") ?? "ar"));
  const t = await getServerActionTranslator(locale);
  const userId = await getCurrentUserId();
  if (!userId || !(await hasPlatformConsoleAccess(userId))) {
    throw new Error(t("landing.unauthorized"));
  }

  const current = await readLandingContent();
  const next: LandingContent = {
    ar: { ...current.ar },
    en: { ...current.en },
  };
  for (const key of fields) {
    const ar = String(formData.get(`ar.${key}`) ?? "").trim();
    const en = String(formData.get(`en.${key}`) ?? "").trim();
    if (ar) next.ar[key] = ar;
    if (en) next.en[key] = en;
  }

  await saveLandingContent(next);
  revalidatePath(`/${locale}`, "page");
  revalidatePath(`/${locale}/pricing`, "page");
}
