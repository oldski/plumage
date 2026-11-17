import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileUpIcon, SearchXIcon } from "lucide-react";
import { expect } from "storybook/test";
import { Button } from "../../components/button/button";
import { Card } from "../../components/card/card";
import { storyCanvas } from "../../stories/story-canvas";
import { EmptyState } from "./empty-state";

const meta = {
  title: "Patterns/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Explains why there is nothing to show, and offers the next step.

**Do**
- Say why it is empty in plain words, then give one clear action.
- Distinguish first-run ("Import a CSV to see positions") from no-results ("No positions match VTX").
- Pick \`titleAs\` to fit the page outline; use \`"p"\` inside something that already has a heading.

**Don't**
- Show a bare "No data". It does not say whether something is wrong.
- Offer several competing actions.

**Accessibility**
- The icon is decorative and hidden; the title and description carry the message.
`,
      },
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj;

export const FirstRun: Story = {
  render: () => (
    <Card className="max-w-overlay-md">
      <EmptyState
        icon={<FileUpIcon />}
        title="No positions yet"
        description="Import an account statement as CSV, or connect a data source in Settings."
        action={
          <>
            <Button>Import CSV</Button>
            <Button variant="ghost">Open settings</Button>
          </>
        }
      />
    </Card>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      storyCanvas(canvasElement).getByRole("heading", { name: "No positions yet" }),
    ).toBeVisible();
  },
};

export const NoResults: Story = {
  render: () => (
    <EmptyState
      titleAs="p"
      icon={<SearchXIcon />}
      title={"No positions match “VTX”"}
      description="Check the spelling, or clear the search to see everything."
      action={<Button variant="secondary">Clear search</Button>}
    />
  ),
};
