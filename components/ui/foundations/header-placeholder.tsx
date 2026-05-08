import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getTranslations } from "next-intl/server";

type HeaderPlaceholderProps = {
  title: string;
  locale: string;
};

/**
 * Shared header placeholder for top-level screens.
 * Real actions and widgets can be added in future phases.
 */
export async function HeaderPlaceholder({ title, locale }: HeaderPlaceholderProps) {
  const t = await getTranslations("common");
  return (
    <header className="border-b border-border bg-card/90 px-4 py-3 text-foreground backdrop-blur md:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">{t("platformBrand")}</p>
          <ThemeToggle />
          <LocaleSwitcher locale={locale} />
        </div>
      </div>
    </header>
  );
}

