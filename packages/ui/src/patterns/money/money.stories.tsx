import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Money } from "./money";

const meta = {
  title: "Patterns/Money",
  component: Money,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
An amount of money, formatted one way everywhere: the currency symbol, a true minus sign
(U+2212), and tabular figures in the numeric font, so a column of amounts lines up.

**Do**
- Pass dollars for display (\`toDollars(cents)\`). Keep stored money in integer cents.
- Use \`sign="always"\` for changes and transactions, where the direction matters.
- Right-align amounts in table columns.

**Don't**
- Color every negative amount red. Spending is not an alarm; use \`Delta\` for a change.
- Do arithmetic on the displayed text.

**Accessibility**
- A \`data\` element whose \`value\` holds the plain number for machines.
- Screen readers read the true minus sign as "minus".
`,
      },
    },
  },
  args: { value: -56.78 },
} satisfies Meta<typeof Money>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const money = storyCanvas(canvasElement).getByText("−$56.78");
    await expect(money).toHaveAttribute("value", "-56.78");
  },
};

export const Column: Story = {
  render: () => (
    <ul className="flex w-overlay-xs flex-col items-end text-body">
      <li>
        <Money value={1234.5} sign="always" />
      </li>
      <li>
        <Money value={-42.18} sign="always" />
      </li>
      <li>
        <Money value={7} sign="always" />
      </li>
    </ul>
  ),
};

export const Compact: Story = { args: { value: 4_210_000, compact: true } };
