import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

/**
 * Floating WhatsApp CTA for high-intent visitors.
 * In Libya, this is a primary conversion channel for SaaS sales.
 */
export async function WhatsAppFloatButton() {
  const t = await getTranslations("public.whatsapp");
  const prefilledMessage = encodeURIComponent(t("prefilledMessage"));
  return (
    <Link
      href={`https://wa.me/218925340789?text=${prefilledMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-28 right-5 z-50 inline-flex animate-pulse items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:bg-emerald-500"
      aria-label={t("ariaLabel")}
    >
      <MessageCircle className="h-4 w-4" />
      {t("button")}
    </Link>
  );
}
