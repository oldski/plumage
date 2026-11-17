import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId } from "react";
import { expect, userEvent } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Label } from "../label/label";
import { Checkbox, type CheckboxProps } from "./checkbox";

// useId keeps label and control paired when a story renders more than once
// (the all-brands view), exactly as an app would.
function CheckboxField(props: CheckboxProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-sm">
      <Checkbox id={id} {...props} />
      <Label htmlFor={id}>Include cash in allocation</Label>
    </div>
  );
}

const meta = {
  title: "Primitives/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
A yes or no choice that takes effect when a form is submitted.

**Do**
- Phrase the label so "checked" means yes.
- Use \`checked="indeterminate"\` on a parent whose children are partly selected.

**Don't**
- Use a checkbox for a setting that applies immediately. Use \`Switch\`.

**Accessibility**
- Space toggles; the label is a click target too.
- Unchecked boxes use \`color.border.strong\` (at least 3:1). Checked boxes carry a check mark in \`color.text.on-accent\`, so the state never relies on the fill color.
- Sized by \`checkbox.size\`, which follows density.
`,
      },
    },
  },
  render: (args) => <CheckboxField {...args} />,
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const checkbox = storyCanvas(canvasElement).getByRole("checkbox", {
      name: "Include cash in allocation",
    });
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(checkbox).not.toBeChecked();
  },
};

export const Checked: Story = { args: { defaultChecked: true } };

export const Indeterminate: Story = {
  args: { checked: "indeterminate" },
  play: async ({ canvasElement }) => {
    await expect(storyCanvas(canvasElement).getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "mixed",
    );
  },
};

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
