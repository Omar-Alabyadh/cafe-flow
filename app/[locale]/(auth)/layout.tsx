import { PageContainer } from "@/components/ui/foundations/page-container";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { getTranslations } from "next-intl/server";

type AuthLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Auth area layout.
 * This phase only prepares the structure and styling shell, not auth behavior.
 */
export default async function AuthLayout({ children, params }: AuthLayoutProps) {
  const { locale } = await params;
  const t = await getTranslations("auth.layout");
  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-md">
        <div className="mb-4 rounded-2xl border border-zinc-200 bg-white/70 p-4 text-center backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="mb-2 flex justify-center">
            <LocaleSwitcher locale={locale} />
          </div>
          <p className="text-sm font-semibold">CafeFlow</p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            {t("subtitle")}
          </p>
        </div>
        {children}
      </div>
    </PageContainer>
  );
}

