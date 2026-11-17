// Values with units: body weight, food, energy, heart rate, sleep. Formatting
// only; a product stores one unit (metric, say) and converts for display with
// convertMass. Numbers go through formatNumber, so negatives get a true minus.
import { formatNumber, MINUS, type FormatOptions } from "./format";

export type MassUnit = "kg" | "lb" | "g" | "oz";
/** "duration" is a length of time given in minutes, shown as hours and minutes. */
export type MeasureUnit = MassUnit | "kcal" | "bpm" | "ms" | "duration";

interface UnitInfo {
  symbol: string;
  one: string;
  many: string;
  precision: number;
}

const UNITS: Record<Exclude<MeasureUnit, "duration">, UnitInfo> = {
  kg: { symbol: "kg", one: "kilogram", many: "kilograms", precision: 1 },
  lb: { symbol: "lb", one: "pound", many: "pounds", precision: 1 },
  g: { symbol: "g", one: "gram", many: "grams", precision: 0 },
  oz: { symbol: "oz", one: "ounce", many: "ounces", precision: 1 },
  kcal: { symbol: "kcal", one: "calorie", many: "calories", precision: 0 },
  bpm: { symbol: "bpm", one: "beat per minute", many: "beats per minute", precision: 0 },
  ms: { symbol: "ms", one: "millisecond", many: "milliseconds", precision: 0 },
};

/** U+202F, a narrow no-break space: keeps "72.5 kg" on one line, close but not touching. */
export const UNIT_SPACE = " ";

/** Grams in one of each mass unit. Exact: the pound is defined as 0.45359237 kg. */
const GRAMS: Record<MassUnit, number> = { g: 1, kg: 1000, lb: 453.59237, oz: 28.349523125 };

/** A mass in another unit, unrounded: convertMass(80, "kg", "lb") is 176.37... */
export function convertMass(value: number, from: MassUnit, to: MassUnit): number {
  return from === to ? value : (value * GRAMS[from]) / GRAMS[to];
}

export type MeasureOptions = Pick<FormatOptions, "locale" | "precision" | "sign">;

export interface FormattedMeasure {
  /** What to show: "72.5 kg", "7 h 32 min". */
  text: string;
  /** What to read aloud: "72.5 kilograms", "7 hours 32 minutes". */
  spoken: string;
}

const plural = (n: number, one: string, many: string) => (Math.abs(n) === 1 ? one : many);

function formatDuration(minutes: number, { locale, sign }: MeasureOptions): FormattedMeasure {
  const total = Math.round(Math.abs(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  const prefix =
    minutes < 0 && total > 0 && sign !== "never"
      ? MINUS
      : minutes > 0 && sign === "always"
        ? "+"
        : "";
  const n = (value: number) => formatNumber(value, { locale });
  const parts: [number, string, string, string][] = [];
  if (hours > 0) parts.push([hours, "h", "hour", "hours"]);
  if (rest > 0 || hours === 0) parts.push([rest, "min", "minute", "minutes"]);
  return {
    text: prefix + parts.map(([v, s]) => `${n(v)}${UNIT_SPACE}${s}`).join(" "),
    spoken:
      (prefix === MINUS ? "minus " : "") +
      parts.map(([v, , one, many]) => `${n(v)} ${plural(v, one, many)}`).join(" "),
  };
}

/**
 * Format a value in a unit. Precision defaults per unit: one decimal for kg,
 * lb, and oz; whole numbers for g, kcal, bpm, and ms; whole minutes for a
 * duration.
 *
 * @example formatMeasure(72.5, "kg") // { text: "72.5 kg", spoken: "72.5 kilograms" }
 * @example formatMeasure(452, "duration") // { text: "7 h 32 min", spoken: "7 hours 32 minutes" }
 */
export function formatMeasure(
  value: number,
  unit: MeasureUnit,
  options: MeasureOptions = {},
): FormattedMeasure {
  if (unit === "duration") return formatDuration(value, options);
  const info = UNITS[unit];
  const precision = options.precision ?? info.precision;
  const number = formatNumber(value, { ...options, precision });
  const rounded = Number(value.toFixed(precision));
  const spokenNumber = number.replace(MINUS, "minus ");
  return {
    text: `${number}${UNIT_SPACE}${info.symbol}`,
    spoken: `${spokenNumber} ${plural(rounded, info.one, info.many)}`,
  };
}
