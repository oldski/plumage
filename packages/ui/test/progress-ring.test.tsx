import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressRing } from "../src/components/progress-ring/progress-ring";

const arc = (ring: HTMLElement) => ring.querySelector("[data-slot=progress-ring-arc]");

describe("ProgressRing", () => {
  it("is a named progress bar that reads its value as words", () => {
    render(
      <ProgressRing
        aria-label="Emergency fund"
        value={1200}
        max={5000}
        getValueLabel={() => "$1,200 of $5,000 saved"}
      >
        24%
      </ProgressRing>,
    );
    const ring = screen.getByRole("progressbar", { name: "Emergency fund" });
    expect(ring).toHaveAttribute("aria-valuenow", "1200");
    expect(ring).toHaveAttribute("aria-valuetext", "$1,200 of $5,000 saved");
    expect(arc(ring)).toHaveAttribute("stroke-dasharray", "24 100");
    // The middle figure is decoration; the label carries it.
    expect(screen.getByText("24%")).toHaveAttribute("aria-hidden", "true");
  });

  it("draws a full ring past the limit and no arc at zero or below", () => {
    render(
      <>
        <ProgressRing aria-label="Over" value={6000} max={5000} tone="positive" />
        <ProgressRing aria-label="None" value={-10} max={5000} />
        <ProgressRing aria-label="No target" value={0} max={0} />
      </>,
    );
    const over = screen.getByRole("progressbar", { name: "Over" });
    expect(over).toHaveAttribute("data-tone", "positive");
    expect(arc(over)).toHaveAttribute("stroke-dasharray", "100 100");
    expect(arc(screen.getByRole("progressbar", { name: "None" }))).toBeNull();
    expect(arc(screen.getByRole("progressbar", { name: "No target" }))).toBeNull();
  });
});
