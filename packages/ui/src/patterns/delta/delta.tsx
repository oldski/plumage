import { cva, type VariantProps } from "class-variance-authority";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { formatNumber, type FormatOptions } from "../../lib/format";

export type DeltaDirection = "up" | "down" | "flat";

const deltaVariants = cva("inline-flex w-fit items-center gap-2xs font-label whitespace-nowrap", {
  variants: {
    tone: {
      positive: "text-positive",
      negative: "text-negative",
      neutral: "text-subtle",
    },
    variant: {
      text: "",
      badge: "rounded-badge px-sm",
    },
    size: {
      sm: "text-label [&_svg]:size-icon-sm",
      md: "text-body [&_svg]:size-icon-md",
    },
  },
  compoundVariants: [
    { variant: "badge", tone: "positive", className: "bg-positive-subtle" },
    { variant: "badge", tone: "negative", className: "bg-negative-subtle" },
    { variant: "badge", tone: "neutral", className: "bg-sunken" },
  ],
  defaultVariants: { variant: "text", size: "md" },
});

export interface DeltaProps
  extends
    Omit<ComponentProps<"span">, "children">,
    Pick<FormatOptions, "format" | "currency" | "locale" | "precision">,
    Pick<VariantProps<typeof deltaVariants>, "variant" | "size"> {
  /** The change as a plain number. With format "percent", 0.0124 means 1.24%. */
  value: number;
  /** Set when a decrease is good (fees, volatility). Flips the color, never the arrow. */
  invert?: boolean;
  /** Absolute changes smaller than this count as no change. */
  threshold?: number;
  /** What the change is measured against, shown after the value: "today", "vs last snapshot". */
  period?: string;
}

/** Direction of a change, treating anything within the threshold as flat. */
export function deltaDirection(value: number, threshold = 0): DeltaDirection {
  if (Math.abs(value) <= threshold) return "flat";
  return value > 0 ? "up" : "down";
}

const ICONS = { up: ArrowUpIcon, down: ArrowDownIcon, flat: MinusIcon } as const;
const SPOKEN = { up: "Up", down: "Down", flat: "Unchanged" } as const;

/**
 * A signed change with direction carried three ways: an arrow, an explicit
 * sign, and color. Screen readers hear words ("Down 0.8% today"), never a
 * color or a bare minus sign.
 */
export function Delta({
  value,
  format = "percent",
  currency,
  locale,
  precision,
  invert = false,
  threshold = 0,
  period,
  variant,
  size,
  className,
  ...props
}: DeltaProps) {
  const direction = deltaDirection(value, threshold);
  const good = direction === "flat" ? null : (direction === "up") !== invert;
  const tone = good === null ? "neutral" : good ? "positive" : "negative";
  const Icon = ICONS[direction];
  const shown = direction === "flat" ? 0 : value;
  const signed = formatNumber(shown, { format, currency, locale, precision, sign: "always" });
  const magnitude = formatNumber(Math.abs(shown), { format, currency, locale, precision });

  return (
    <span
      data-slot="delta"
      data-direction={direction}
      className={cn(deltaVariants({ tone, variant, size }), className)}
      {...props}
    >
      <Icon aria-hidden strokeWidth={2.5} />
      <span aria-hidden className="tabular-nums">
        {signed}
      </span>
      {period && (
        <span aria-hidden className="font-body text-subtle">
          {period}
        </span>
      )}
      <span className="sr-only">
        {direction === "flat" ? SPOKEN.flat : `${SPOKEN[direction]} ${magnitude}`}
        {period ? ` ${period}` : ""}
      </span>
    </span>
  );
}
