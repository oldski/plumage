import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Slider } from "../src/components/slider/slider";
import { calendarWeeks, heatLevel, parseDay } from "../src/lib/calendar";
import { wholePercents } from "../src/lib/chart";
import { convertMass, formatMeasure } from "../src/lib/measure";
import { CalendarHeatmap } from "../src/patterns/calendar-heatmap/calendar-heatmap";
import { MacroBar } from "../src/patterns/macro-bar/macro-bar";
import { Measure } from "../src/patterns/measure/measure";
import { expectNoA11yViolations } from "./a11y";

const NNBSP = " ";

describe("formatMeasure", () => {
  it("formats each unit with its default precision, a narrow space, and words to read aloud", () => {
    expect(formatMeasure(72.54, "kg")).toEqual({
      text: `72.5${NNBSP}kg`,
      spoken: "72.5 kilograms",
    });
    expect(formatMeasure(2140.4, "kcal")).toEqual({
      text: `2,140${NNBSP}kcal`,
      spoken: "2,140 calories",
    });
    expect(formatMeasure(1, "lb").spoken).toBe("1.0 pound");
    expect(formatMeasure(52, "bpm").spoken).toBe("52 beats per minute");
    expect(formatMeasure(180, "g", { precision: 1 }).text).toBe(`180.0${NNBSP}g`);
  });

  it("writes a change with a true minus sign, and says minus", () => {
    expect(formatMeasure(-0.45, "kg", { sign: "always" })).toEqual({
      text: `−0.5${NNBSP}kg`,
      spoken: "minus 0.5 kilograms",
    });
    expect(formatMeasure(0.4, "kg", { sign: "always" }).text).toBe(`+0.4${NNBSP}kg`);
  });

  it("shows a duration in minutes as hours and minutes", () => {
    expect(formatMeasure(452, "duration")).toEqual({
      text: `7${NNBSP}h 32${NNBSP}min`,
      spoken: "7 hours 32 minutes",
    });
    expect(formatMeasure(60, "duration").text).toBe(`1${NNBSP}h`);
    expect(formatMeasure(45.4, "duration").spoken).toBe("45 minutes");
    expect(formatMeasure(0, "duration").text).toBe(`0${NNBSP}min`);
    expect(formatMeasure(-61, "duration")).toEqual({
      text: `−1${NNBSP}h 1${NNBSP}min`,
      spoken: "minus 1 hour 1 minute",
    });
  });
});

describe("convertMass", () => {
  it("converts exactly, using the defined pound and ounce", () => {
    expect(convertMass(1, "lb", "kg")).toBeCloseTo(0.45359237, 12);
    expect(convertMass(80, "kg", "lb")).toBeCloseTo(176.3698, 4);
    expect(convertMass(1, "oz", "g")).toBeCloseTo(28.349523125, 12);
    expect(convertMass(16, "oz", "lb")).toBeCloseTo(1, 12);
    expect(convertMass(72.5, "kg", "kg")).toBe(72.5);
  });
});

describe("Measure", () => {
  it("shows the abbreviation, reads the words, and keeps the raw value", async () => {
    const { container } = render(
      <p>
        Weight <Measure value={72.54} unit="kg" />
      </p>,
    );
    const measure = container.querySelector("[data-slot=measure]");
    expect(measure).toHaveAttribute("value", "72.54");
    // The narrow no-break space is the point, so match the text exactly.
    expect(screen.getByText(`72.5${NNBSP}kg`, { normalizer: (text) => text })).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.getByText("72.5 kilograms")).toHaveClass("sr-only");
    await expectNoA11yViolations(container);
  });
});

describe("wholePercents", () => {
  it("rounds by the largest remainder, so shares add up to 100", () => {
    expect(wholePercents([1, 1, 1])).toEqual([34, 33, 33]);
    expect(wholePercents([120, 200, 70])).toEqual([31, 51, 18]);
    expect(wholePercents([0, 0])).toEqual([0, 0]);
    expect(wholePercents([-5, 10, Number.NaN])).toEqual([0, 100, 0]);
  });
});

