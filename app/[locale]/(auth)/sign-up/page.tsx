import { SectionHeader } from "@/components/ui/foundations/section-header";
import { getTranslations } from "next-intl/server";
import { SignUpForm } from "./sign-up-form";

/**
 * Sign-up foundation page.
 * Kept intentionally simple: create account then go to sign-in.
 */
export default async function SignUpPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string; inviteEmail?: string }>;
}) {
  const { locale } = await params;
  const { callbackUrl, inviteEmail } = await searchParams;
  const t = await getTranslations("auth.signUp");

  return (
    <>
      <SectionHeader
        title={t("title")}
        description={t("description")}
      />
      <SignUpForm locale={locale} callbackUrl={callbackUrl} defaultEmail={inviteEmail} />
    </>
  );
}

