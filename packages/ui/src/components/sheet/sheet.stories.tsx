import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, type ComponentProps } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { EXIT_TIMEOUT, storyCanvas } from "../../stories/story-canvas";
import { Button } from "../button/button";
import { Label } from "../label/label";
import { Switch } from "../switch/switch";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

const meta = {
  title: "Primitives/Sheet",
  component: SheetContent,
  tags: ["autodocs"],
  args: { side: "right" },
  parameters: {
    docs: {
      description: {
        component: `
A panel that slides in from an edge.

**Do**
- Use for filters, details, and settings that relate to the page behind.
- Prefer \`right\` for details and \`left\` for navigation; \`top\` and \`bottom\` suit short, full-width content.

**Don't**
- Put a multi-step flow in a sheet. Give it a page.

**Accessibility**
- Built on Radix Dialog: focus is trapped, Escape closes, focus returns to the trigger.
- Width comes from \`sheet.width\`; the slide uses the brand's motion tokens and stops under reduced motion.
`,
      },
    },
  },
  render: (args) => <DisplayOptions {...args} />,
} satisfies Meta<typeof SheetContent>;

function DisplayOptions(props: ComponentProps<typeof SheetContent>) {
  const basisId = useId();
  const smallId = useId();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">Display options</Button>
      </SheetTrigger>
      <SheetContent {...props}>
        <SheetHeader>
          <SheetTitle>Display options</SheetTitle>
          <SheetDescription>Choose what the positions table shows.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-md px-(--pl-sheet-padding)">
          <div className="flex items-center justify-between gap-sm">
            <Label htmlFor={basisId}>Show cost basis</Label>
            <Switch id={basisId} defaultChecked />
          </div>
          <div className="flex items-center justify-between gap-sm">
            <Label htmlFor={smallId}>Show positions under 1%</Label>
            <Switch id={smallId} />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default meta;
type Story = StoryObj<typeof meta>;

export const Right: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      storyCanvas(canvasElement).getByRole("button", { name: "Display options" }),
    );
    const sheet = await within(document.body).findByRole("dialog", { name: "Display options" });
    await userEvent.click(within(sheet).getByRole("button", { name: "Done" }));
    await waitFor(
      () => expect(within(document.body).queryByRole("dialog")).toBeNull(),
      EXIT_TIMEOUT,
    );
  },
};

export const Left: Story = { args: { side: "left" } };
export const Bottom: Story = { args: { side: "bottom" } };
