import type { Meta, StoryObj } from "@storybook/react-vite";
import { RefreshCwIcon } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Button } from "../button/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const meta = {
  title: "Primitives/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
A short, supplementary label on hover and keyboard focus.

**Do**
- Use to name icon-only controls or explain an abbreviation.
- Keep it to a few words.

**Don't**
- Put essential information, links, or buttons in a tooltip. Touch screens never show it.
- Use it as the only accessible name; the trigger still needs \`aria-label\`.

**Accessibility**
- Opens on focus as well as hover; Escape dismisses it.
- Content is linked to the trigger with \`aria-describedby\`.
- Inverse colors (\`bg.inverse\`, \`text.inverse\`) are checked at 4.5:1.
`,
      },
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Refresh">
          <RefreshCwIcon aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Refresh positions and take a snapshot</TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(storyCanvas(canvasElement).getByRole("button", { name: "Refresh" })).toHaveFocus();
    const tip = await within(document.body).findByRole("tooltip");
    await expect(tip).toHaveTextContent("Refresh positions and take a snapshot");
    await userEvent.keyboard("{Escape}");
  },
};

export const AlwaysOpen: Story = {
  args: { open: true },
  render: Default.render,
};
