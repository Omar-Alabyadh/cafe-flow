import { readLandingContent } from "@/lib/platform/content/landing-content-store";
import { updateLandingContent } from "./actions";
import { getTranslations } from "next-intl/server";

type PageProps = { params: Promise<{ locale: string }> };

export default async function PlatformLandingContentPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("platform.landingEditor");
  const content = await readLandingContent();

  const fields: Array<{ key: keyof typeof content.ar; label: string }> = [
    { key: "heroBadge", label: t("fields.heroBadge") },
    { key: "heroTitle", label: t("fields.heroTitle") },
    { key: "heroDescription", label: t("fields.heroDescription") },
    { key: "primaryCta", label: t("fields.primaryCta") },
    { key: "pricingIntro", label: t("fields.pricingIntro") },
    { key: "featuresTitle", label: t("fields.featuresTitle") },
    { key: "faqTitle", label: t("fields.faqTitle") },
    { key: "contactText", label: t("fields.contactText") },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {t("description")}
        </p>
      </div>

      <form action={updateLandingContent} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        {fields.map((field) => (
          <div key={field.key} className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-medium text-zinc-500">{t("arPrefix")} — {field.label}</span>
              <textarea
                name={`ar.${field.key}`}
                defaultValue={content.ar[field.key]}
                dir="rtl"
                className="min-h-20 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-start text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-zinc-500">{t("enPrefix")} — {field.label}</span>
              <textarea
                name={`en.${field.key}`}
                defaultValue={content.en[field.key]}
                dir="ltr"
                className="min-h-20 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-start text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
          </div>
        ))}
        <button
          type="submit"
          className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          {t("saveButton")}
        </button>
      </form>
    </div>
  );
}
