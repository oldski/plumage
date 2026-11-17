import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Button } from "../button/button";
import { Toaster, toast } from "./toast";

const meta = {
  title: "Primitives/Toast",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Brief, non-blocking feedback raised with \`toast()\`. Built on Sonner, unstyled and dressed in Plumage tokens.

**Do**
- Confirm completed background work: "Snapshot saved".
- Use \`toast.error\` with a next step when something fails.
- Mount one \`<Toaster />\` inside the app's \`PlumageProvider\`.

**Don't**
- Put the only copy of important information in a toast; it disappears.
- Toast for every click. Inline feedback is usually better.

**Accessibility**
- Toasts live in a labelled region that screen readers announce politely; Alt+T moves focus to it.
- Status icons carry color, and the text carries the meaning.
- Follows the provider's light or dark mode, and the pop motion stops under reduced motion.
`,
      },
    },
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-sm">
      <Toaster />
      <Button
        variant="secondary"
        onClick={() => toast.success("Snapshot saved", { description: "12 positions, $48,210.55" })}
      >
        Snapshot now
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.error("Account refresh failed", { description: "Reconnect in Settings." })
        }
      >
        Simulate an error
      </Button>
      <Button variant="secondary" onClick={() => toast.warning("Prices are 15 minutes old")}>
        Stale data
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(storyCanvas(canvasElement).getByRole("button", { name: "Snapshot now" }));
    // toast() is global: in the all-brands view every copy's Toaster shows it.
    const [first] = await within(document.body).findAllByText("Snapshot saved");
    // Toasts mount transparent and fade in.
    await waitFor(() => expect(first).toBeVisible());
  },
};
