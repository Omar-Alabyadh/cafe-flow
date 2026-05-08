import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function UnauthorizedState({
  locale,
  title,
  description,
  hintTitle,
  hintDescription,
}: {
  locale: string;
  title?: string;
  description?: string;
  /** Optional setup guidance; must never echo secret env values or passwords. */
  hintTitle?: string;
  hintDescription?: string;
}) {
  const t = await getTranslations("common.unauthorized");
  return (
    <div className="cf-surface rounded-xl border border-amber-200 bg-amber-50/80 p-6 text-center dark:border-amber-800/60 dark:bg-amber-950/20">
      <p className="text-lg font-semibold text-amber-900 dark:text-amber-100">{title ?? t("title")}</p>
      <p className="mt-2 text-sm text-amber-800/90 dark:text-amber-100/90">{description ?? t("description")}</p>
      <div className="mt-4">
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
        >
          {t("backToDashboard")}
        </Link>
      </div>
      {hintTitle && hintDescription ? (
        <div
          className="mt-6 rounded-lg border border-zinc-200 bg-white/90 p-4 text-start text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-200"
          dir="auto"
        >
          <p className="text-sm font-semibold">{hintTitle}</p>
          <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{hintDescription}</p>
        </div>
      ) : null}
    </div>
  );
}
