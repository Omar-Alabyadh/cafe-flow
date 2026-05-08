import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getTranslations } from "next-intl/server";
import { SignInForm } from "./sign-in-form";

/**
 * Real sign-in page for credentials auth.
 * This page only handles login; registration is intentionally deferred.
 */
export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { locale } = await params;
  const { callbackUrl } = await searchParams;
  const t = await getTranslations("auth.signIn");

  return (
    <>
      <SectionHeader title={t("title")} description={t("description")} />
      <SignInForm locale={locale} callbackUrl={callbackUrl} />
    </>
  );
}

