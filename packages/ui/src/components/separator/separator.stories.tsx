import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./separator";

const meta = {
  title: "Primitives/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
A thin dividing line.

**Do**
- Use spacing first; reach for a separator when spacing alone does not read as a break.
- Set \`decorative={false}\` when the line separates meaningful groups, so screen readers hear it.

**Don't**
- Stack separators with borders; one boundary is enough.

**Accessibility**
- Decorative by default (\`role="none"\`). Non-decorative separators get \`role="separator"\` and \`aria-orientation\`.
`,
      },
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="flex max-w-overlay-sm flex-col gap-sm">
      <p className="text-body">Positions</p>
      <Separator />
      <p className="text-body text-muted">12 holdings across 2 sources</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-control-md items-center gap-sm text-body">
      <span>Dashboard</span>
      <Separator orientation="vertical" />
      <span>History</span>
      <Separator orientation="vertical" />
      <span>Finch Notes</span>
    </div>
  ),
};
