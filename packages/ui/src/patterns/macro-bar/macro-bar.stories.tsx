import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Measure } from "../measure/measure";
import { MacroBar } from "./macro-bar";

const macros = [
  { key: "protein", label: "Protein", value: 520, display: <Measure value={130} unit="g" /> },
  { key: "carbs", label: "Carbs", value: 900, display: <Measure value={225} unit="g" /> },
  { key: "fat", label: "Fat", value: 630, display: <Measure value={70} unit="g" /> },
];

const meta = {
  title: "Patterns/MacroBar",
  component: MacroBar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
One whole split into a few parts, as a single stacked bar: protein, carbs, and fat by
calories, or any part-to-whole with up to eight parts. Each segment takes the next
categorical chart color; the legend gives each share as a whole percentage, and the
shares always add up to 100.

**Do**
- Give every segment a value in the same unit, the one the split is about (calories for
  macros, since a gram of fat is not a gram of protein). Show other units with \`display\`.
- Keep the order the same everywhere (protein, carbs, fat), so colors stay meaningful.

**Don't**
- Use it for progress toward a target. Use \`Progress\` or \`ProgressRing\`.
- Show more than a handful of parts; fold small ones into "Other" with \`foldToOther\`.

**Accessibility**
- A named group. The bar is decoration; the legend carries every number.
- With \`hideLegend\`, the bar becomes one image whose name lists every share.
`,
      },
    },
  },
  args: { label: "Today's macros by calories", segments: macros },
} satisfies Meta<typeof MacroBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <MacroBar {...args} className="w-overlay-sm" />,
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    await expect(
      canvas.getByRole("group", { name: "Today's macros by calories" }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("44%")).toBeInTheDocument();
  },
};

export const WithoutLegend: Story = {
  args: { hideLegend: true },
  render: (args) => <MacroBar {...args} className="w-overlay-sm" />,
  play: async ({ canvasElement }) => {
    await expect(
      storyCanvas(canvasElement).getByRole("img", {
        name: "Today's macros by calories: Protein 25%, Carbs 44%, Fat 31%",
      }),
    ).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { segments: macros.map((m) => ({ ...m, value: 0, display: undefined })) },
  render: (args) => <MacroBar {...args} className="w-overlay-sm" />,
};
