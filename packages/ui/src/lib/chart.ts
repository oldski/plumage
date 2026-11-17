// Data helpers for charts. They enforce the palette's rules in data, before
// anything is drawn: a categorical palette has 8 hues and is never cycled.

export const MAX_CATEGORICAL_SERIES = 8;

export interface FoldOptions<TRow> {
  /** Field holding the slice's size. */
  valueKey: keyof TRow;
  /** Field holding the slice's name. */
  labelKey: keyof TRow;
  /** Keep this many slices including "Other". Part-to-whole charts read best at 6 or fewer. */
  max?: number;
  otherLabel?: string;
}

/**
 * Keep the largest slices and fold the rest into one "Other" row, so a
 * part-to-whole chart never needs a ninth color or an unreadable sliver.
 *
 * @example foldToOther(holdings, { valueKey: "value", labelKey: "symbol", max: 6 })
 */
export function foldToOther<TRow extends Record<string, unknown>>(
  rows: readonly TRow[],
  { valueKey, labelKey, max = 6, otherLabel = "Other" }: FoldOptions<TRow>,
): TRow[] {
  const sorted = [...rows].sort((a, b) => Number(b[valueKey]) - Number(a[valueKey]));
  if (sorted.length <= max) return sorted;
  const kept = sorted.slice(0, max - 1);
  const other = sorted.slice(max - 1).reduce((sum, row) => sum + Number(row[valueKey]), 0);
  return [...kept, { [labelKey]: otherLabel, [valueKey]: other } as TRow];
}

/** A CSS-safe version of a series key, for custom property names. */
export function seriesIdent(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, "-");
}

/** var() reference to a series color set by ChartContainer, for Recharts fill and stroke props. */
export function seriesColor(key: string): string {
  return `var(--series-${seriesIdent(key)})`;
}

/**
 * Whole-number percentages of a total that add up to exactly 100, by the
 * largest remainder: [1, 1, 1] is [34, 33, 33], never [33, 33, 33]. Negative
 * values count as zero; all zeros give all zeros.
 */
export function wholePercents(values: readonly number[]): number[] {
  const clean = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 0));
  const total = clean.reduce((sum, v) => sum + v, 0);
  if (total === 0) return clean.map(() => 0);
  const exact = clean.map((v) => (v / total) * 100);
  const floors = exact.map(Math.floor);
  let left = 100 - floors.reduce((sum, v) => sum + v, 0);
  const order = exact
    .map((v, i) => ({ i, rest: v - Math.floor(v) }))
    .sort((a, b) => b.rest - a.rest || a.i - b.i);
  for (const { i } of order) {
    if (left <= 0) break;
    floors[i] = (floors[i] ?? 0) + 1;
    left -= 1;
  }
  return floors;
}
