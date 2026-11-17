import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Badge } from "./badge";

const meta = {
  title: "Primitives/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "Agentic account" },
  parameters: {
    docs: {
      description: {
        component: `
A short label for status or category.

**Do**
- Choose the tone by meaning: \`positive\`, \`negative\`, \`warning\`, \`info\` for status; \`neutral\`, \`accent\`, \`outline\` for categories.
- Put the meaning in the text ("Stale data", "Up 2.1%").

**Don't**
- Rely on tone alone. Red text that only says "2.1%" loses its meaning for many readers.
- Make a badge clickable without \`asChild\` on a real button or link.

**Accessibility**
- Every tone pairs its text token with its subtle background, checked at 4.5:1 for every brand and mode.
`,
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-sm">
      <Badge tone="neutral">CSV import</Badge>
      <Badge tone="accent">Agentic account</Badge>
      <Badge tone="positive">
        <ArrowUpIcon aria-hidden /> Up 2.1%
      </Badge>
      <Badge tone="negative">
        <ArrowDownIcon aria-hidden /> Down 0.8%
      </Badge>
      <Badge tone="warning">Stale data</Badge>
      <Badge tone="info">Long term</Badge>
      <Badge tone="outline">ETF</Badge>
    </div>
  ),
};
