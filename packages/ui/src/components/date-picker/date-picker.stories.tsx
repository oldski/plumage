import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Label } from "../label/label";
import { DatePicker, type DatePickerProps } from "./date-picker";

const meta = {
  title: "Primitives/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Picks a day from a month calendar. Values are "2026-10-30" strings, so no time zone can
move a date by a day.

**Do**
- Set \`min\` and \`max\` when only some dates make sense (a goal's date is in the future).
- Pass \`name\` to submit the date with a form.
- Set \`clearable\` for an optional date, so one chosen by mistake can be removed.

**Don't**
- Use it for dates people know by heart, like a birthday. Typing is faster there.
- Use it for a range. That is a different control.

**Accessibility**
- Opening it focuses the calendar; arrows move by day and week, Page Up and Down by
  month, Enter picks, Escape closes and returns focus to the button.
- Today is underlined and the chosen day filled, so neither relies on color alone.
`,
      },
    },
  },
  args: { name: "targetDate", defaultValue: "2026-10-15" },
  render: (args) => <TargetDate {...args} />,
} satisfies Meta<typeof DatePicker>;

function TargetDate(props: DatePickerProps) {
  const id = useId();
  return (
    <div className="flex w-overlay-xs flex-col gap-xs">
      <Label htmlFor={id}>Target date</Label>
      <DatePicker id={id} {...props} />
    </div>
  );
}

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = storyCanvas(canvasElement).getByRole("button", { name: "Target date" });
    await expect(trigger).toHaveTextContent("Oct 15, 2026");
    await userEvent.click(trigger);
    const grid = await within(document.body).findByRole("grid");
    await userEvent.click(within(grid).getByText("20"));
    await waitFor(() => expect(trigger).toHaveTextContent("Oct 20, 2026"));
  },
};

export const Empty: Story = { args: { defaultValue: null, min: "2026-10-01" } };

/** An optional date: Clear date sets it back to none. */
export const Clearable: Story = {
  args: { clearable: true, placeholder: "No date" },
  play: async ({ canvasElement }) => {
    const trigger = storyCanvas(canvasElement).getByRole("button", { name: "Target date" });
    await userEvent.click(trigger);
    await userEvent.click(await within(document.body).findByRole("button", { name: "Clear date" }));
    await waitFor(() => expect(trigger).toHaveTextContent("No date"));
  },
};
