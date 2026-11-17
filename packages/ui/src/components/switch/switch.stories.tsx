import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId } from "react";
import { expect, userEvent } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Label } from "../label/label";
import { Switch, type SwitchProps } from "./switch";

function SwitchField(props: SwitchProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-sm">
      <Switch id={id} {...props} />
      <Label htmlFor={id}>Show cost basis</Label>
    </div>
  );
}

const meta = {
  title: "Primitives/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Turns a setting on or off, effective immediately.

**Do**
- Use for preferences that apply right away, like "Show cost basis".
- Keep the label the same in both states; the switch shows the state.

**Don't**
- Use inside a form that needs a submit step. Use \`Checkbox\`.

**Accessibility**
- \`role="switch"\` with \`aria-checked\`; Space and Enter toggle.
- The off track uses \`color.border.strong\` (at least 3:1). The thumb position is the state signal; color reinforces it.
- Track and thumb sizes are component tokens that follow density.
`,
      },
    },
  },
  render: (args) => <SwitchField {...args} />,
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const toggle = storyCanvas(canvasElement).getByRole("switch", { name: "Show cost basis" });
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(toggle).not.toBeChecked();
  },
};

export const On: Story = { args: { defaultChecked: true } };

export const Disabled: Story = { args: { disabled: true } };
