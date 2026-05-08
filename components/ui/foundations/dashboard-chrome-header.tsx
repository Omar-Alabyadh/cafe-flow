import { LogoutButton } from "@/components/auth/logout-button";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getCurrentUser } from "@/lib/auth/session";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { formatDashboardUserDisplay, loadDashboardIdentityForUser } from "@/lib/dashboard/dashboard-identity";
import { MembershipRole } from "@prisma/client";
import { BarChart3, Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

type DashboardChromeHeaderProps = {
  title: string;
  locale: string;
};

/**
 * Task-focused roles without sidebar should keep sign-out visible in the top bar.
 */
const TASK_ONLY_SIDEBAR_ROLES = new Set<MembershipRole>([
  MembershipRole.BARISTA,
  MembershipRole.KITCHEN_STAFF,
  MembershipRole.JUICE_STAFF,
]);

/**
 * Dashboard header:
 * normal users see title/theme/language, while task-only flow shows top-bar sign-out.
 */
function dash(v: string | null | undefined, emptyLabel: string): string {
  return v && String(v).trim() ? String(v).trim() : emptyLabel;
}

export async function DashboardChromeHeader({ title, locale }: DashboardChromeHeaderProps) {
  const t = await getTranslations("common");
  const tHeader = await getTranslations("dashboard.header");
  const currentUser = await getCurrentUser();
  const identity = currentUser?.id ? await loadDashboardIdentityForUser(currentUser.id) : null;

  let showTaskLogout = false;
  if (currentUser?.id) {
    try {
      const ctx = await getCurrentBusinessMemberContext(currentUser.id);
      showTaskLogout = TASK_ONLY_SIDEBAR_ROLES.has(ctx.member.role);
    } catch (error) {
      if (!isBusinessContextSelectionError(error)) {
        throw error;
      }
    }
  }

  return (
    <header className="border-b border-border bg-card/90 px-4 py-2 text-foreground backdrop-blur md:px-6">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <h1 className="shrink-0 whitespace-nowrap text-lg font-semibold">{title}</h1>

        <div className="min-w-0 overflow-hidden text-center">
          {identity?.fullName ? (
            identity.isPlatformOperator ? (
              <dl className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] leading-snug text-muted-foreground">
                <div className="inline-flex min-w-0 max-w-full items-baseline gap-1">
                  <dt className="shrink-0 text-muted-foreground">{tHeader("user")}:</dt>
                  <dd className="max-w-[min(100%,18rem)] font-medium text-foreground">
                    {dash(formatDashboardUserDisplay(locale, identity.fullName, identity.fullNameEn), t("emDash"))}
                  </dd>
                </div>
                <span className="shrink-0 text-muted-foreground/35" aria-hidden>
                  |
                </span>
                <div className="inline-flex min-w-0 items-baseline gap-1">
                  <dt className="shrink-0 text-muted-foreground">{tHeader("role")}:</dt>
                  <dd className="font-medium text-foreground">{tHeader("platformOperator")}</dd>
                </div>
                <span className="shrink-0 text-muted-foreground/35" aria-hidden>
                  |
                </span>
                <div className="inline-flex min-w-0 max-w-full items-baseline gap-1">
                  <dt className="shrink-0 text-muted-foreground">{tHeader("email")}:</dt>
                  <dd className="max-w-[min(100%,14rem)] truncate text-foreground">{dash(identity.email, t("emDash"))}</dd>
                </div>
              </dl>
            ) : (
              <dl className="inline-flex max-w-full items-center gap-2 overflow-hidden whitespace-nowrap text-[11px] leading-none text-muted-foreground">
                <div className="inline-flex min-w-0 items-baseline gap-1">
                  <dt className="shrink-0 text-muted-foreground">{tHeader("user")}:</dt>
                  <dd className="max-w-40 truncate font-medium text-foreground md:max-w-48">
                    {dash(formatDashboardUserDisplay(locale, identity.fullName, identity.fullNameEn), t("emDash"))}
                  </dd>
                </div>
                <span className="shrink-0 text-muted-foreground/35" aria-hidden>
                  |
                </span>
                <div className="inline-flex min-w-0 items-baseline gap-1">
                  <dt className="shrink-0 text-muted-foreground">{tHeader("role")}:</dt>
                  <dd className="max-w-24 truncate font-medium text-foreground md:max-w-32">{dash(identity.roleLabelAr, t("emDash"))}</dd>
                </div>
                <span className="shrink-0 text-muted-foreground/35" aria-hidden>
                  |
                </span>
                <div className="inline-flex min-w-0 items-baseline gap-1">
                  <dt className="shrink-0 text-muted-foreground">{tHeader("branch")}:</dt>
                  <dd className="max-w-24 truncate font-medium text-foreground md:max-w-32">{dash(identity.branchLabelAr, t("emDash"))}</dd>
                </div>
                <span className="shrink-0 text-muted-foreground/35" aria-hidden>
                  |
                </span>
                <div className="inline-flex min-w-0 items-baseline gap-1">
                  <dt className="shrink-0 text-muted-foreground">{tHeader("business")}:</dt>
                  <dd className="max-w-28 truncate font-medium text-foreground md:max-w-40">{dash(identity.businessNameAr, t("emDash"))}</dd>
                </div>
              </dl>
            )
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          {identity?.isPlatformOperator ? (
            <div className="hidden items-center gap-1.5 sm:flex" dir="ltr">
              <Link
                href={`/${locale}/dashboard/platform/finance`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:bg-emerald-950"
              >
                <Wallet className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {tHeader("financeConsole")}
              </Link>
              <Link
                href={`/${locale}/dashboard/platform/reports`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80"
              >
                <BarChart3 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {tHeader("reportsConsole")}
              </Link>
            </div>
          ) : null}
          {!showTaskLogout ? <p className="text-xs text-muted-foreground">{t("platformBrand")}</p> : null}
          <ThemeToggle />
          <LocaleSwitcher locale={locale} />
          {showTaskLogout ? <LogoutButton locale={locale} variant="header" /> : null}
        </div>
      </div>
    </header>
  );
}
