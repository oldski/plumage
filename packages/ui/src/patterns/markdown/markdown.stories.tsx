import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Markdown } from "./markdown";

const NOTE = `## Summary

Spending is **on plan** for most of the month. Groceries ran ahead of budget.

## Things Worth Focusing On

1. The store card's 0% rate ends in December.
2. Dining out is above its three-month average.

- A question to ask: is the gym membership still used?
- [This link](https://example.com) is shown as text.`;

const meta = {
  title: "Patterns/Markdown",
  component: Markdown,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Markdown written somewhere else, such as an AI-written note, shown with Plumage's type
styles. Only headings, paragraphs, lists, bold, and italics render; links, tables, code,
images, and raw HTML are unwrapped to plain text.

**Do**
- Use it for text you did not write and cannot fully trust.
- Ask the writer (or the model) for the same small set of elements.

**Don't**
- Use it for your own UI copy. Write components instead.
- Expect links to work. They are shown as their text on purpose.

**Accessibility**
- Headings start at level 2, so the page's own title stays the only level 1.
- Lists stay real lists, so screen readers announce their length.
`,
      },
    },
  },
  args: { children: NOTE },
} satisfies Meta<typeof Markdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Note: Story = {
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    await expect(canvas.getByRole("heading", { level: 2, name: "Summary" })).toBeVisible();
    await expect(canvas.getByText(/This link is shown as text/)).toBeVisible();
    await expect(canvas.queryByRole("link")).toBeNull();
  },
};