describe("MacroBar", () => {
  const segments = [
    { key: "protein", label: "Protein", value: 520 },
    { key: "carbs", label: "Carbs", value: 900 },
    { key: "fat", label: "Fat", value: 630 },
  ];

  it("labels the group, hides the drawing, and gives every share as a number", async () => {
    const { container } = render(
      <MacroBar label="Today's macros by calories" segments={segments} />,
    );
    expect(screen.getByRole("group", { name: "Today's macros by calories" })).toBeInTheDocument();
    expect(container.querySelector("[data-slot=macro-bar-track]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    const items = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(items).toEqual(["Protein25%", "Carbs44%", "Fat31%"]);
    await expectNoA11yViolations(container);
  });

  it("becomes one named image without a legend, and says when it is empty", async () => {
    const { container, rerender } = render(
      <MacroBar label="Macros" segments={segments} hideLegend />,
    );
    expect(
      screen.getByRole("img", { name: "Macros: Protein 25%, Carbs 44%, Fat 31%" }),
    ).toBeTruthy();
    await expectNoA11yViolations(container);
    rerender(
      <MacroBar label="Macros" hideLegend segments={segments.map((s) => ({ ...s, value: 0 }))} />,
    );
    expect(screen.getByRole("img", { name: "Macros: nothing yet" })).toBeTruthy();
    expect(container.querySelectorAll("[data-slot=macro-bar-segment]")).toHaveLength(0);
  });

  it("refuses more segments than the palette has colors", () => {
    const nine = Array.from({ length: 9 }, (_, i) => ({
      key: String(i),
      label: String(i),
      value: 1,
    }));
    expect(() => render(<MacroBar label="Too many" segments={nine} />)).toThrow(/at most 8/);
  });
});

describe("calendar math", () => {
  it("parses only real plain dates", () => {
    expect(parseDay("2026-10-30")).toBe(Date.UTC(2026, 9, 30));
    expect(parseDay("2026-02-30")).toBeNaN();
    expect(parseDay("10/30/2026")).toBeNaN();
  });

  it("lays out whole weeks, with days outside the range left empty", () => {
    // Thursday 2026-10-01 to Sunday 2026-10-11, weeks starting Monday.
    const weeks = calendarWeeks("2026-10-01", "2026-10-11", 1);
    expect(weeks).toHaveLength(2);
    expect(weeks[0]).toEqual([
      null,
      null,
      null,
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
    ]);
    expect(weeks[1]?.at(-1)).toBe("2026-10-11");
    expect(calendarWeeks("2026-10-01", "2026-10-11", 0)[0]?.[4]).toBe("2026-10-01");
    expect(calendarWeeks("2026-10-11", "2026-10-01", 1)).toEqual([]);
  });

  it("crosses a daylight saving change without losing or repeating a day", () => {
    const days = calendarWeeks("2026-10-26", "2026-11-08", 1).flat();
    expect(new Set(days).size).toBe(14);
    expect(days).toContain("2026-11-01");
  });

  it("splits values into equal shades, with nothing at zero", () => {
    expect([undefined, 0, -1, 1, 2, 3, 4, 9].map((v) => heatLevel(v, 4, 4))).toEqual([
      0, 0, 0, 1, 2, 3, 4, 4,
    ]);
    expect(heatLevel(5, 0, 4)).toBe(0);
  });
});

describe("CalendarHeatmap", () => {
  const values = { "2026-10-26": 1, "2026-10-28": 3, "2026-10-30": 2 };
  const heatmap = (
    <CalendarHeatmap
      label="Workouts"
      values={values}
      start="2026-10-19"
      end="2026-11-01"
      today="2026-10-30"
      formatValue={(n) => `${String(n)} ${n === 1 ? "workout" : "workouts"}`}
    />
  );

  it("is a named grid of days, each read with its value, with today marked", async () => {
    const { container } = render(heatmap);
    expect(screen.getByRole("grid", { name: "Workouts" })).toBeInTheDocument();
    expect(screen.getAllByRole("rowheader")).toHaveLength(7);
    const today = screen.getByRole("gridcell", { name: "Friday, October 30, 2026: 2 workouts" });
    expect(today).toHaveAttribute("aria-current", "date");
    expect(today).toHaveAttribute("tabindex", "0");
    expect(
      screen.getByRole("gridcell", { name: "Monday, October 19, 2026: Nothing logged" }),
    ).toHaveAttribute("data-level", "0");
    expect(
      screen.getByRole("gridcell", { name: "Wednesday, October 28, 2026: 3 workouts" }),
    ).toHaveAttribute("data-level", "4");
    // One stop in the tab order.
    expect(container.querySelectorAll('[role=gridcell][tabindex="0"]')).toHaveLength(1);
    await expectNoA11yViolations(container);
  });

  it("moves by day and by week with the arrow keys, and stays inside the range", () => {
    render(heatmap);
    const cell = (day: string) => document.querySelector<HTMLElement>(`[data-day="${day}"]`)!;
    cell("2026-10-30").focus();
    fireEvent.keyDown(cell("2026-10-30"), { key: "ArrowUp" });
    expect(document.activeElement).toBe(cell("2026-10-29"));
    fireEvent.keyDown(cell("2026-10-29"), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(cell("2026-10-22"));
    expect(cell("2026-10-22")).toHaveAttribute("tabindex", "0");
    expect(cell("2026-10-30")).toHaveAttribute("tabindex", "-1");
    fireEvent.keyDown(cell("2026-10-22"), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(cell("2026-10-22"));
    fireEvent.keyDown(cell("2026-10-22"), { key: "End" });
    expect(document.activeElement).toBe(cell("2026-11-01"));
    fireEvent.keyDown(cell("2026-11-01"), { key: "Home" });
    expect(document.activeElement).toBe(cell("2026-10-19"));
  });
});

describe("Slider", () => {
  it("names one thumb from the slider's label, and each thumb of a range", async () => {
    const { container } = render(
      <>
        <Slider aria-label="Session length" defaultValue={[45]} min={15} max={120} step={5} />
        <Slider defaultValue={[60, 90]} thumbLabels={["Shortest", "Longest"]} />
      </>,
    );
    const one = screen.getByRole("slider", { name: "Session length" });
    expect(one).toHaveAttribute("aria-valuenow", "45");
    expect(one).toHaveAttribute("aria-valuemin", "15");
    expect(screen.getByRole("slider", { name: "Shortest" })).toHaveAttribute("aria-valuenow", "60");
    expect(screen.getByRole("slider", { name: "Longest" })).toHaveAttribute("aria-valuenow", "90");
    await expectNoA11yViolations(container);
  });

  it("passes a visible label's name to the thumb", () => {
    render(
      <>
        <span id="length-label">Session length</span>
        <Slider aria-labelledby="length-label" defaultValue={[45]} />
      </>,
    );
    expect(screen.getByRole("slider", { name: "Session length" })).toBeInTheDocument();
  });

  it("steps with the arrow keys", () => {
    render(<Slider aria-label="Rate" defaultValue={[50]} step={5} />);
    const thumb = screen.getByRole("slider", { name: "Rate" });
    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    expect(thumb).toHaveAttribute("aria-valuenow", "55");
  });
});
