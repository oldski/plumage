import type { Meta, StoryObj } from "@storybook/react-vite";
import { DownloadIcon, PencilIcon, UnplugIcon } from "lucide-react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { EXIT_TIMEOUT, storyCanvas } from "../../stories/story-canvas";
import { Button } from "../button/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const meta = {
  title: "Primitives/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
A list of actions opened from a button.

**Do**
- Group related items with labels and separators; put destructive items last.
- Use checkbox and radio items for view options that apply immediately.

**Don't**
- Hide the page's primary action in a menu.
- Use a menu to pick a form value. Use \`Select\`.

**Accessibility**
- Enter, Space, or Arrow Down opens it; arrows move; typing jumps to a matching item; Escape closes and returns focus.
- Highlight uses the translucent \`bg.hover\` wash, so text keeps its checked contrast.
`,
      },
    },
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

function AccountMenu() {
  const [showSmall, setShowSmall] = useState(true);
  const [sort, setSort] = useState("value");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Account</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Agentic account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <PencilIcon aria-hidden /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem>
            <DownloadIcon aria-hidden /> Export CSV
            <DropdownMenuShortcut>E</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={showSmall} onCheckedChange={setShowSmall}>
          Show positions under 1%
        </DropdownMenuCheckboxItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger inset>Sort by</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
              <DropdownMenuRadioItem value="value">Market value</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="change">Day change</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="symbol">Symbol</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <UnplugIcon aria-hidden /> Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const Default: Story = {
  render: () => <AccountMenu />,
  play: async ({ canvasElement }) => {
    const trigger = storyCanvas(canvasElement).getByRole("button", { name: "Account" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const menu = await within(document.body).findByRole("menu");
    // Radix focuses the first item only when it detects keyboard use, so
    // assert focus moved into the menu, then use typeahead, which behaves the
    // same either way.
    await waitFor(() => expect(menu).toContainElement(document.activeElement as HTMLElement));
    await userEvent.keyboard("e");
    await expect(within(menu).getByRole("menuitem", { name: /Export CSV/ })).toHaveFocus();
    await expect(
      within(menu).getByRole("menuitemcheckbox", { name: "Show positions under 1%" }),
    ).toBeChecked();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(within(document.body).queryByRole("menu")).toBeNull(), EXIT_TIMEOUT);
    await expect(trigger).toHaveFocus();
  },
};
