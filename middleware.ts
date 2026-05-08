import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest } from "next/server";
import { LOCALE_PREFERENCE_COOKIE } from "@/lib/i18n/locale-preference";

/**
 * Locale prefix and default-locale redirects for all non-static routes.
 * Keeps next-intl’s requestLocale in sync with the URL; excludes API, Next internals, and files with extensions.
 */
const handleI18nRouting = createMiddleware(routing);

/**
 * Locale middleware + preference persistence.
 * If user navigates explicitly to /ar or /en, we store that choice and prioritize it on future root visits.
 */
export default function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);
  const localeFromPath = request.nextUrl.pathname.split("/")[1];
  if (localeFromPath === "ar" || localeFromPath === "en") {
    response.cookies.set(LOCALE_PREFERENCE_COOKIE, localeFromPath, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
