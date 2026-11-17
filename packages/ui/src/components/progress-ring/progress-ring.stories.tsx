import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { ProgressRing } from "./progress-ring";

const meta = {
  title: "Primitives/ProgressRing",
  component: ProgressRing,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
A round \`Progress\` for how close something is to a target: a savings goal, a debt paid off.

**Do**
- Put the numbers in text next to the ring ("$1,200 of $5,000 saved"), and pass the same
  words to \`getValueLabel\`.
- Use the \`lg\` size with a short figure in the middle ("24%"), or \`sm\` beside a line of
  text with nothing inside.
- Use \`tone="positive"\` when a target is reached, and say so in words.

**Don't**
- Use it for loading. Use \`Skeleton\`.
- Put more than a few characters in the middle.

**Accessibility**
- \`role="progressbar"\` with \`aria-valuenow\`, \`aria-valuemax\`, and \`aria-valuetext\`
  from \`getValueLabel\`. Always name it with \`aria-label\` or \`aria-labelledby\`.
- The figure in the middle is hidden from assistive tech, so the label must carry it.
- Sizes come from \`size.figure.sm\` and \`size.figure.lg\`, which follow density.
`,
      },
    },
  },
  args: {
    value: 1200,
    max: 5000,
    "aria-label": "Emergency fund",
    getValueLabel: (value: number, max: number) => `$${String(value)} of $${String(max)} saved`,
    children: "24%",
  },
} satisfies Meta<typeof ProgressRing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const ring = storyCanvas(canvasElement).getByRole("progressbar", { name: "Emergency fund" });
    await expect(ring).toHaveAttribute("aria-valuetext", "$1200 of $5000 saved");
  },
};

export const Small: Story = { args: { size: "sm", children: undefined } };

export const Reached: Story = {
  args: {
    tone: "positive",
    value: 5000,
    children: "100%",
    getValueLabel: () => "$5000 of $5000 saved, reached",
  },
};

export const Empty: Story = { args: { value: 0, children: "0%" } };
