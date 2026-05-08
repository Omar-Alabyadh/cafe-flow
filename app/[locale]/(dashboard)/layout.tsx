import { AppShell } from "@/components/ui/foundations/app-shell";
import { getCurrentUserId } from "@/lib/auth/session";
import { getActiveBusinessCookie } from "@/lib/tenant/active-business-cookie";
import { getStaleActiveBusinessCookieRedirectPath } from "@/lib/tenant/stale-active-business-cookie";
import { prisma } from "@/lib/prisma";
import { BusinessStatus } from "@prisma/client";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

type DashboardLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Dashboard area layout with shared shell.
 * This layout also guards dashboard routes to authenticated users only.
 */
export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { locale } = await params;
  const currentUserId = await getCurrentUserId();

  if (!currentUserId) {
    redirect(`/${locale}/sign-in?callbackUrl=/${locale}/dashboard`);
  }

  const requestHeaders = await headers();
  const nextUrl = requestHeaders.get("next-url") ?? "";
  const isSelectBusinessRoute = nextUrl.includes(`/${locale}/dashboard/select-business`);
  /** SaaS operator console does not use tenant business context; do not force business selection first. */
  const isPlatformRoute = nextUrl.includes(`/${locale}/dashboard/platform`);
  if (!isPlatformRoute) {
    const staleCookieRedirect = await getStaleActiveBusinessCookieRedirectPath(currentUserId, locale);
    if (staleCookieRedirect) {
      redirect(staleCookieRedirect);
    }
  }
  const selectedBusinessId = await getActiveBusinessCookie();
  if (!selectedBusinessId) {
    const memberships = await prisma.membership.findMany({
      where: {
        userId: currentUserId,
        archivedAt: null,
        isActive: true,
        business: { archivedAt: null, status: { not: BusinessStatus.ARCHIVED } },
      },
      select: { businessId: true },
      distinct: ["businessId"],
      orderBy: { createdAt: "asc" },
    });
    if (memberships.length > 0 && !isSelectBusinessRoute && !isPlatformRoute) {
      redirect(`/${locale}/dashboard/select-business`);
    }
  }

  const t = await getTranslations("dashboard");

  return (
    <AppShell title={t("title")} locale={locale} platformShell={isPlatformRoute}>
      {children}
    </AppShell>
  );
}

