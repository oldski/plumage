import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "../src/components/combobox/combobox";
import { DatePicker, fromIsoDate, toIsoDate } from "../src/components/date-picker/date-picker";
import { NumberInput, stepNumberText } from "../src/components/number-input/number-input";
import { formatNumber, MINUS } from "../src/lib/format";
import { Money } from "../src/patterns/money/money";

describe("formatNumber", () => {
  it("uses a true minus sign for negatives", () => {
    expect(formatNumber(-1234.5, { format: "currency" })).toBe(`${MINUS}$1,234.50`);
    expect(formatNumber(-4_200_000, { format: "currency", compact: true })).toBe(`${MINUS}$4.2M`);
    expect(formatNumber(12, { sign: "always" })).toBe("+12");
  });
});

describe("Money", () => {
  it("formats dollars with tabular figures and keeps the number for machines", () => {
    render(<Money value={-42.18} sign="always" />);
    const money = screen.getByText(`${MINUS}$42.18`);
    expect(money.tagName).toBe("DATA");
    expect(money).toHaveAttribute("value", "-42.18");
    expect(money).toHaveClass("tabular-nums");
  });
});

describe("stepNumberText", () => {
  it("steps without float drift and keeps the step's places", () => {
    expect(stepNumberText("0.1", 0.2)).toBe("0.3");
    expect(stepNumberText("24.99", 0.01)).toBe("25.00");
    expect(stepNumberText("", 1)).toBe("1");
    expect(stepNumberText("1,200", 100)).toBe("1300");
  });

  it("clamps to min and max and refuses text that is not a number", () => {
    expect(stepNumberText("0", -1, { min: 0 })).toBe("0");
    expect(stepNumberText("99", 5, { max: 100 })).toBe("100");
    expect(stepNumberText("abc", 1)).toBeNull();
  });
});

describe("NumberInput", () => {
  it("steps with the arrow keys and reports the text", async () => {
    const onValueChange = vi.fn();
    render(
      <NumberInput aria-label="Extra" defaultValue="5" step={1} onValueChange={onValueChange} />,
    );
    const field = screen.getByRole("textbox", { name: "Extra" });
    await userEvent.click(field);
    await userEvent.keyboard("{ArrowDown}");
    expect(field).toHaveValue("4");
    expect(onValueChange).toHaveBeenLastCalledWith("4");
    expect(field).toHaveAttribute("inputmode", "decimal");
  });
});

describe("Combobox", () => {
  it("narrows by typing, chooses, and submits the value", async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Combobox
        aria-label="Category"
        name="category"
        options={[
          { value: "groceries", label: "Groceries", keywords: ["food"] },
          { value: "rent", label: "Rent" },
        ]}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Category" }));
    await userEvent.keyboard("food");
    expect(screen.queryByRole("option", { name: "Rent" })).toBeNull();
    await userEvent.click(screen.getByRole("option", { name: "Groceries" }));
    expect(onValueChange).toHaveBeenCalledWith("groceries");
    expect(container.querySelector("input[name=category]")).toHaveValue("groceries");
  });
});

describe("Combobox search", () => {
  it("matches labels and keywords, never the hidden value", async () => {
    render(
      <Combobox
        aria-label="Category"
        options={[
          { value: "4f1a9c2e", label: "Rent" },
          { value: "b7d03e11", label: "Groceries", keywords: ["food"] },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Category" }));
    await userEvent.keyboard("4f1a");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("Nothing matches.")).toBeInTheDocument();
    await userEvent.keyboard("{Control>}a{/Control}groc");
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Groceries",
    ]);
  });
});

describe("DatePicker", () => {
  it("clears an optional date back to none", async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <DatePicker
        aria-label="Goal date"
        name="date"
        defaultValue="2026-10-30"
        clearable
        placeholder="No date"
        onValueChange={onValueChange}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Goal date" });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: "Clear date" }));
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(trigger).toHaveTextContent("No date");
    expect(container.querySelector("input[name=date]")).toHaveValue("");
  });

  it("offers no Clear button unless asked, or with nothing chosen", async () => {
    render(<DatePicker aria-label="Due" defaultValue="2026-10-30" />);
    await userEvent.click(screen.getByRole("button", { name: "Due" }));
    expect(screen.queryByRole("button", { name: "Clear date" })).toBeNull();
  });
});

describe("date strings", () => {
  it("round-trips a day without a time zone shift", () => {
    expect(toIsoDate(fromIsoDate("2026-03-08") ?? new Date(0))).toBe("2026-03-08");
    expect(fromIsoDate("2026-02-30")).toBeUndefined();
    expect(fromIsoDate("not a date")).toBeUndefined();
  });
});
