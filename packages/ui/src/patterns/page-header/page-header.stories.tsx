import type { Meta, StoryObj } from "@storybook/react-vite";
import { RefreshCwIcon } from "lucide-react";
import { expect } from "storybook/test";
import { Button } from "../../components/button/button";
import { storyCanvas } from "../../stories/story-canvas";
import { PageHeader } from "./page-header";

const meta = {
  title: "Patterns/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  args: {
    title: "Dashboard",
    description: "Holdings across every connected source, as of the last snapshot.",
    eyebrow: "Updated 2 minutes ago",
    actions: (
      <>
        <Button variant="secondary">
          <RefreshCwIcon aria-hidden /> Refresh
        </Button>
        <Button>Snapshot now</Button>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        component: `
The top of a page: its only h1, a one-sentence description, and page-level actions.

**Do**
- Use one per page; it renders the page's \`h1\`.
- Keep the description to one sentence about what the page is for.
- Put the primary action last, so it sits at the end of the row.

**Don't**
- Put filters here. Filters go in one row directly above the content they scope.

**Accessibility**
- The title is the page's \`h1\`; the eyebrow and description are plain text, so the outline stays clean.
`,
      },
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      storyCanvas(canvasElement).getByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeVisible();
  },
};

export const Separated: Story = { args: { separated: true } };

export const TitleOnly: Story = {
  args: { description: undefined, eyebrow: undefined, actions: undefined, title: "Settings" },
};
