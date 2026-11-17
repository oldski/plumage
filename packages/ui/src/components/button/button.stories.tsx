import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRightIcon, PlusIcon, TrashIcon } from "lucide-react";
import { expect, fn, userEvent } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Button } from "./button";

const meta = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Analyze portfolio", onClick: fn() },
  parameters: {
    docs: {
      description: {
        component: `
Triggers an action.

**Do**
- Use one \`primary\` button per view, for the action you most want taken.
- Label with a verb: "Snapshot now", not "OK".
- Give icon-only buttons an \`aria-label\`.

**Don't**
- Use a button to navigate. Wrap a link with \`asChild\` instead, so it stays a real link.
- Use \`destructive\` for anything that can be undone.

**Accessibility**
- Native \`<button>\`, with \`type="button"\` by default so it never submits a form by accident.
- Focus ring uses \`color.border.focus\` (at least 3:1 in every brand and mode).
- \`primary\` text uses \`color.text.on-accent\`, chosen per brand to reach 4.5:1 on the accent.
`,
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ args, canvasElement }) => {
    const button = storyCanvas(canvasElement).getByRole("button", { name: "Analyze portfolio" });
    await userEvent.click(button);
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-sm">
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="destructive">
        Disconnect
      </Button>
      <Button {...args} variant="link">
        Link
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-sm">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
      <Button {...args} size="icon-sm" variant="secondary" aria-label="Add holding">
        <PlusIcon aria-hidden />
      </Button>
      <Button {...args} size="icon" variant="secondary" aria-label="Add holding">
        <PlusIcon aria-hidden />
      </Button>
      <Button {...args} size="icon-lg" variant="secondary" aria-label="Add holding">
        <PlusIcon aria-hidden />
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        Continue <ArrowRightIcon aria-hidden />
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    variant: "ghost",
    size: "icon",
    "aria-label": "Delete note",
    children: <TrashIcon aria-hidden />,
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const button = storyCanvas(canvasElement).getByRole("button");
    await expect(button).toBeDisabled();
    // Disabled buttons also get pointer-events: none, so force the attempt.
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/** Do: navigate with a real link styled as a button. */
export const AsLink: Story = {
  args: {
    asChild: true,
    variant: "secondary",
    children: <a href="#import">Import CSV</a>,
  },
  play: async ({ canvasElement }) => {
    await expect(
      storyCanvas(canvasElement).getByRole("link", { name: "Import CSV" }),
    ).toBeVisible();
  },
};
