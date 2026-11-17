import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId } from "react";
import { expect, userEvent } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Label } from "../label/label";
import { Textarea, type TextareaProps } from "./textarea";

function QuestionField(props: TextareaProps) {
  const id = useId();
  return (
    <div className="flex w-overlay-md flex-col gap-xs">
      <Label htmlFor={id}>Question</Label>
      <Textarea id={id} {...props} />
    </div>
  );
}

function NoteField() {
  const id = useId();
  return (
    <div className="flex w-overlay-md flex-col gap-xs">
      <Label htmlFor={id}>Note</Label>
      <Textarea id={id} aria-invalid aria-describedby={`${id}-error`} />
      <p id={`${id}-error`} className="text-caption text-negative">
        Write a note before saving.
      </p>
    </div>
  );
}

const meta = {
  title: "Primitives/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Multi-line text entry. It starts at three rows and grows with its content.

**Do**
- Pair every textarea with a visible \`Label\`.
- Show errors in text next to the field and connect them with \`aria-describedby\`.

**Don't**
- Use placeholder text as the label.
- Use it for a single short value; that is an \`Input\`.

**Accessibility**
- Same border, placeholder, focus, and invalid treatment as \`Input\`.
- People can still resize it vertically.
`,
      },
    },
  },
  render: (args) => <QuestionField {...args} />,
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "e.g. How concentrated am I in tech?" },
  play: async ({ canvasElement }) => {
    const field = storyCanvas(canvasElement).getByLabelText("Question");
    await userEvent.type(field, "Which holdings{enter}matter most?");
    await expect(field).toHaveValue("Which holdings\nmatter most?");
  },
};

export const Invalid: Story = {
  render: () => <NoteField />,
  play: async ({ canvasElement }) => {
    const field = storyCanvas(canvasElement).getByLabelText("Note");
    await expect(field).toBeInvalid();
    await expect(field).toHaveAccessibleDescription("Write a note before saving.");
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Read only while a note is streaming." },
};
