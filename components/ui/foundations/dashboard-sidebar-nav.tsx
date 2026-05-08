"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Home,
  Building2,
  Store,
  Boxes,
  PackageSearch,
  ChefHat,
  ClipboardList,
  BarChart3,
  Sparkles,
  Settings2,
  UserCircle2,
  Shield,
  Wallet,
} from "lucide-react";
import type { NavGroup } from "./dashboard-sidebar-nav-types";

/** Strip trailing slash except for root. */
function normalizeNavPath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

/**
 * Picks the single most specific sidebar href for the current pathname.
 * Without this, `/dashboard` stays "active" on `/dashboard/business` because the latter starts with `/dashboard/`.
 */
function longestMatchingNavHref(pathname: string, hrefs: string[]): string | null {
  const path = normalizeNavPath(pathname);
  let best: string | null = null;
  let bestLen = -1;
  for (const raw of hrefs) {
    const h = normalizeNavPath(raw);
    if (path === h || path.startsWith(`${h}/`)) {
      if (h.length > bestLen) {
        bestLen = h.length;
        best = h;
      }
    }
  }
  return best;
}

const iconMap = {
  home: Home,
  business: Building2,
  store: Store,
  boxes: Boxes,
  inventory: PackageSearch,
  recipes: ChefHat,
  orders: ClipboardList,
  reports: BarChart3,
  addons: Sparkles,
  settings: Settings2,
  staff: UserCircle2,
  shield: Shield,
  wallet: Wallet,
} as const;

export function DashboardSidebarNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.sidebar");
  const allHrefs = groups.flatMap((g) => g.items.map((i) => i.href));
  const activeHref = longestMatchingNavHref(pathname, allHrefs);

  return (
    <nav className="mt-4 space-y-5" aria-label={t("ariaLabel")}>
      {groups.map((group) => (
        <div key={group.title}>
          <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">{group.title}</p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive =
                activeHref !== null && normalizeNavPath(item.href) === activeHref;
              const Icon = iconMap[item.icon];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    isActive
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-900 shadow-sm dark:border-emerald-500/35 dark:bg-emerald-500/10 dark:text-emerald-200"
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

