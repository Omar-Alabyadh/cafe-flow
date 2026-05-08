import { PageContainer } from "@/components/ui/foundations/page-container";
import { SectionHeader } from "@/components/ui/foundations/section-header";
import { ShieldAlert } from "lucide-react";
import { BrandLockup } from "@/components/brand/brand-lockup";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("public.terms");

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <BrandLockup compact />
        <Link href={`/${locale}/`} className="text-sm underline">
          {t("backHome")}
        </Link>
      </div>
      <SectionHeader title={t("title")} description={t("description")} />
      <div className="cf-surface rounded-xl p-6">
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <ShieldAlert className="h-4 w-4 text-amber-500" />
          {t("basicTerms")}
        </p>
        <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950">
            <p className="font-medium">{t("sections.inputResponsibility.title")}</p>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              {t("sections.inputResponsibility.body")}
            </p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950">
            <p className="font-medium">{t("sections.subscription.title")}</p>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">{t("sections.subscription.body")}</p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950">
            <p className="font-medium">{t("sections.nonPayment.title")}</p>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">{t("sections.nonPayment.body")}</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

