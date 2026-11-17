import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Label } from "../label/label";
import { Combobox, type ComboboxProps } from "./combobox";

const CATEGORIES = [
  { value: "groceries", label: "Groceries", keywords: ["food", "supermarket"] },
  { value: "dining", label: "Dining out", keywords: ["restaurants", "coffee"] },
  { value: "rent", label: "Rent" },
  { value: "utilities", label: "Utilities", description: "Power, water, internet" },
  { value: "transport", label: "Transport", keywords: ["gas", "transit"] },
];

const meta = {
  title: "Primitives/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Picks one value from a long list by typing to narrow it. A Select you can search.

**Do**
- Use it past a dozen options: categories, payees, accounts.
- Add \`keywords\` for other words people use ("food" for Groceries).
- Pass \`name\` to submit the value with a form.

**Don't**
- Use it for three to ten options. Select is quicker to scan.
- Use it for free text. Every value must be one of the options.

**Accessibility**
- The button has \`role="combobox"\` and \`aria-expanded\`; label it with a \`Label\`, or
  with \`aria-label\` where there is no room for one (a table row).
- Opening it moves focus to the search field; arrows move, Enter chooses, Escape closes
  and returns focus to the button.
`,
      },
    },
  },
  args: { options: CATEGORIES, placeholder: "Choose a category", name: "category" },
  render: (args) => <CategoryField {...args} />,
} satisfies Meta<typeof Combobox>;

function CategoryField(props: ComboboxProps) {
  const id = useId();
  return (
    <div className="flex w-overlay-xs flex-col gap-xs">
      <Label htmlFor={id}>Category</Label>
      <Combobox id={id} {...props} />
    </div>
  );
}

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = storyCanvas(canvasElement).getByRole("combobox", { name: "Category" });
    await userEvent.click(trigger);
    const body = within(document.body);
    await userEvent.keyboard("food");
    await userEvent.click(await body.findByRole("option", { name: "Groceries" }));
    await waitFor(() => expect(trigger).toHaveTextContent("Groceries"));
  },
};

export const Chosen: Story = { args: { defaultValue: "utilities", clearable: true } };

/** Small, labelled by \`aria-label\`, as in a table row. */
export const InARow: Story = {
  args: { size: "sm", defaultValue: "dining", "aria-label": "Category for Blue Bottle" },
  render: (args) => (
    <div className="w-overlay-2xs">
      <Combobox {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = storyCanvas(canvasElement).getByRole("combobox", {
      name: "Category for Blue Bottle",
    });
    await expect(trigger).toHaveAttribute("data-size", "sm");
  },
};
