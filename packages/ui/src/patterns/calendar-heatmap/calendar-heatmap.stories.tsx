import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { addDays } from "../../lib/calendar";
import { storyCanvas } from "../../stories/story-canvas";
import { CalendarHeatmap } from "./calendar-heatmap";

const END = "2026-10-30";
const START = addDays(END, -7 * 26 + 1);

/** Half a year of workouts, the same every time: rest days, some doubles, a recent streak. */
const workouts: Record<string, number> = {};
for (let i = 0; i < 7 * 26; i += 1) {
  const day = addDays(START, i);
  const n = (i * 7919) % 11;
  const value = i > 7 * 26 - 12 ? 1 + (i % 2) : n < 5 ? 0 : n < 9 ? 1 : n < 10 ? 2 : 3;
  if (value > 0) workouts[day] = value;
}

const plural = (n: number) => `${String(n)} ${n === 1 ? "workout" : "workouts"}`;

const meta = {
  title: "Patterns/CalendarHeatmap",
  component: CalendarHeatmap,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Days as shaded squares, one column per week, for streaks and consistency: workouts,
logged meals, nights with enough sleep. Shades come from the sequential chart scale
(empty days use the sunken background), and \`today\` is outlined in the brand's chart
highlight color.

**Do**
- Pass values keyed by plain date (\`"2026-10-30"\`), already counted per day.
- Say what a value means with \`formatValue\` ("3 workouts", "7 h 32 min").
- Keep a few levels (the default is 4); more shades are harder to tell apart.

**Don't**
- Use it for exact comparisons between days. Use a bar chart.
- Rely on the shading to carry the number: the words in each day's name do.

**Accessibility**
- An ARIA grid named by \`label\`, one row per weekday with a row header.
- One Tab stop. Arrow keys move by day (up and down) and by week (left and right);
  Home and End go to the first and last day.
- Each day is named with its full date and its value in words; today has
  \`aria-current="date"\`.
- The month labels and the Less to More key are decoration and hidden from assistive tech.
`,
      },
    },
  },
  args: {
    label: "Workouts, last 26 weeks",
    values: workouts,
    start: START,
    end: END,
    today: END,
    formatValue: plural,
  },
} satisfies Meta<typeof CalendarHeatmap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    const today = canvas.getByRole("gridcell", { name: /Friday, October 30, 2026/ });
    await expect(today).toHaveAttribute("aria-current", "date");
    today.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(
      canvas.getByRole("gridcell", { name: /Thursday, October 29, 2026/ }),
    ).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    (document.activeElement as HTMLElement | null)?.blur();
  },
};

export const FewWeeks: Story = {
  args: { start: addDays(END, -27), label: "Workouts, last 4 weeks" },
};

export const SundayFirst: Story = {
  args: { weekStartsOn: 0, start: addDays(END, -27), label: "Workouts, last 4 weeks" },
};
