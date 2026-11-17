import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Label } from "../label/label";
import { Slider } from "./slider";

const meta = {
  title: "Primitives/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Picks a value, or a range, from a continuous scale: a session length, a target rate of
change, a time window. Built on Radix Slider.

**Do**
- Show the current value as text beside it, formatted (\`Measure\`, \`Money\`).
- Pick a \`step\` that matches what the value means (5 minutes, 0.1 kg).
- Pair it with a \`NumberInput\` when the exact number matters.

**Don't**
- Use it for a choice between a few named options. Use \`Select\` or \`Tabs\`.
- Hide the value: a position alone is not a number.

**Accessibility**
- Each thumb is a \`slider\` with \`aria-valuenow\`, \`aria-valuemin\`, and \`aria-valuemax\`.
- Arrow keys step, Page Up and Page Down take larger steps, Home and End go to the ends.
- Name a single slider with \`aria-label\`; name each thumb of a range with \`thumbLabels\`.
- Track and thumb sizes are density tokens (\`slider.track.height\`, \`slider.thumb.size\`).
`,
      },
    },
  },
  args: { "aria-label": "Session length", defaultValue: [45], min: 15, max: 120, step: 5 },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

function WithValue() {
  const [value, setValue] = useState([45]);
  return (
    <div className="flex w-overlay-xs flex-col gap-sm">
      <div className="flex items-center justify-between">
        <Label id="session-length">Session length</Label>
        <span className="font-numeric text-body tabular-nums">{value[0]} min</span>
      </div>
      <Slider
        aria-labelledby="session-length"
        value={value}
        onValueChange={setValue}
        min={15}
        max={120}
        step={5}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <WithValue />,
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    const thumb = canvas.getByRole("slider");
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(thumb).toHaveAttribute("aria-valuenow", "50");
    await expect(canvas.getByText("50 min")).toBeInTheDocument();
    await userEvent.keyboard("{ArrowLeft}");
    thumb.blur();
  },
};

export const Range: Story = {
  args: { defaultValue: [60, 90], min: 0, max: 120, thumbLabels: ["Shortest", "Longest"] },
  render: (args) => <Slider {...args} className="w-overlay-xs" />,
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    await expect(canvas.getByRole("slider", { name: "Longest" })).toHaveAttribute(
      "aria-valuenow",
      "90",
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <Slider {...args} className="w-overlay-xs" />,
};
