import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "../src/components/progress/progress";

const indicator = (bar: HTMLElement) =>
  bar.querySelector<HTMLElement>("[data-slot=progress-indicator]");

describe("Progress", () => {
  it("is a named progress bar that reads its value as words", () => {
    render(
      <Progress
        aria-label="Groceries"
        value={420}
        max={500}
        getValueLabel={(value, max) => `$${String(value)} of $${String(max)}`}
      />,
    );
    const bar = screen.getByRole("progressbar", { name: "Groceries" });
    expect(bar).toHaveAttribute("aria-valuenow", "420");
    expect(bar).toHaveAttribute("aria-valuemax", "500");
    expect(bar).toHaveAttribute("aria-valuetext", "$420 of $500");
    expect(indicator(bar)?.style.transform).toBe("translateX(-16%)");
  });

  it("draws a full bar past the limit and an empty one below zero", () => {
    render(
      <>
        <Progress aria-label="Over" value={560} max={500} tone="warning" />
        <Progress aria-label="Under" value={-5} max={500} />
      </>,
    );
    const over = screen.getByRole("progressbar", { name: "Over" });
    expect(over).toHaveAttribute("data-tone", "warning");
    expect(indicator(over)?.style.transform).toBe("translateX(-0%)");
    expect(indicator(screen.getByRole("progressbar", { name: "Under" }))?.style.transform).toBe(
      "translateX(-100%)",
    );
  });

  it("draws empty when there is no limit", () => {
    render(<Progress aria-label="Nothing budgeted" value={0} max={0} />);
    const bar = screen.getByRole("progressbar", { name: "Nothing budgeted" });
    expect(indicator(bar)?.style.transform).toBe("translateX(-100%)");
  });
});
