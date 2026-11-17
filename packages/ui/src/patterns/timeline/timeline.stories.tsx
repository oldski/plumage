import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Timeline, TimelineItem } from "./timeline";

const meta = {
  title: "Patterns/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Dated moments in order, joined by a line: when each debt is paid off, the steps of a plan.

**Do**
- Give each item a short title and a date in words, with \`dateTime\` for machines.
- Mark what has already happened as \`status="done"\`, and say so in the words when it
  matters ("Paid off").
- Order the items yourself, usually oldest first.

**Don't**
- Use it for a long log. A table reads better past a dozen rows.

**Accessibility**
- An ordered list (\`ol\`), so screen readers announce the count and position.
- Dates are \`time\` elements. Markers and the line are decoration.
`,
      },
    },
  },
  render: () => (
    <div className="w-overlay-sm">
      <Timeline aria-label="Debt-free dates">
        <TimelineItem
          status="done"
          title="Store card"
          time="Paid off"
          description="Cleared in March 2026."
        />
        <TimelineItem
          title="Visa"
          time="August 2027"
          dateTime="2027-08"
          description="22 months from now, $1,840 in interest."
        />
        <TimelineItem
          title="Car loan"
          time="May 2029"
          dateTime="2029-05"
          description="The last one: debt-free."
        />
      </Timeline>
    </div>
  ),
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const list = storyCanvas(canvasElement).getByRole("list", { name: "Debt-free dates" });
    await expect(list.querySelectorAll("li")).toHaveLength(3);
  },
};
