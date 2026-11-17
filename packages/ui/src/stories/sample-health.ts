// Deterministic sample data for the health example screen. A generic day of
// activity, sleep, and meals; nothing here is real or tied to a product.
import { addDays } from "../lib/calendar";
import type { MeasureUnit } from "../lib/measure";

/** The day the sample describes; the visual suite fixes its clock to the same day. */
export const SAMPLE_DAY = "2026-10-30";

export interface DayTarget {
  key: string;
  label: string;
  /** How much so far, in unit. A duration is in minutes. */
  value: number;
  target: number;
  /** A Measure unit, or "steps" (a plain count). */
  unit: MeasureUnit | "steps";
}

export const dayTargets: DayTarget[] = [
  { key: "steps", label: "Steps", value: 8412, target: 10000, unit: "steps" },
  { key: "sleep", label: "Sleep", value: 432, target: 480, unit: "duration" },
  { key: "active", label: "Active time", value: 38, target: 30, unit: "duration" },
  { key: "energy", label: "Active energy", value: 412, target: 550, unit: "kcal" },
];

export interface Macro {
  key: string;
  label: string;
  /** Eaten so far today. */
  grams: number;
  /** The day's target. */
  target: number;
  /** Energy per gram, for splitting the day by calories. */
  kcalPerGram: number;
}

export const macros: Macro[] = [
  { key: "protein", label: "Protein", grams: 86, target: 140, kcalPerGram: 4 },
  { key: "carbs", label: "Carbs", grams: 164, target: 250, kcalPerGram: 4 },
  { key: "fat", label: "Fat", grams: 48, target: 70, kcalPerGram: 9 },
];

export interface DayEntry {
  /** As words: "7:10 AM". */
  time: string;
  /** Machine-readable, for <time dateTime>. */
  dateTime: string;
  title: string;
  description: string;
  status: "done" | "upcoming";
}

export const dayEntries: DayEntry[] = [
  {
    time: "6:40 AM",
    dateTime: `${SAMPLE_DAY}T06:40`,
    title: "Woke up",
    description: "7 h 12 min asleep, resting heart rate 52 bpm.",
    status: "done",
  },
  {
    time: "7:10 AM",
    dateTime: `${SAMPLE_DAY}T07:10`,
    title: "Easy run",
    description: "5.2 km in 31 min, mostly in zone 2.",
    status: "done",
  },
  {
    time: "8:05 AM",
    dateTime: `${SAMPLE_DAY}T08:05`,
    title: "Breakfast",
    description: "Oats, yogurt, and berries. 32 g protein.",
    status: "done",
  },
  {
    time: "12:20 PM",
    dateTime: `${SAMPLE_DAY}T12:20`,
    title: "Lunch",
    description: "Chicken and grain bowl. 41 g protein.",
    status: "done",
  },
  {
    time: "3:30 PM",
    dateTime: `${SAMPLE_DAY}T15:30`,
    title: "Snack",
    description: "Cottage cheese and an apple. 13 g protein.",
    status: "done",
  },
  {
    time: "6:00 PM",
    dateTime: `${SAMPLE_DAY}T18:00`,
    title: "Strength session",
    description: "Planned: 45 min, lower body.",
    status: "upcoming",
  },
  {
    time: "7:30 PM",
    dateTime: `${SAMPLE_DAY}T19:30`,
    title: "Dinner",
    description: "Planned: salmon, rice, and greens.",
    status: "upcoming",
  },
];

const DAYS = 7 * 12;
const reachedToday = dayTargets.filter((t) => t.value >= t.target).length;

/**
 * Targets met per day (0 to 4) for the 12 weeks ending on SAMPLE_DAY, from a
 * fixed pattern: rest days, a few full days, and a steadier last two weeks.
 * Today is still in progress, so it counts only what is already reached.
 */
export const consistency: { date: string; value: number }[] = Array.from(
  { length: DAYS },
  (_, i) => {
    const date = addDays(SAMPLE_DAY, i - DAYS + 1);
    if (i === DAYS - 1) return { date, value: reachedToday };
    const n = (i * 7919) % 13;
    const base = n < 2 ? 0 : n < 5 ? 1 : n < 8 ? 2 : n < 11 ? 3 : 4;
    return { date, value: i >= DAYS - 14 ? Math.max(base, 2 + (i % 3 === 0 ? 1 : 0)) : base };
  },
);
