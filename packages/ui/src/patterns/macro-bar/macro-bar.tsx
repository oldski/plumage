import type { ComponentProps, ReactNode } from "react";
import { MAX_CATEGORICAL_SERIES, wholePercents } from "../../lib/chart";
import { cn } from "../../lib/cn";

export interface MacroBarSegment {
  /** Stable key, for React. */
  key: string;
  /** "Protein". */
  label: string;
  /** The segment's size, in any one unit shared by every segment (grams, calories, dollars). */
  value: number;
  /** The value as it should read in the legend, such as a <Measure />. Defaults to the percentage alone. */
  display?: ReactNode;
}

export interface MacroBarProps extends Omit<ComponentProps<"div">, "children"> {
  /** Up to eight segments, in the order to draw them. */
  segments: readonly MacroBarSegment[];
  /** What the bar shows, for assistive tech: "Today's macros by calories". */
  label: string;
  /** Hide the legend; the bar is then announced as one image with every share in its name. */
  hideLegend?: boolean;
}

// Literal classes, so Tailwind finds them: the categorical palette in order.
const FILLS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-chart-6",
  "bg-chart-7",
  "bg-chart-8",
] as const;

/**
 * One whole split into parts, as a single stacked bar: protein, carbs, and fat
 * by calories, or any other part-to-whole with a few parts. Each segment takes
 * the next categorical chart color, and the legend gives every share as a
 * number, so color is never the only cue. Shares are whole percentages that
 * add up to 100.
 */
export function MacroBar({
  segments,
  label,
  hideLegend = false,
  className,
  ...props
}: MacroBarProps) {
  if (segments.length > MAX_CATEGORICAL_SERIES) {
    throw new Error(`MacroBar draws at most ${String(MAX_CATEGORICAL_SERIES)} segments.`);
  }
  const percents = wholePercents(segments.map((s) => s.value));
  const summary = segments.map((s, i) => `${s.label} ${String(percents[i])}%`).join(", ");
  const empty = percents.every((p) => p === 0);

  return (
    <div
      data-slot="macro-bar"
      role="group"
      aria-label={label}
      className={cn("flex flex-col gap-xs", className)}
      {...props}
    >
      <div
        data-slot="macro-bar-track"
        {...(hideLegend
          ? { role: "img", "aria-label": empty ? `${label}: nothing yet` : `${label}: ${summary}` }
          : { "aria-hidden": true })}
        // A hairline of the surface between segments keeps neighbors apart.
        className="flex h-macro-bar w-full gap-px overflow-hidden rounded-pill bg-sunken"
      >
        {segments.map((segment, i) =>
          percents[i] ? (
            <div
              key={segment.key}
              data-slot="macro-bar-segment"
              className={cn("h-full", FILLS[i])}
              style={{ flexGrow: Math.max(segment.value, 0), flexBasis: 0 }}
            />
          ) : null,
        )}
      </div>
      {!hideLegend && (
        <ul className="flex flex-wrap gap-x-md gap-y-2xs text-caption text-muted">
          {segments.map((segment, i) => (
            <li key={segment.key} className="flex items-center gap-2xs">
              <span
                aria-hidden
                className={cn("size-icon-sm shrink-0 rounded-indicator", FILLS[i])}
              />
              <span className="text-default">{segment.label}</span>
              {segment.display !== undefined && <span>{segment.display}</span>}
              <span className="font-numeric tabular-nums">{percents[i]}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
