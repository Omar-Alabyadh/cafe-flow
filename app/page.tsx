import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { LOCALE_PREFERENCE_COOKIE, normalizeLocale } from "@/lib/i18n/locale-preference";

export default async function RootPage() {
  /**
   * Locale routing vs real localization:
   * URL prefix controls which language bundle is loaded.
   * We prioritize explicit user choice cookie, then browser language, then Arabic default.
   */
  const cookieStore = await cookies();
  const preferred = normalizeLocale(cookieStore.get(LOCALE_PREFERENCE_COOKIE)?.value);
  if (preferred) {
    redirect(`/${preferred}`);
  }

  const headerStore = await headers();
  const browser = normalizeLocale(headerStore.get("accept-language"));
  redirect(`/${browser ?? "ar"}`);
}
