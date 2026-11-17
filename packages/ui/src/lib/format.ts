// Number formatting shared by patterns. Intl does the locale work; these
// helpers only pick consistent defaults so a percent looks the same in a
// Delta, a StatCard, a table cell, and a chart tooltip.

export type NumberFormat = "number" | "percent" | "currency";

export interface FormatOptions {
  format?: NumberFormat;
  /** ISO 4217 code for currency values. */
  currency?: string;
  locale?: string;
  /** Fraction digits. Defaults: percent 2, currency 2, number 0. */
  precision?: number;
  /** "always" prefixes + on positive numbers; "never" drops the sign. */
  sign?: "auto" | "always" | "never";
  /** Abbreviate large values: 12.9K, $4.2M. */
  compact?: boolean;
}

const DEFAULT_PRECISION: Record<NumberFormat, number> = { number: 0, percent: 2, currency: 2 };

/**
 * Format a number. Percent values are ratios: 0.0124 formats as 1.24%.
 *
 * @example formatNumber(0.0124, { format: "percent", sign: "always" }) // "+1.24%"
 * @example formatNumber(4_210_000, { format: "currency", compact: true }) // "$4.2M"
 * @example formatNumber(-56.78, { format: "currency" }) // "−$56.78", with a true minus sign
 */
export function formatNumber(value: number, options: FormatOptions = {}): string {
  const { format = "number", currency = "USD", locale = "en-US", sign = "auto", compact } = options;
  const precision = options.precision ?? (compact ? 1 : DEFAULT_PRECISION[format]);
  const formatted = new Intl.NumberFormat(locale, {
    style: format === "number" ? "decimal" : format,
    currency: format === "currency" ? currency : undefined,
    notation: compact ? "compact" : "standard",
    minimumFractionDigits: compact ? 0 : precision,
    maximumFractionDigits: precision,
    signDisplay: sign === "always" ? "exceptZero" : sign,
  }).format(value);
  // A true minus sign (U+2212), not a hyphen: it is as wide as the plus sign
  // and the digits, so signed figures line up in tabular columns.
  return formatted.replaceAll("-", MINUS);
}

/** U+2212, the minus sign formatNumber uses for negatives. */
export const MINUS = "\u2212";
