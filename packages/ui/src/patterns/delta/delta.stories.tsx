import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Delta } from "./delta";

const meta = {
  title: "Patterns/Delta",
  component: Delta,
  tags: ["autodocs"],
  args: { value: 0.0124, period: "today" },
  parameters: {
    docs: {
      description: {
        component: `
A signed change, with direction carried three ways: arrow, sign, and color.

**Do**
- Pass the raw change: \`0.0124\` with \`format="percent"\` shows +1.24%.
- Name the comparison with \`period\` ("today", "vs last snapshot").
- Set \`invert\` when a decrease is good (fees, volatility, drawdown).
- Use \`threshold\` so tiny changes read as unchanged instead of flickering red and green.

**Don't**
- Color a bare number yourself; use Delta so the arrow, sign, and spoken text stay consistent.

**Accessibility**
- Arrow and visible text are hidden from screen readers, which hear words instead: "Down 0.80% today", never "minus" or a color.
- Colors are the text-safe feedback tokens, checked at 4.5:1 on every surface and on their subtle backgrounds (badge variant).
`,
      },
    },
  },
} satisfies Meta<typeof Delta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(storyCanvas(canvasElement).getByText("Up 1.24% today")).toBeInTheDocument();
  },
};

export const Directions: Story = {
  render: () => (
    <div className="flex flex-col gap-xs">
      <Delta value={0.0124} period="today" />
      <Delta value={-0.008} period="today" />
      <Delta value={0.00004} threshold={0.0001} period="today" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    await expect(canvas.getByText("Down 0.80% today")).toBeInTheDocument();
    await expect(canvas.getByText("Unchanged today")).toBeInTheDocument();
  },
};

export const Formats: Story = {
  render: () => (
    <div className="flex flex-col gap-xs">
      <Delta value={0.0213} format="percent" />
      <Delta value={-210.1} format="currency" />
      <Delta value={1204.11} format="currency" period="unrealized" />
      <Delta value={3} format="number" period="positions" />
    </div>
  ),
};

/** For metrics where down is good: the arrow points down, the color says good. */
export const Inverted: Story = {
  args: { value: -0.0015, invert: true, period: "fees vs last year" },
};

export const Badge: Story = {
  render: () => (
    <div className="flex flex-wrap gap-sm">
      <Delta value={0.0124} variant="badge" size="sm" />
      <Delta value={-0.008} variant="badge" size="sm" />
      <Delta value={0} variant="badge" size="sm" />
    </div>
  ),
};
