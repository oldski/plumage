import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Progress } from "./progress";

const meta = {
  title: "Primitives/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Shows how much of a limit is used or done: a category's budget spent, a goal saved.

**Do**
- Put the numbers in text next to the bar ("$420 of $500"), and pass the same words
  to \`getValueLabel\`.
- Use \`tone="warning"\` when a value passes its limit, and say "over" in the text.

**Don't**
- Use it for loading. Use \`Skeleton\`.
- Turn every bar a color: tone is for the few that need attention.

**Accessibility**
- \`role="progressbar"\` with \`aria-valuenow\`, \`aria-valuemax\`, and \`aria-valuetext\`
  from \`getValueLabel\`. Always name it with \`aria-label\` or \`aria-labelledby\`.
- The track is \`color.background.sunken\`; the fill is a brand or feedback color.
- Values past the limit draw a full bar, so the text must carry the overage.
`,
      },
    },
  },
  args: {
    value: 420,
    max: 500,
    "aria-label": "Groceries",
    getValueLabel: (value: number, max: number) => `$${String(value)} of $${String(max)}`,
  },
  render: (args) => (
    <div className="w-overlay-sm">
      <Progress {...args} />
    </div>
  ),
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const bar = storyCanvas(canvasElement).getByRole("progressbar", { name: "Groceries" });
    await expect(bar).toHaveAttribute("aria-valuetext", "$420 of $500");
  },
};

export const Positive: Story = { args: { tone: "positive", value: 500 } };

export const Over: Story = {
  args: {
    tone: "warning",
    value: 560,
    getValueLabel: () => "$560 of $500, $60 over",
  },
};

export const Empty: Story = { args: { value: 0 } };
