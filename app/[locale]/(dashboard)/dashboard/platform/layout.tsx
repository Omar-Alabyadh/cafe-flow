import { UnauthorizedState } from "@/components/auth/unauthorized-state";
import { PageContainer } from "@/components/ui/foundations/page-container";
import { getCurrentUserId } from "@/lib/auth/session";
import { hasValidPlatformStepUpCookie } from "@/lib/platform/platform-step-up-cookie";
import { isPlatformOperator } from "@/lib/platform/require-platform-operator";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { PlatformStepUpPanel } from "./platform-step-up-panel";

type PlatformLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Hard boundary: everything under /dashboard/platform is SaaS operator data.
 *
 * Layers (all required):
 * 1. Signed-in session.
 * 2. `isPlatformOperator`: `User.isPlatformOwner` AND email match to `PLATFORM_OWNER_EMAIL` (env).
 * 3. Step-up: short-lived httpOnly cookie after re-entering the **same account password** (see `platform-step-up-cookie.ts`).
 * 4. Optional env-only factors: `PLATFORM_TOTP_SECRET` (authenticator) and/or `PLATFORM_EXTRA_SECRET` (see `platform-fourth-layer.ts`).
 *
 * Tenant business owners / staff must never execute child pages without (1)+(2)+(3).
 */
export default async function PlatformLayout({ children, params }: PlatformLayoutProps) {
  const { locale } = await params;
  const t = await getTranslations("platform.layout");
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(`/${locale}/sign-in?callbackUrl=/${locale}/dashboard/platform`);
  }

  const allowed = await isPlatformOperator(userId);
  if (!allowed) {
    return (
      <PageContainer>
        <UnauthorizedState
          locale={locale}
          title={t("unauthorizedTitle")}
          description={t("unauthorizedDescription")}
          hintTitle={t("unauthorizedHintTitle")}
          hintDescription={t("unauthorizedHintDescription")}
        />
      </PageContainer>
    );
  }

  const stepUpOk = await hasValidPlatformStepUpCookie(userId);
  if (!stepUpOk) {
    return <PlatformStepUpPanel locale={locale} />;
  }

  return <>{children}</>;
}
