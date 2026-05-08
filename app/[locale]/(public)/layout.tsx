import { WhatsAppFloatButton } from "@/components/public/whatsapp-float-button";
import { StickySalesCta } from "@/components/public/sticky-sales-cta";

type PublicLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Public area layout for landing and marketing-style pages.
 * We keep this separate from dashboard/auth to make responsibilities clear.
 */
export default async function PublicLayout({ children, params }: PublicLayoutProps) {
  const { locale } = await params;
  return (
    <>
      {children}
      <StickySalesCta locale={locale} />
      <WhatsAppFloatButton />
    </>
  );
}

