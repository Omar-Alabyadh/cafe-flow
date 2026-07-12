import Link from "next/link";
import { LogOut, Shield, UserCircle2 } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { getCurrentUser } from "@/lib/auth/session";
import { isPlatformOperator } from "@/lib/platform/require-platform-operator";
import { MembershipRole } from "@prisma/client";
import { canAccessRoute, getEffectivePermissions } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { formatDashboardUserDisplay, loadDashboardIdentityForUser } from "@/lib/dashboard/dashboard-identity";
import { ROLE_ACCESS_DEFINITIONS, type SidebarItemKey } from "@/lib/authorization/role-access";
import { DashboardSidebarNav } from "./dashboard-sidebar-nav";
import type { NavGroup } from "./dashboard-sidebar-nav-types";
import { getTranslations } from "next-intl/server";

type DashboardSidebarProps = {
  locale: string;
  /** Set from layout when URL is under `/dashboard/platform` — trims tenant “home” chrome. */
  platformShell?: boolean;
};

/**
 * Dashboard navigation: business shell, catalog (Phase 5),
 * recipes/stock (Phase 6), internal consumption test (Phase 7),
 * simple orders foundation (Phase 8), and reports pages (Phase 9).
 * No multi-business switching: links are fixed and easy to explain.
 */
function dashLabel(v: string | null | undefined): string {
  return v && String(v).trim() ? String(v).trim() : "—";
}

