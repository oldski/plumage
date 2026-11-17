import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { formatNumber, type FormatOptions } from "../../lib/format";

export interface MoneyProps
  extends
    Omit<ComponentProps<"data">, "children" | "value">,
    Pick<FormatOptions, "currency" | "locale" | "precision" | "sign" | "compact"> {
  /** The amount in major units (dollars), for display only. Keep stored money in integer cents. */
  value: number;
}

/**
 * An amount of money, formatted the same way everywhere: the currency symbol,
 * a true minus sign, and tabular figures in the numeric font so columns of
 * amounts line up. Color is left to the context; a negative amount is not an
 * alarm by itself.
 */
export function Money({
  value,
  currency,
  locale,
  precision,
  sign,
  compact,
  className,
  ...props
}: MoneyProps) {
  return (
    <data
      data-slot="money"
      value={String(value)}
      className={cn("font-numeric whitespace-nowrap tabular-nums", className)}
      {...props}
    >
      {formatNumber(value, { format: "currency", currency, locale, precision, sign, compact })}
    </data>
  );
}
