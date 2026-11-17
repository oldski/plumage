"use client";

// A round Progress: the same Radix progressbar, drawn as a ring so it can sit
// beside a goal's name or hold a short figure in its middle. Tones match
// Progress; the track is the sunken background.
import { cva, type VariantProps } from "class-variance-authority";
import { Progress as ProgressPrimitive } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/cn";

export const progressRingVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center",
  {
    variants: {
      size: {
        sm: "size-figure-sm",
        lg: "size-figure-lg",
      },
    },
    defaultVariants: { size: "lg" },
  },
);

const arcVariants = cva(
  "transition-[stroke-dasharray] duration-(--pl-motion-duration-medium) ease-standard",
  {
    variants: {
      tone: {
        accent: "stroke-accent",
        positive: "stroke-positive",
        warning: "stroke-warning",
        neutral: "stroke-(--pl-color-border-strong)",
      },
    },
    defaultVariants: { tone: "accent" },
  },
);

export type ProgressRingProps = Omit<
  ComponentProps<typeof ProgressPrimitive.Root>,
  "value" | "max" | "children"
> &
  VariantProps<typeof progressRingVariants> &
  VariantProps<typeof arcVariants> & {
    /** How far along. Values below zero draw empty; values past max draw a full ring. */
    value: number;
    /** The limit; 100 by default. */
    max?: number;
    /** A short figure for the middle, such as "62%". Fits the lg size; leave sm empty. */
    children?: ReactNode;
  };

// Geometry in viewBox units: a circle whose path length is set to 100, so the
// dash array is the percentage. The stroke scales with the ring.
const VIEW = 36;
const RADIUS = 15;
const STROKE = 4;

/**
 * How much of a target is reached, as a ring: a savings goal, a debt paid
 * off. Name it (aria-label or aria-labelledby) and give getValueLabel the
 * words, such as "$1,200 of $5,000 saved". The ring alone carries no number;
 * anything in its middle is hidden from assistive tech, so say it in the label.
 */
export function ProgressRing({
  className,
  value,
  max = 100,
  size = "lg",
  tone = "accent",
  children,
  ...props
}: ProgressRingProps) {
  const limit = max > 0 ? max : 1;
  const shown = Math.min(Math.max(value, 0), limit);
  const percent = (shown / limit) * 100;
  return (
    <ProgressPrimitive.Root
      data-slot="progress-ring"
      data-tone={tone}
      value={shown}
      max={limit}
      className={cn(progressRingVariants({ size }), className)}
      {...props}
    >
      <svg viewBox={`0 0 ${String(VIEW)} ${String(VIEW)}`} aria-hidden className="size-full">
        <circle
          cx={VIEW / 2}
          cy={VIEW / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-(--pl-color-bg-sunken)"
        />
        {percent > 0 && (
          <circle
            data-slot="progress-ring-arc"
            cx={VIEW / 2}
            cy={VIEW / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${String(percent)} 100`}
            transform={`rotate(-90 ${String(VIEW / 2)} ${String(VIEW / 2)})`}
            className={arcVariants({ tone })}
          />
        )}
      </svg>
      {children !== undefined && (
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center font-numeric text-caption font-label tabular-nums text-default"
        >
          {children}
        </span>
      )}
    </ProgressPrimitive.Root>
  );
}
