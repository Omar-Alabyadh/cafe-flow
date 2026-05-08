/**
 * Number formatting for Arabic UI while forcing Latin digits (1 2 3), not Eastern Arabic digits.
 * Uses Intl with `numberingSystem: "latn"` for explicit and explainable behavior.
 */

/** Integer without fractions, suitable for counters and table stats. */
export function formatArabicLatnInteger(value: number): string {
  return new Intl.NumberFormat("ar-EG", {
    numberingSystem: "latn",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Decimal numbers with a fixed number of fraction digits (e.g., balances or quantities).
 */
export function formatArabicLatnDecimal(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat("ar-EG", {
    numberingSystem: "latn",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * Quantities that may be integer or decimal without forcing trailing zeros.
 */
export function formatArabicLatnQuantity(value: number, maxFractionDigits = 6): string {
  return new Intl.NumberFormat("ar-EG", {
    numberingSystem: "latn",
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}
