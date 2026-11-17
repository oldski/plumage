import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, type ComponentProps } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { EXIT_TIMEOUT, storyCanvas } from "../../stories/story-canvas";
import { Button } from "../button/button";
import { Input } from "../input/input";
import { Label } from "../label/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const meta = {
  title: "Primitives/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
A modal window for a short, focused task.

**Do**
- Title it with what the user is doing ("Rename account"), and say what happens next in the description.
- Put the confirming action last in the footer, with a specific label ("Disconnect", not "OK").

**Don't**
- Open a dialog on page load, or stack dialogs.
- Use a dialog for content people need to compare with the page. Use \`Sheet\`.

**Accessibility**
- Focus moves into the dialog on open, is trapped while open, and returns to the trigger on close.
- Escape and the overlay close it; the corner button has an accessible name.
- \`DialogTitle\` and \`DialogDescription\` label and describe it.
- Portals into the nearest Plumage scope, so it keeps the right brand, mode, and density.
`,
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function RenameDialog(props: ComponentProps<typeof Dialog>) {
  const id = useId();
  return (
    <Dialog {...props}>
      <DialogTrigger asChild>
        <Button variant="secondary">Rename account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename account</DialogTitle>
          <DialogDescription>
            Shown in this app only. The source account keeps its own name.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-xs">
          <Label htmlFor={id}>Nickname</Label>
          <Input id={id} defaultValue="Agentic" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const Default: Story = {
  render: (args) => <RenameDialog {...args} />,
  play: async ({ canvasElement }) => {
    const trigger = storyCanvas(canvasElement).getByRole("button", { name: "Rename account" });
    await userEvent.click(trigger);

    const dialog = await within(document.body).findByRole("dialog", { name: "Rename account" });
    await expect(dialog).toHaveAccessibleDescription(
      "Shown in this app only. The source account keeps its own name.",
    );
    await waitFor(() => expect(within(dialog).getByLabelText("Nickname")).toHaveFocus());

    await userEvent.keyboard("{Escape}");
    await waitFor(
      () => expect(within(document.body).queryByRole("dialog")).toBeNull(),
      EXIT_TIMEOUT,
    );
    await expect(trigger).toHaveFocus();
  },
};
