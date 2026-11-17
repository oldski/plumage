import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { convertMass } from "../../lib/measure";
import { storyCanvas } from "../../stories/story-canvas";
import { Measure } from "./measure";

const meta = {
  title: "Patterns/Measure",
  component: Measure,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
A value with its unit, formatted one way everywhere: \`72.5 kg\`, \`2,140 kcal\`, \`52 bpm\`,
\`7 h 32 min\`. Figures are tabular in the numeric font, a true minus sign marks a negative
change, and a narrow no-break space keeps the number with its unit.

Units: \`kg\`, \`lb\`, \`g\`, \`oz\`, \`kcal\`, \`bpm\`, \`ms\`, and \`duration\` (a value in minutes,
shown as hours and minutes). Each has a default precision; pass \`precision\` to change it.

**Do**
- Store one unit (metric) and convert for display with \`convertMass(value, "kg", "lb")\`,
  following the person's unit setting.
- Use \`sign="always"\` for a change ("+0.4 kg this week").

**Don't**
- Store a formatted or converted value.
- Mix units in one column of a table.

**Accessibility**
- The abbreviation is shown and hidden from assistive tech; the unit is read in words
  ("72.5 kilograms", "7 hours 32 minutes").
- A \`data\` element whose \`value\` holds the plain number for machines.
`,
      },
    },
  },
  args: { value: 72.54, unit: "kg" },
} satisfies Meta<typeof Measure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    await expect(canvas.getByText("72.5 kilograms")).toBeInTheDocument();
  },
};

export const Units: Story = {
  render: () => (
    <dl className="grid w-overlay-xs grid-cols-2 gap-y-2xs text-body">
      <dt className="text-muted">Weight</dt>
      <dd className="text-end">
        <Measure value={convertMass(72.54, "kg", "lb")} unit="lb" />
      </dd>
      <dt className="text-muted">Change this week</dt>
      <dd className="text-end">
        <Measure value={-0.45} unit="kg" sign="always" />
      </dd>
      <dt className="text-muted">Energy</dt>
      <dd className="text-end">
        <Measure value={2140} unit="kcal" />
      </dd>
      <dt className="text-muted">Protein</dt>
      <dd className="text-end">
        <Measure value={148} unit="g" />
      </dd>
      <dt className="text-muted">Resting heart rate</dt>
      <dd className="text-end">
        <Measure value={52} unit="bpm" />
      </dd>
      <dt className="text-muted">HRV</dt>
      <dd className="text-end">
        <Measure value={61} unit="ms" />
      </dd>
      <dt className="text-muted">Sleep</dt>
      <dd className="text-end">
        <Measure value={452} unit="duration" />
      </dd>
    </dl>
  ),
};
