import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, type ComponentProps } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Label } from "../label/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

const meta = {
  title: "Primitives/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Picks one value from a list.

**Do**
- Label it with a visible \`Label\` whose \`htmlFor\` matches the trigger's \`id\`.
- Use a placeholder that describes the choice, and a sensible default where one exists.

**Don't**
- Use a select for fewer than three options; radio buttons or tabs are faster.
- Use it to trigger actions. Use \`DropdownMenu\`.

**Accessibility**
- Enter, Space, or Arrow Down opens it; arrows move; typing jumps; Enter selects; Escape closes.
- The trigger border uses \`color.border.strong\` (at least 3:1), like Input.
`,
      },
    },
  },
  render: (args) => <ModelSelect {...args} />,
} satisfies Meta<typeof Select>;

function ModelSelect(props: ComponentProps<typeof Select>) {
  const id = useId();
  return (
    <div className="flex flex-col gap-xs">
      <Label htmlFor={id}>Model</Label>
      <Select {...props}>
        <SelectTrigger id={id} className="w-overlay-xs">
          <SelectValue placeholder="Choose a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Claude</SelectLabel>
            <SelectItem value="claude-sonnet-5-5">Sonnet 5.5</SelectItem>
            <SelectItem value="claude-opus-5-5">Opus 5.5</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectItem value="off" disabled>
            Analysis off
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = storyCanvas(canvasElement).getByRole("combobox", { name: "Model" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const listbox = await within(document.body).findByRole("listbox");
    await userEvent.click(within(listbox).getByRole("option", { name: "Opus 5.5" }));
    await waitFor(() => expect(trigger).toHaveTextContent("Opus 5.5"));
  },
};

export const WithDefault: Story = { args: { defaultValue: "claude-sonnet-5-5" } };
