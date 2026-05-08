import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { getCurrentUserId } from "@/lib/auth/session";
import { canViewReports } from "@/lib/authorization/access";
import { getCurrentBusinessMemberContext, isBusinessContextSelectionError } from "@/lib/authorization/context";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

type ReportsLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ReportsLayout({ children, params }: ReportsLayoutProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.business.reports");
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
    return <UnauthorizedState locale={locale} title={t("unauthorizedTitle")} description={t("unauthorizedDescription")} />;
  }
  return children;
}
