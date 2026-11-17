import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId } from "react";
import { expect, userEvent } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Label } from "../label/label";
import { Input, type InputProps } from "./input";

function SymbolField(props: InputProps) {
  const id = useId();
  return (
    <div className="flex w-overlay-sm flex-col gap-xs">
      <Label htmlFor={id}>Symbol</Label>
      <Input id={id} {...props} />
    </div>
  );
}

function QuantityField() {
  const id = useId();
  return (
    <div className="flex w-overlay-sm flex-col gap-xs">
      <Label htmlFor={id}>Quantity</Label>
      <Input
        id={id}
        type="number"
        defaultValue={-3}
        aria-invalid
        aria-describedby={`${id}-error`}
      />
      <p id={`${id}-error`} className="text-caption text-negative">
        Quantity must be zero or more.
      </p>
    </div>
  );
}

const meta = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Single-line text entry.

**Do**
- Pair every input with a visible \`Label\`.
- Show errors in text next to the field and connect them with \`aria-describedby\`.
- Use the right \`type\` (\`email\`, \`number\`, \`search\`) for better keyboards and autofill.

**Don't**
- Use placeholder text as the label. It disappears on input and is often low contrast.
- Signal an error with the red border alone.

**Accessibility**
- The border uses \`color.border.strong\` (at least 3:1), so the field is identifiable without the label.
- \`aria-invalid\` switches the border to the text-safe negative color.
- Placeholder text uses \`color.text.subtle\` (at least 4.5:1).
`,
      },
    },
  },
  render: (args) => <SymbolField {...args} />,
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "e.g. VTI" },
  play: async ({ canvasElement }) => {
    const input = storyCanvas(canvasElement).getByLabelText("Symbol");
    await userEvent.type(input, "VTI");
    await expect(input).toHaveValue("VTI");
  },
};

export const Invalid: Story = {
  render: () => <QuantityField />,
  play: async ({ canvasElement }) => {
    const input = storyCanvas(canvasElement).getByLabelText("Quantity");
    await expect(input).toHaveAccessibleDescription("Quantity must be zero or more.");
    await expect(input).toBeInvalid();
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Read only data" },
};
