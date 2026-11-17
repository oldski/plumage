import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useState } from "react";
import { expect, userEvent } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Label } from "../label/label";
import { NumberInput, type NumberInputProps } from "./number-input";

const meta = {
  title: "Primitives/NumberInput",
  component: NumberInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
A field for amounts, rates, and counts. It keeps the typed text as a string; parse it in the
app (money into integer cents with \`parseCents\`, never a float).

**Do**
- Say the unit in the label ("Extra each month, in dollars"); the prefix or suffix is
  decoration.
- Give a \`step\` where nudging makes sense: Arrow Up and Down step, Shift steps ten times.
- Show what was understood after parsing, near the field, when the input is forgiving.

**Don't**
- Use \`type="number"\`. Browsers reject commas and spin values with the scroll wheel.
- Use it for numbers that are really codes (ZIP codes, account numbers). Use Input.

**Accessibility**
- A decimal keyboard on phones (\`inputMode="decimal"\`).
- Figures are right-aligned and tabular, so values line up with the column below.
`,
      },
    },
  },
  args: { prefix: "$", step: 1, min: 0 },
  render: (args) => <Extra {...args} />,
} satisfies Meta<typeof NumberInput>;

function Extra(props: NumberInputProps) {
  const id = useId();
  const [text, setText] = useState("200");
  return (
    <div className="flex w-overlay-xs flex-col gap-xs">
      <Label htmlFor={id}>Extra each month, in dollars</Label>
      <NumberInput id={id} {...props} value={text} onValueChange={setText} />
    </div>
  );
}

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const field = storyCanvas(canvasElement).getByLabelText("Extra each month, in dollars");
    await userEvent.click(field);
    await userEvent.keyboard("{ArrowUp}{Shift>}{ArrowUp}{/Shift}");
    await expect(field).toHaveValue("211");
  },
};

export const Rate: Story = { args: { prefix: undefined, suffix: "%", step: 0.01 } };

export const Invalid: Story = { args: { "aria-invalid": true } };
