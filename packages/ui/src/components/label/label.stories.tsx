import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId } from "react";
import { expect, userEvent } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Checkbox } from "../checkbox/checkbox";
import { Label } from "./label";

function LongTermField() {
  const id = useId();
  return (
    <div className="flex items-center gap-sm">
      <Checkbox id={id} />
      <Label htmlFor={id}>Only long-term holdings</Label>
    </div>
  );
}

const meta = {
  title: "Primitives/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Names a form control.

**Do**
- Connect it with \`htmlFor\`, or wrap the control.
- Keep it short and specific: "Account nickname", not "Name".

**Don't**
- Replace it with placeholder text or a tooltip.

**Accessibility**
- Built on Radix Label: clicking the label focuses or toggles its control, which enlarges the click target.
- Dims with the control when the control (marked \`peer\`) is disabled.
`,
      },
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCheckbox: Story = {
  render: () => <LongTermField />,
  play: async ({ canvasElement }) => {
    // The label names the control. (Clicking the label toggles it in a real
    // browser; test/label.test.tsx covers that in jsdom.)
    const checkbox = storyCanvas(canvasElement).getByRole("checkbox", {
      name: "Only long-term holdings",
    });
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
  },
};
