"use client";

// Ported from shadcn/ui (new-york-v4) progress, restyled with Plumage tokens.
// Adds a tone, so a bar that has reached its limit can say so without alarm
// red, and clamps the fill so a value past the limit still draws a full bar.
import { cva, type VariantProps } from "class-variance-authority";
import { Progress as ProgressPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export const progressIndicatorVariants = cva(
  [
    "size-full rounded-pill",
    "transition-transform duration-(--pl-motion-duration-medium) ease-standard",
  ],
  {
    variants: {
      tone: {
        accent: "bg-accent",
        positive: "bg-positive",
        warning: "bg-warning",
        neutral: "bg-(--pl-color-border-strong)",
      },
    },
    defaultVariants: { tone: "accent" },
  },
);

export type ProgressProps = Omit<ComponentProps<typeof ProgressPrimitive.Root>, "value" | "max"> &
  VariantProps<typeof progressIndicatorVariants> & {
    /** How far along. Values below zero draw empty; values past max draw full. */
    value: number;
    /** The limit; 100 by default. */
    max?: number;
  };

/**
 * How much of something is used or done: a budget spent, a goal saved. Name
 * it (aria-label or aria-labelledby) and give getValueLabel the words, such as
 * "$420 of $500", since the bar alone carries no number. Tone is never the only
 * signal: say "over" in text when a value passes its limit.
 */
export function Progress({
  className,
  value,
  max = 100,
  tone = "accent",
  ...props
}: ProgressProps) {
  const limit = max > 0 ? max : 1;
  const shown = Math.min(Math.max(value, 0), limit);
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-tone={tone}
      value={shown}
      max={limit}
      className={cn(
        "relative h-progress-track w-full overflow-hidden rounded-pill bg-sunken",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={progressIndicatorVariants({ tone })}
        style={{ transform: `translateX(-${String(100 - (shown / limit) * 100)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
