// Calendar math for CalendarHeatmap, on plain dates ("2026-10-30"). Dates are
// handled at UTC midnight, so no time zone or daylight saving change can move
// a day into the next column.

const DAY_MS = 86_400_000;

/** "2026-10-30" to a UTC timestamp, or NaN for anything that is not a real date. */
export function parseDay(day: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return NaN;
  const time = Date.parse(`${day}T00:00:00Z`);
  return Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== day ? NaN : time;
}

export const formatDay = (time: number) => new Date(time).toISOString().slice(0, 10);

export const addDays = (day: string, days: number) => formatDay(parseDay(day) + days * DAY_MS);

/** 0 for the first day of the week, 6 for the last. */
export function weekdayIndex(day: string, weekStartsOn: 0 | 1): number {
  const sundayFirst = new Date(parseDay(day)).getUTCDay();
  return (sundayFirst - weekStartsOn + 7) % 7;
}

/**
 * The weeks from start to end inclusive, each seven days long and starting on
 * weekStartsOn. Days outside the range are null, so the first and last weeks
 * can be partial.
 */
export function calendarWeeks(
  start: string,
  end: string,
  weekStartsOn: 0 | 1,
): (string | null)[][] {
  const from = parseDay(start);
  const to = parseDay(end);
  if (Number.isNaN(from) || Number.isNaN(to) || to < from) return [];
  const weeks: (string | null)[][] = [];
  let cursor = from - weekdayIndex(start, weekStartsOn) * DAY_MS;
  while (cursor <= to) {
    weeks.push(
      Array.from({ length: 7 }, (_, i) => {
        const time = cursor + i * DAY_MS;
        return time >= from && time <= to ? formatDay(time) : null;
      }),
    );
    cursor += 7 * DAY_MS;
  }
  return weeks;
}

/**
 * Which shade a value gets: 0 for nothing (zero, negative, or missing), else
 * 1 to `levels`, splitting (0, max] into equal steps.
 */
export function heatLevel(value: number | undefined, max: number, levels: number): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0 || max <= 0) return 0;
  return Math.min(levels, Math.max(1, Math.ceil((value / max) * levels)));
}
