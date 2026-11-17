"use client";

import { useMemo, useRef, useState, type ComponentProps, type KeyboardEvent } from "react";
import { addDays, calendarWeeks, heatLevel, parseDay } from "../../lib/calendar";
import { cn } from "../../lib/cn";

export interface CalendarHeatmapProps extends Omit<ComponentProps<"div">, "children"> {
  /** One value per day, keyed by plain date ("2026-10-30"). Missing days count as nothing. */
  values: Readonly<Record<string, number>>;
  /** First and last day shown, inclusive. */
  start: string;
  end: string;
  /** What the calendar shows, for assistive tech: "Workouts, last 26 weeks". */
  label: string;
  /** How a day's value reads in words: (3) => "3 workouts". Missing days get "Nothing logged". */
  formatValue?: (value: number, day: string) => string;
  /** The value that gets the darkest shade. Defaults to the largest value. */
  max?: number;
  /** Shades above empty, 1 to 6. */
  levels?: number;
  /** A day to mark with the highlight color, usually today. */
  today?: string;
  /** 1 starts weeks on Monday (the default), 0 on Sunday. */
  weekStartsOn?: 0 | 1;
  locale?: string;
}

// Literal classes, so Tailwind finds them: the sequential scale, light to dark.
const SHADES = [
  "bg-chart-seq-1",
  "bg-chart-seq-2",
  "bg-chart-seq-3",
  "bg-chart-seq-4",
  "bg-chart-seq-5",
  "bg-chart-seq-6",
  "bg-chart-seq-7",
] as const;

/** The shade for a level: spread over steps 2 to 7, since step 1 sits too close to empty. */
function shade(level: number, levels: number): string {
  if (level === 0) return "bg-sunken";
  const step = levels === 1 ? 7 : 2 + Math.round(((level - 1) * 5) / (levels - 1));
  return SHADES[step - 1] ?? "bg-chart-seq-7";
}

const MOVES: Partial<Record<string, number>> = {
  ArrowUp: -1,
  ArrowDown: 1,
  ArrowLeft: -7,
  ArrowRight: 7,
};

/**
 * Days as a grid of shaded squares, one column per week: streaks and
 * consistency at a glance. It is an ARIA grid: Tab reaches one day, the arrow
 * keys move by day (up and down) and by week (left and right), and Home and
 * End jump to the first and last day. Every day is named in words with its
 * value, so the shading is never the only cue.
 */
export function CalendarHeatmap({
  values,
  start,
  end,
  label,
  formatValue = (value) => String(value),
  max,
  levels = 4,
  today,
  weekStartsOn = 1,
  locale = "en-US",
  className,
  ...props
}: CalendarHeatmapProps) {
  const shades = Math.min(Math.max(Math.round(levels), 1), 6);
  const weeks = useMemo(() => calendarWeeks(start, end, weekStartsOn), [start, end, weekStartsOn]);
  const top = max ?? Math.max(0, ...Object.values(values).filter(Number.isFinite));
  const inRange = (day: string) => {
    const t = parseDay(day);
    return t >= parseDay(start) && t <= parseDay(end);
  };
  const [active, setActive] = useState(() => (today && inRange(today) ? today : end));
  const focusDay = active && inRange(active) ? active : end;
  const cells = useRef(new Map<string, HTMLDivElement>());

  const dateName = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const weekdayName = (style: "short" | "long", row: number) =>
    new Intl.DateTimeFormat(locale, { weekday: style, timeZone: "UTC" }).format(
      // 2023-01-01 was a Sunday.
      parseDay(addDays("2023-01-01", row + weekStartsOn)),
    );
  const monthName = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });

  function move(event: KeyboardEvent, day: string) {
    let next: string | undefined;
    const step = MOVES[event.key];
    if (step !== undefined) next = addDays(day, step);
    else if (event.key === "Home") next = start;
    else if (event.key === "End") next = end;
    if (next === undefined) return;
    event.preventDefault();
    if (!inRange(next)) return;
    setActive(next);
    cells.current.get(next)?.focus();
  }

  // A month's name over the first week that starts in it.
  const monthLabels = weeks.map((week, i) => {
    const first = week.find((day) => day !== null);
    const previous = i > 0 ? weeks[i - 1]?.find((day) => day !== null) : undefined;
    if (!first) return null;
    const month = first.slice(0, 7);
    return i === 0 || month !== previous?.slice(0, 7) ? monthName.format(parseDay(first)) : null;
  });

  return (
    <div
      data-slot="calendar-heatmap"
      className={cn("inline-flex max-w-full flex-col gap-xs overflow-x-auto", className)}
      {...props}
    >
      <div
        className="grid gap-px text-caption text-subtle"
        style={{
          gridTemplateColumns: `auto repeat(${String(weeks.length)}, var(--pl-heatmap-cell-size))`,
        }}
      >
        <div aria-hidden />
        {monthLabels.map((month, i) => (
          <div key={i} aria-hidden className="overflow-visible whitespace-nowrap">
            {month}
          </div>
        ))}
        <div role="grid" aria-label={label} className="contents">
          {Array.from({ length: 7 }, (_, row) => (
            <div key={row} role="row" className="contents">
              <div role="rowheader" className="pr-xs leading-none">
                {/* Every other day is shown, so the column stays narrow; all are named. */}
                <span aria-hidden className={row % 2 === 0 ? undefined : "invisible"}>
                  {weekdayName("short", row)}
                </span>
                <span className="sr-only">{weekdayName("long", row)}</span>
              </div>
              {weeks.map((week, column) => {
                const day = week[row];
                if (!day) return <div key={column} role="gridcell" />;
                const value = values[day];
                const level = heatLevel(value, top, shades);
                const isToday = day === today;
                return (
                  <div
                    key={day}
                    ref={(node) => {
                      if (node) cells.current.set(day, node);
                      else cells.current.delete(day);
                    }}
                    role="gridcell"
                    tabIndex={day === focusDay ? 0 : -1}
                    aria-current={isToday ? "date" : undefined}
                    aria-label={`${dateName.format(parseDay(day))}: ${
                      value === undefined ? "Nothing logged" : formatValue(value, day)
                    }`}
                    data-level={level}
                    data-day={day}
                    onKeyDown={(event) => {
                      move(event, day);
                    }}
                    onFocus={() => {
                      setActive(day);
                    }}
                    className={cn(
                      "focus-ring size-heatmap-cell rounded-heatmap-cell",
                      shade(level, shades),
                      isToday &&
                        "outline-(length:--pl-border-width-strong) outline-offset-(length:--pl-border-width-default) outline-chart-highlight outline-solid",
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div aria-hidden className="flex items-center gap-2xs self-end text-caption text-subtle">
        <span>Less</span>
        {Array.from({ length: shades + 1 }, (_, level) => (
          <span
            key={level}
            className={cn("size-heatmap-cell rounded-heatmap-cell", shade(level, shades))}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
