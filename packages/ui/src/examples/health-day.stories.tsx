import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CalendarDaysIcon,
  ChartLineIcon,
  HeartPulseIcon,
  SettingsIcon,
  SunIcon,
} from "lucide-react";
import { useId, useState } from "react";
import { expect } from "storybook/test";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card/card";
import { ProgressRing } from "../components/progress-ring/progress-ring";
import { addDays, parseDay } from "../lib/calendar";
import { formatNumber } from "../lib/format";
import { formatMeasure } from "../lib/measure";
import { AppShell, AppShellNav, AppShellNavItem } from "../patterns/app-shell/app-shell";
import { CalendarHeatmap } from "../patterns/calendar-heatmap/calendar-heatmap";
import { MacroBar } from "../patterns/macro-bar/macro-bar";
import { Measure } from "../patterns/measure/measure";
import { PageHeader } from "../patterns/page-header/page-header";
import { QuickAddBar } from "../patterns/quick-add-bar/quick-add-bar";
import { Timeline, TimelineItem } from "../patterns/timeline/timeline";
import {
  consistency,
  dayEntries,
  dayTargets,
  macros,
  SAMPLE_DAY,
  type DayTarget,
} from "../stories/sample-health";
import { storyCanvas } from "../stories/story-canvas";

const meta = {
  title: "Examples/Health day",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const longDate = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
}).format(parseDay(SAMPLE_DAY));

/** A target's amount as words: "8,412 steps", "7 h 12 min". */
function amount(value: number, unit: DayTarget["unit"]) {
  if (unit === "steps") {
    const text = `${formatNumber(value)} steps`;
    return { text, spoken: text };
  }
  return formatMeasure(value, unit);
}

function TargetRing({ target }: { target: DayTarget }) {
  const labelId = useId();
  const reached = target.value >= target.target;
  // Steps read "8,412 of 10,000 steps": the count needs its noun only once.
  const now =
    target.unit === "steps"
      ? { text: formatNumber(target.value), spoken: formatNumber(target.value) }
      : amount(target.value, target.unit);
  const goal = amount(target.target, target.unit);
  return (
    <div className="flex flex-col items-center gap-xs text-center">
      <ProgressRing
        value={target.value}
        max={target.target}
        tone={reached ? "positive" : "accent"}
        aria-labelledby={labelId}
        getValueLabel={() => `${now.spoken} of ${goal.spoken}${reached ? ", reached" : ""}`}
      >
        {formatNumber(Math.min(target.value / target.target, 1), {
          format: "percent",
          precision: 0,
        })}
      </ProgressRing>
      <div className="flex flex-col">
        <span id={labelId} className="text-label font-label text-default">
          {target.label}
        </span>
        <span className="text-caption text-muted">
          <span className="font-numeric tabular-nums">{now.text}</span> of {goal.text}
        </span>
      </div>
    </div>
  );
}

const macroSegments = macros.map((m) => ({
  key: m.key,
  label: m.label,
  value: m.grams * m.kcalPerGram,
  display: (
    <>
      <Measure value={m.grams} unit="g" /> of <Measure value={m.target} unit="g" />
    </>
  ),
}));
const kcalSoFar = macroSegments.reduce((sum, s) => sum + s.value, 0);

const consistencyValues = Object.fromEntries(consistency.map((d) => [d.date, d.value]));
const targetCount = dayTargets.length;

function LogBar() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("");
  return (
    <QuickAddBar
      compact
      hideLabel
      label="Log something"
      placeholder="Log a meal, a workout, or water"
      value={value}
      onValueChange={setValue}
      suggestions={[]}
      onSuggestionPick={() => undefined}
      onSubmit={() => {
        if (!value.trim()) return;
        setStatus(`Logged: ${value.trim()}`);
        setValue("");
      }}
      preview={value.trim() ? `Reads as: ${value.trim()}` : undefined}
      status={status}
      className="w-full max-w-overlay-sm"
    />
  );
}

function HealthDay() {
  return (
    <AppShell
      brand={
        <span className="flex items-center gap-sm font-display text-title font-heading">
          <HeartPulseIcon aria-hidden className="size-icon-lg text-accent" />
          Health
        </span>
      }
      nav={
        <AppShellNav>
          <AppShellNavItem href="#today" current icon={<SunIcon />}>
            Today
          </AppShellNavItem>
          <AppShellNavItem href="#trends" icon={<ChartLineIcon />}>
            Trends
          </AppShellNavItem>
          <AppShellNavItem href="#plan" icon={<CalendarDaysIcon />}>
            Plan
          </AppShellNavItem>
          <AppShellNavItem href="#settings" icon={<SettingsIcon />}>
            Settings
          </AppShellNavItem>
        </AppShellNav>
      }
      sidebarFooter="Synced from your devices this morning"
      header={<LogBar />}
    >
      <div className="flex flex-col gap-lg p-inset-lg">
        <PageHeader
          eyebrow={longDate}
          title="Today"
          description="Your targets, what you have eaten, and what is still planned."
        />

        <div className="grid gap-md xl:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-md xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle asChild>
                  <h2>Targets</h2>
                </CardTitle>
                <CardDescription>
                  {dayTargets.filter((t) => t.value >= t.target).length} of {targetCount} reached so
                  far.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-2 gap-md sm:grid-cols-4">
                  {dayTargets.map((target) => (
                    <li key={target.key}>
                      <TargetRing target={target} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="grid gap-md lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle asChild>
                    <h2>Macros</h2>
                  </CardTitle>
                  <CardDescription>
                    <Measure value={kcalSoFar} unit="kcal" /> so far, split by calories.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MacroBar label="Today's macros by calories" segments={macroSegments} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle asChild>
                    <h2>Consistency</h2>
                  </CardTitle>
                  <CardDescription>Targets met each day, last 12 weeks.</CardDescription>
                </CardHeader>
                <CardContent>
                  <CalendarHeatmap
                    label="Targets met, last 12 weeks"
                    values={consistencyValues}
                    start={addDays(SAMPLE_DAY, -(consistency.length - 1))}
                    end={SAMPLE_DAY}
                    today={SAMPLE_DAY}
                    max={targetCount}
                    levels={targetCount}
                    formatValue={(n) => `${String(n)} of ${String(targetCount)} targets met`}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle asChild>
                <h2>Day log</h2>
              </CardTitle>
              <CardDescription>Logged so far, then what is planned.</CardDescription>
            </CardHeader>
            <CardContent>
              <Timeline aria-label="Day log">
                {dayEntries.map((entry) => (
                  <TimelineItem
                    key={entry.dateTime}
                    status={entry.status}
                    title={entry.title}
                    time={entry.time}
                    dateTime={entry.dateTime}
                    description={entry.description}
                  />
                ))}
              </Timeline>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

export const Default: Story = {
  render: () => <HealthDay />,
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();
    await expect(canvas.getAllByRole("progressbar")).toHaveLength(dayTargets.length);
    await expect(
      canvas.getByRole("gridcell", { name: /Friday, October 30, 2026/ }),
    ).toHaveAttribute("aria-current", "date");
  },
};
