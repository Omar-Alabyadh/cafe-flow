/**
 * Libyan Dinar display for CafeFlow.
 *
 * Product rule: Western digit grouping and two decimals everywhere (`1,234.56`).
 * - Arabic UI: suffix **د.ل** and callers should wrap the string in `dir="rtl"` when inline with mixed content.
 * - English UI: suffix **LYD** and `dir="ltr"`.
 *
 * Payment APIs still use ISO code `LYD` (see `BILLING_CURRENCY` / Stripe metadata).
 */
const amountFormatter = new Intl.NumberFormat("en-US", {
  numberingSystem: "latn",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ISO-style code shown in English / LTR contexts. */
export const LIBYAN_DINAR_SUFFIX_EN = "LYD";

/** Common Arabic abbreviation for Libyan dinar (دينار ليبي). */
export const LIBYAN_DINAR_SUFFIX_AR = "د.ل";

/** Same as `LIBYAN_DINAR_SUFFIX_EN` — kept for imports that mean “API / ISO label”. */
export const LIBYAN_DINAR_SUFFIX = LIBYAN_DINAR_SUFFIX_EN;

function toFiniteNumber(amount: unknown): number {
  if (typeof amount === "number") {
    return Number.isFinite(amount) ? amount : 0;
  }
  if (typeof amount === "bigint") {
    return Number(amount);
  }
  if (typeof amount === "string") {
    const n = Number(amount);
    return Number.isFinite(n) ? n : 0;
  }
  if (amount !== null && typeof amount === "object" && "toString" in amount) {
    const n = Number(String(amount));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/**
 * Same as the internal formatter coercion: turns numbers, strings, Prisma.Decimal, etc. into a finite `number`.
 * Use for props passed from Server Components into Client Components (e.g. `MoneyValue`) — `Decimal` is not JSON-serializable across that boundary.
 */
export function toPlainMoneyAmount(amount: unknown): number {
  return toFiniteNumber(amount);
}

export function libyanDinarUsesArabicSymbol(locale: string | undefined): boolean {
  if (!locale) return false;
  return locale === "ar" || locale.startsWith("ar-");
}

/** `dir` for the formatted amount + suffix span (Arabic symbol block reads RTL). */
export function libyanDinarTextDir(locale: string | undefined): "rtl" | "ltr" {
  return libyanDinarUsesArabicSymbol(locale) ? "rtl" : "ltr";
}

export function libyanDinarSuffixForLocale(locale: string | undefined): string {
  return libyanDinarUsesArabicSymbol(locale) ? LIBYAN_DINAR_SUFFIX_AR : LIBYAN_DINAR_SUFFIX_EN;
}

/**
 * @param amount — number, numeric string, Prisma.Decimal, or other value with toString()
 * @param locale — optional UI locale (`ar` → د.ل, otherwise LYD)
 * @returns e.g. `1,234.56 LYD` or `1,234.56 د.ل`
 */
export function formatLibyanDinar(amount: unknown, locale?: string): string {
  const formatted = amountFormatter.format(toFiniteNumber(amount));
  return `${formatted} ${libyanDinarSuffixForLocale(locale)}`;
}
