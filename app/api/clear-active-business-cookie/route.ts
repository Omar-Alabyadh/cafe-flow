import { auth } from "@/auth";
import { routing } from "@/i18n/routing";
import { clearActiveBusinessCookie } from "@/lib/tenant/active-business-cookie";
import { hasLocale } from "next-intl";
import { NextRequest, NextResponse } from "next/server";

/**
 * Clears stale `cafeflow_active_business_id` after membership loss.
 * Invoked only via `redirect()` from the dashboard layout (never from RSC cookie mutation).
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawLocale = request.nextUrl.searchParams.get("locale") ?? routing.defaultLocale;
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
  const fallback = new URL(`/${locale}/dashboard/select-business`, request.nextUrl.origin);

  const rawNext = request.nextUrl.searchParams.get("next");
  let destination = fallback;
  if (rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") && rawNext.startsWith(`/${locale}/`)) {
    destination = new URL(rawNext, request.nextUrl.origin);
  }

  await clearActiveBusinessCookie();
  return NextResponse.redirect(destination);
}
