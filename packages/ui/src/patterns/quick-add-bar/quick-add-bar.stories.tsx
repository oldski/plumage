import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { QuickAddBar, type QuickAddSuggestion } from "./quick-add-bar";

const CATEGORIES = ["Groceries", "Gas", "Gifts", "Dining out", "Rent"];
/** What the demo saves; reset between stories like any fn() spy. */
const onSave = fn();

/** A stand-in for an app's parser: suggests categories for the last word. */
function Demo({ compact = false }: { compact?: boolean }) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("");
  const word = value.split(" ").at(-1)?.toLowerCase() ?? "";
  const suggestions: QuickAddSuggestion[] =
    word.length < 2
      ? []
      : CATEGORIES.filter((name) => name.toLowerCase().startsWith(word)).map((name) => ({
          id: name,
          label: name,
          detail: "category",
        }));
  return (
    <div className="w-overlay-lg">
      <QuickAddBar
        label="Add a transaction"
        placeholder="42.18 groceries publix"
        value={value}
        onValueChange={setValue}
        suggestions={suggestions}
        onSuggestionPick={(suggestion) => {
          setValue(
            `${value.slice(0, value.length - word.length)}${suggestion.label.toLowerCase()} `,
          );
        }}
        onSubmit={() => {
          onSave(value.trim());
          setStatus(`Saved: ${value.trim()}`);
          setValue("");
        }}
        preview={value.trim() ? `Reads as: ${value.trim()}` : "Amount, category, then payee."}
        status={status}
        compact={compact}
      />
    </div>
  );
}

const meta = {
  title: "Patterns/QuickAddBar",
  component: QuickAddBar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
A keyboard-first entry line: type a whole entry, complete words from suggestions, press
Enter to save, and the field is ready for the next one. The app parses the text and
supplies the suggestions and the preview; the pattern owns the keyboard and ARIA.

**Do**
- Show how the text will be read in \`preview\`, before it is saved.
- Report the result in \`status\` and clear the field, so the next entry can start at once.

**Don't**
- Save on Enter while a suggestion is highlighted; Enter takes the suggestion first.

**Accessibility**
- An ARIA 1.2 combobox: \`aria-expanded\`, \`aria-controls\`, and \`aria-activedescendant\`
  follow the list, so screen readers announce the highlighted suggestion.
- Arrow keys move, Enter or Tab takes a suggestion, Escape closes the list, then clears.
- The preview is the field's description; the status line is a polite live region.
`,
      },
    },
  },
  render: () => <Demo />,
} satisfies Meta<typeof QuickAddBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Add a transaction",
    value: "",
    onValueChange: fn(),
    suggestions: [],
    onSuggestionPick: fn(),
    onSubmit: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    const field = canvas.getByRole("combobox", { name: "Add a transaction" });
    await userEvent.type(field, "12 g");
    await expect(field).toHaveAttribute("aria-expanded", "false");
    await userEvent.type(field, "r");
    await expect(field).toHaveAttribute("aria-expanded", "true");
    const list = canvas.getByRole("listbox", { hidden: true });
    await expect(within(list).getAllByRole("option")).toHaveLength(1);

    await userEvent.keyboard("{ArrowDown}");
    await expect(field).toHaveAttribute(
      "aria-activedescendant",
      expect.stringContaining("Groceries"),
    );
    await userEvent.keyboard("{Enter}");
    await expect(field).toHaveValue("12 groceries ");

    await userEvent.type(field, "publix{Enter}");
    await expect(onSave).toHaveBeenCalledWith("12 groceries publix");
    await expect(field).toHaveValue("");
    await expect(canvas.getByRole("status")).toHaveTextContent("Saved: 12 groceries publix");
  },
};

export const EscapeClears: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const field = storyCanvas(canvasElement).getByRole("combobox");
    await userEvent.type(field, "5 gi");
    await expect(field).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    await expect(field).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard("{Escape}");
    await expect(field).toHaveValue("");
  },
};

export const Compact: Story = {
  ...Default,
  render: () => <Demo compact />,
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    const field = canvas.getByRole("combobox");
    await userEvent.type(field, "12 gro");
    await expect(canvas.getByText("Reads as: 12 gro")).toBeVisible();
    await userEvent.tab();
    await expect(canvas.getByText("Reads as: 12 gro")).not.toBeVisible();
  },
};
