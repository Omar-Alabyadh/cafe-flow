import { routing } from "@/i18n/routing";
import { getDirection } from "@/lib/i18n";
import { LocaleDocumentSync } from "@/components/i18n/locale-document-sync";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Locale layout responsibilities:
 * 1) validate locale segment,
 * 2) provide translations to child components,
 * 3) expose RTL/LTR direction in a clear wrapper.
 */
export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = (await import(`@/messages/${locale}.json`)).default;
  const direction = getDirection(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleDocumentSync locale={locale} />
      <div lang={locale} dir={direction} className="flex min-h-full flex-1 flex-col">
        {children}
      </div>
    </NextIntlClientProvider>
  );
}

