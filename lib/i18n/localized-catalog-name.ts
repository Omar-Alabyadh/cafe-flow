/**
 * Picks the human-facing catalog or entity name for the active UI locale.
 * Arabic remains the canonical field (`nameAr`); English prefers `nameEn` when present.
 * This is presentation only — it does not change stored data or authorization.
 */
export function localizedCatalogName(
  locale: string,
  nameAr: string | null | undefined,
  nameEn?: string | null,
): string {
  const ar = (nameAr ?? "").trim();
  const en = (nameEn ?? "").trim();
  if (locale === "en") {
    return en || ar;
  }
  return ar || en;
}
