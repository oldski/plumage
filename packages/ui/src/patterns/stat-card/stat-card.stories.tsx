import type { Meta, StoryObj } from "@storybook/react-vite";
import { InfoIcon } from "lucide-react";
import { expect } from "storybook/test";
import { Button } from "../../components/button/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/tooltip/tooltip";
import { formatNumber } from "../../lib/format";
import { portfolioTotal } from "../../stories/sample-data";
import { storyCanvas } from "../../stories/story-canvas";
import { Delta } from "../delta/delta";
import { StatCard } from "./stat-card";

const meta = {
  title: "Patterns/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  args: {
    label: "Total value",
    value: formatNumber(portfolioTotal, { format: "currency" }),
    delta: <Delta value={0.0124} period="today" />,
  },
  parameters: {
    docs: {
      description: {
        component: `
One headline number with its label and change.

**Do**
- Write the label in sentence case with no trailing colon: "Total value".
- Compact large values (\`formatNumber(v, { compact: true })\` gives $4.2M) unless the exact figure matters.
- Pair the value with a \`Delta\` that names its period.

**Don't**
- Turn a single number into a chart; the number is the chart.
- Put more than one figure in a card. Use several cards in a row.

**Accessibility**
- Label, value, and change form a description list, read together as one unit.
- \`loading\` swaps in skeletons and sets \`aria-busy\`.
- Values use proportional figures; tabular figures are for columns.
`,
      },
    },
  },
  render: (args) => (
    <div className="max-w-overlay-xs">
      <StatCard {...args} />
    </div>
  ),
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    await expect(canvas.getByRole("term")).toHaveTextContent("Total value");
    await expect(canvas.getByText("Up 1.24% today")).toBeInTheDocument();
  },
};

export const WithDescriptionAndAction: Story = {
  args: {
    label: "Cash",
    value: formatNumber(4210.55, { format: "currency" }),
    delta: undefined,
    description: "12% of portfolio",
    action: (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="About cash">
            <InfoIcon aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Settled cash, excluding pending deposits</TooltipContent>
      </Tooltip>
    ),
  },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-slot=stat-card]")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  },
};

export const Row: Story = {
  render: () => (
    <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total value"
        value={formatNumber(portfolioTotal, { format: "currency" })}
        delta={<Delta value={0.0124} period="today" />}
      />
      <StatCard
        label="Day change"
        value={formatNumber(312.4, { format: "currency", sign: "always" })}
        delta={<Delta value={312.4} format="currency" period="today" />}
      />
      <StatCard
        label="Unrealized P/L"
        value={formatNumber(2418.5, { format: "currency", compact: true })}
        delta={<Delta value={0.071} period="all time" />}
      />
      <StatCard
        label="Cash"
        value={formatNumber(4210.55, { format: "currency" })}
        description="12% of portfolio"
      />
    </div>
  ),
};
