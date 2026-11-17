import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleCheckIcon, ClockIcon, InfoIcon, OctagonXIcon } from "lucide-react";
import { expect } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta = {
  title: "Primitives/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
A callout that stays on the page.

**Do**
- Match the icon to the tone, and say what to do next in the description.
- Use \`warning\` when data is stale or partial, \`negative\` when something failed.
- Pass \`role="alert"\` only for urgent messages that appear while someone is working.

**Don't**
- Use an alert for transient confirmations; use a toast.
- Stack several alerts; combine them or fix the cause.

**Accessibility**
- Not a live region unless you pass a role, so static notices are not re-announced.
- Body text on every tinted background is checked at 4.5:1 for every brand and mode.
`,
      },
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj;

export const Tones: Story = {
  render: () => (
    <div className="flex max-w-overlay-lg flex-col gap-sm">
      <Alert tone="info">
        <InfoIcon aria-hidden />
        <AlertTitle>Prices are from your imported activity</AlertTitle>
        <AlertDescription>
          Each holding uses its last trade price until live quotes are connected.
        </AlertDescription>
      </Alert>
      <Alert tone="warning">
        <ClockIcon aria-hidden />
        <AlertTitle>Data is 3 days old</AlertTitle>
        <AlertDescription>
          Import a newer activity report to bring positions up to date.
        </AlertDescription>
      </Alert>
      <Alert tone="positive">
        <CircleCheckIcon aria-hidden />
        <AlertTitle>Import complete</AlertTitle>
        <AlertDescription>142 transactions added, 18 duplicates skipped.</AlertDescription>
      </Alert>
      <Alert tone="negative" role="alert">
        <OctagonXIcon aria-hidden />
        <AlertTitle>That file is not an activity report</AlertTitle>
        <AlertDescription>
          Export Account activity as CSV from Reports and statements, then try again.
        </AlertDescription>
      </Alert>
      <Alert>
        <AlertTitle>Without an icon</AlertTitle>
        <AlertDescription>The title and description take the full width.</AlertDescription>
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(storyCanvas(canvasElement).getByRole("alert")).toHaveTextContent(
      "That file is not an activity report",
    );
  },
};
