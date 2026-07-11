import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getCurrentUserId } from "@/lib/auth/session";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { canViewReports } from "@/lib/authorization/access";
import Link from "next/link";
import { BarChart3, Flame, PackageSearch, ShoppingCart } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ locale: string }> };

export default async function ReportsIndexPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.reports.index");
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(`/${locale}/sign-in`);
  }

  let context;
  try {
    context = await getCurrentBusinessMemberContext(userId);
  } catch (error) {
    if (isBusinessContextSelectionError(error)) {
      redirect(`/${locale}/dashboard/select-business`);
    }
    throw error;
  }
  if (!canViewReports(context.member)) {
    return (
      <UnauthorizedState
        locale={locale}
        title={t("unauthorizedTitle")}
        description={t("unauthorizedDescription")}
      />
    );
  }

  const base = `/${locale}/dashboard/business/reports`;
  const links = [
    { href: `${base}/financial`, label: locale === "en" ? "Financial reports" : "التقارير المالية", icon: BarChart3 },
    { href: `${base}/orders`, label: t("cards.orders"), icon: ShoppingCart },
    { href: `${base}/best-selling-products`, label: t("cards.bestSelling"), icon: Flame },
    { href: `${base}/low-stock`, label: t("cards.lowStock"), icon: PackageSearch },
    { href: `${base}/stock-movements`, label: t("cards.stockMovements"), icon: BarChart3 },
  ];

  return (
    <PageContainer>
      <SectionHeader
        title={t("title")}
        description={t("description")}
      />
      <div className="grid gap-4 md:grid-cols-2">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="cf-surface rounded-xl p-4 text-sm transition hover:scale-[1.01]"
            >
              <p className="flex items-center gap-2 font-semibold">
                <item.icon className="h-4 w-4 text-emerald-500" />
                {item.label}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{t("cardHint")}</p>
            </Link>
          ))}
      </div>
    </PageContainer>
  );
}