export async function DashboardSidebar({ locale, platformShell = false }: DashboardSidebarProps) {
  const t = await getTranslations("dashboard.sidebar");
  const currentUser = await getCurrentUser();
  const sessionIdentity = currentUser?.id ? await loadDashboardIdentityForUser(currentUser.id) : null;
  let context = null;
  if (currentUser) {
    try {
      context = await getCurrentBusinessMemberContext(currentUser.id);
    } catch (error) {
      if (!isBusinessContextSelectionError(error)) {
        throw error;
      }
    }
  }
  const membership = context?.member ?? null;
  const taskOnlyRoles = new Set<MembershipRole>([
    MembershipRole.BARISTA,
    MembershipRole.KITCHEN_STAFF,
    MembershipRole.JUICE_STAFF,
  ]);
  if (membership && taskOnlyRoles.has(membership.role)) {
    return null;
  }
  const effectivePermissions = membership ? getEffectivePermissions(membership) : new Set();

  /**
   * Platform operator ≠ tenant owner: same `isPlatformOperator` as platform/layout (DB flag + env email, AND).
   * UI hiding alone is not security; direct URLs still hit the layout guard.
   */
  let isPlatformOp = false;
  if (currentUser?.id && !currentUser.archivedAt) {
    isPlatformOp = await isPlatformOperator(currentUser.id);
  }

  const base = `/${locale}/dashboard`;
  const biz = `${base}/business`;
  /**
   * Platform operator console: finance (subscriptions + payments) and cross-tenant reports.
   * Kept in one group so system owners are not mixed with tenant “café operations” items.
   */
  const platformNavGroup: NavGroup | null = isPlatformOp
    ? {
        title: t("groups.platform"),
        items: [
          { href: `${base}/platform`, label: t("items.platform"), icon: "shield" },
          { href: `${base}/platform/finance`, label: t("items.platformFinance"), icon: "wallet" },
          { href: `${base}/platform/reports`, label: t("items.platformReports"), icon: "reports" },
        ],
      }
    : null;
  const allowedSidebarItems = new Set<SidebarItemKey>(
    membership ? ROLE_ACCESS_DEFINITIONS[membership.role]?.allowedSidebarItems ?? [] : ["overview", "business-home"],
  );

  const sidebarKeyByHref = (href: string): SidebarItemKey => {
    if (href.endsWith("/dashboard")) return "overview";
    if (href.endsWith("/dashboard/business")) return "business-home";
    if (href.endsWith("/pos")) return "pos";
    if (href.endsWith("/orders")) return "orders";
    if (href.endsWith("/products")) return "products";
    if (href.endsWith("/categories")) return "categories";
    if (href.endsWith("/addons")) return "addons";
    if (href.endsWith("/recipes")) return "recipes";
    if (href.endsWith("/inventory")) return "inventory";
    if (href.endsWith("/stock-movements")) return "stock-movements";
    if (href.endsWith("/consumption")) return "consumption";
    if (href.endsWith("/staff")) return "staff";
    if (href.endsWith("/branches")) return "branches";
    if (href.endsWith("/suppliers")) return "suppliers";
    if (href.endsWith("/units")) return "units";
    if (href.endsWith("/raw-materials")) return "raw-materials";
    if (href.endsWith("/reports")) return "reports";
    if (href.endsWith("/ai-forecast")) return "forecast";
    if (href.includes("/dashboard/platform/finance")) return "platform-finance";
    if (href.includes("/dashboard/platform/reports")) return "platform-reports";
    if (href.endsWith("/platform")) return "platform";
    return "overview";
  };

  const groups: NavGroup[] = [
    ...(platformNavGroup ? [platformNavGroup] : []),
    {
      title: t("groups.main"),
      items: [
        // Operator console URLs: no tenant “Overview” row (platform dashboard is the hub).
        ...(!platformShell ? ([{ href: base, label: t("items.overview"), icon: "home" as const }] as const) : []),
        // Tenant “business profile” is irrelevant for the SaaS owner identity.
        ...(!isPlatformOp ? ([{ href: biz, label: t("items.businessProfile"), icon: "business" as const }] as const) : []),
      ],
    },
    {
      title: t("groups.operations"),
      items: [
        { href: `${biz}/pos`, label: t("items.pos"), icon: "orders" },
        { href: `${biz}/orders`, label: t("items.orders"), icon: "orders" },
        { href: `${biz}/products`, label: t("items.products"), icon: "store" },
        { href: `${biz}/categories`, label: t("items.categories"), icon: "boxes" },
        { href: `${biz}/addons`, label: t("items.addons"), icon: "addons" },
      ],
    },
    {
      title: t("groups.recipesInventory"),
      items: [
        { href: `${biz}/recipes`, label: t("items.recipes"), icon: "recipes" },
        { href: `${biz}/inventory`, label: t("items.inventory"), icon: "inventory" },
        { href: `${biz}/stock-movements`, label: t("items.stockMovements"), icon: "inventory" },
        { href: `${biz}/consumption`, label: t("items.consumption"), icon: "settings" },
      ],
    },
    {
      title: t("groups.managementReports"),
      items: [
        { href: `${biz}/staff`, label: t("items.staff"), icon: "staff" },
        { href: `${biz}/branches`, label: t("items.branches"), icon: "business" },
        { href: `${biz}/suppliers`, label: t("items.suppliers"), icon: "store" },
        { href: `${biz}/units`, label: t("items.units"), icon: "boxes" },
        { href: `${biz}/raw-materials`, label: t("items.rawMaterials"), icon: "inventory" },
        { href: `${biz}/reports`, label: t("items.reports"), icon: "reports" },
        { href: `${biz}/ai-forecast`, label: t("items.forecast"), icon: "forecast" },
      ],
    },
  ];
  const filteredGroups: NavGroup[] = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        // SaaS operator console: `isPlatformOperator` (DB flag + PLATFORM_OWNER_EMAIL), not tenant role.
        // Without this branch, OWNER (or no membership) operators never pass `canAccessRoute` / allowedSidebarItems.
        const isUnderPlatformConsole = item.href.includes("/dashboard/platform");
        if (isPlatformOp && isUnderPlatformConsole) {
          return true;
        }
        if (!membership) {
          if (isPlatformOp) {
            return item.href === base || item.href.includes("/dashboard/platform");
          }
          return item.href === base || item.href === biz;
        }
        if (!canAccessRoute(membership, item.href)) {
          return false;
        }
        if (!allowedSidebarItems.has(sidebarKeyByHref(item.href))) {
          return false;
        }
        // Defense in depth for links whose route can be shared but action permission matters.
        if (item.href.endsWith("/reports") && !effectivePermissions.has("reports.view_branch") && !effectivePermissions.has("reports.view_all")) {
          return false;
        }
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);

  const content = (
    <>
      {platformShell ? (
        <div className="cf-surface rounded-lg p-3">
          <BrandLockup compact />
        </div>
      ) : (
        <Link href={`/${locale}`} className="cf-surface rounded-lg p-3">
          <BrandLockup compact />
        </Link>
      )}
      <h2 className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {t("navigation")}
      </h2>
      <DashboardSidebarNav groups={filteredGroups} />

      <div className="mt-auto pt-5">
        <div className="cf-surface mb-3 rounded-xl p-3 shadow-sm">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <UserCircle2 className="h-4 w-4" />
            {t("profile.title")}
          </p>
          {sessionIdentity?.fullName ? (
            <dl className="space-y-1 text-[11px] leading-snug" dir={locale === "ar" ? "rtl" : "ltr"}>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-2">
                {sessionIdentity.isPlatformOperator ? (
                  <>
                    <dt className="text-muted-foreground">{t("profile.user")}</dt>
                    <dd className="whitespace-normal wrap-break-word font-medium text-foreground">
                      {dashLabel(
                        formatDashboardUserDisplay(locale, sessionIdentity.fullName, sessionIdentity.fullNameEn),
                      )}
                    </dd>
                    <dt className="text-muted-foreground">{t("profile.role")}</dt>
                    <dd className="flex items-center gap-1 font-medium text-foreground">
                      <Shield className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
                      {t("profile.platformOperator")}
                    </dd>
                    <dt className="text-muted-foreground">{t("profile.email")}</dt>
                    <dd className="truncate text-xs text-muted-foreground">{dashLabel(sessionIdentity.email)}</dd>
                  </>
                ) : (
                  <>
                    <dt className="text-muted-foreground">{t("profile.user")}</dt>
                    <dd className="whitespace-normal wrap-break-word font-medium text-foreground">
                      {dashLabel(
                        formatDashboardUserDisplay(locale, sessionIdentity.fullName, sessionIdentity.fullNameEn),
                      )}
                    </dd>
                    <dt className="text-muted-foreground">{t("profile.email")}</dt>
                    <dd className="truncate text-xs text-muted-foreground">{dashLabel(sessionIdentity.email)}</dd>
                    <dt className="text-muted-foreground">{t("profile.role")}</dt>
                    <dd className="truncate font-medium text-foreground">{dashLabel(sessionIdentity.roleLabelAr)}</dd>
                    <dt className="text-muted-foreground">{t("profile.branch")}</dt>
                    <dd className="truncate font-medium text-foreground">{dashLabel(sessionIdentity.branchLabelAr)}</dd>
                    <dt className="text-muted-foreground">{t("profile.business")}</dt>
                    <dd className="truncate font-medium text-foreground">{dashLabel(sessionIdentity.businessNameAr)}</dd>
                  </>
                )}
              </div>
            </dl>
          ) : (
            <p className="text-xs text-muted-foreground">{t("profile.unavailable")}</p>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 p-2 text-muted-foreground">
          <LogOut className="h-4 w-4" />
          <div className="flex-1">
            <LogoutButton locale={locale} />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <details className="mb-3 rounded-xl border border-border bg-muted p-3 md:hidden">
        <summary className="cursor-pointer text-sm font-semibold">{t("menu")}</summary>
        <div className="mt-3">{content}</div>
      </details>
      <aside className="hidden w-72 shrink-0 flex-col border-e border-border bg-muted p-4 md:flex">
        {content}
      </aside>
    </>
  );
}
