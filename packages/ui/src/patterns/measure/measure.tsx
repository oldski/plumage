import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { formatMeasure, type MeasureOptions, type MeasureUnit } from "../../lib/measure";

export interface MeasureProps
  extends Omit<ComponentProps<"data">, "children" | "value">, MeasureOptions {
  /** The value in `unit`. A duration is given in minutes. Convert before display, never in storage. */
  value: number;
  unit: MeasureUnit;
}

/**
 * A value with its unit, formatted one way everywhere: "72.5 kg", "2,140 kcal",
 * "7 h 32 min". Figures are tabular in the numeric font, and a narrow no-break
 * space keeps the number and its unit together. Screen readers hear the
 * unit in words ("72.5 kilograms"), not its abbreviation.
 */
export function Measure({
  value,
  unit,
  locale,
  precision,
  sign,
  className,
  ...props
}: MeasureProps) {
  const { text, spoken } = formatMeasure(value, unit, { locale, precision, sign });
  return (
    <data
      data-slot="measure"
      data-unit={unit}
      value={String(value)}
      className={cn("font-numeric whitespace-nowrap tabular-nums", className)}
      {...props}
    >
      <span aria-hidden>{text}</span>
      <span className="sr-only">{spoken}</span>
    </data>
  );
}
