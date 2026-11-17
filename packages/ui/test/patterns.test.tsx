import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { foldToOther, seriesColor } from "../src/lib/chart";
import { formatNumber } from "../src/lib/format";
import { ChartContainer, useChartTokens, type ChartConfig } from "../src/patterns/chart/chart";
import { createDataTableColumnHelper, DataTable } from "../src/patterns/data-table/data-table";
import { Delta, deltaDirection } from "../src/patterns/delta/delta";
import { PlumageProvider } from "../src/provider/plumage-provider";

describe("formatNumber", () => {
  it("treats percent values as ratios and signs on request", () => {
    expect(formatNumber(0.0124, { format: "percent", sign: "always" })).toBe("+1.24%");
    expect(formatNumber(-0.008, { format: "percent", sign: "always" })).toBe("\u22120.80%");
    expect(formatNumber(0, { format: "percent", sign: "always" })).toBe("0.00%");
  });

  it("compacts large currency values", () => {
    expect(formatNumber(4_210_000, { format: "currency", compact: true })).toBe("$4.2M");
    expect(formatNumber(12_900, { compact: true })).toBe("12.9K");
  });
});

describe("Delta", () => {
  it("reads as words, not signs or colors", () => {
    render(<Delta value={-0.008} period="today" />);
    expect(screen.getByText("Down 0.80% today")).toBeInTheDocument();
  });

  it("treats changes inside the threshold as unchanged", () => {
    expect(deltaDirection(0.00004, 0.0001)).toBe("flat");
    render(<Delta value={0.00004} threshold={0.0001} />);
    expect(screen.getByText("Unchanged")).toBeInTheDocument();
  });

  it("inverts color but keeps the arrow and words for decreases that are good", () => {
    const { container } = render(<Delta value={-0.0015} invert />);
    const delta = container.querySelector("[data-slot=delta]");
    expect(delta).toHaveAttribute("data-direction", "down");
    expect(delta).toHaveClass("text-positive");
    expect(screen.getByText("Down 0.15%")).toBeInTheDocument();
  });
});

describe("foldToOther", () => {
  const rows = [3, 9, 1, 7, 5, 2, 8, 4].map((value, i) => ({ name: `h${String(i)}`, value }));

  it("keeps the largest slices and sums the rest into Other", () => {
    const folded = foldToOther(rows, { valueKey: "value", labelKey: "name", max: 6 });
    expect(folded).toHaveLength(6);
    expect(folded.map((r) => r.value)).toEqual([9, 8, 7, 5, 4, 3 + 1 + 2]);
    expect(folded.at(-1)?.name).toBe("Other");
  });

  it("only sorts when nothing needs folding", () => {
    expect(foldToOther(rows.slice(0, 3), { valueKey: "value", labelKey: "name" })).toHaveLength(3);
  });

  it("makes series keys safe for custom properties", () => {
    expect(seriesColor("BRK.B")).toBe("var(--series-BRK-B)");
  });
});

function withProvider(brand: "finch" | "sparrow", density?: "compact" | "comfortable") {
  return ({ children }: { children: ReactNode }) => (
    <PlumageProvider brand={brand} mode="light" density={density}>
      {children}
    </PlumageProvider>
  );
}

describe("ChartContainer", () => {
  const data = [{ x: "a", s1: 1 }];
  const chart = (config: ChartConfig) => (
    <PlumageProvider brand="finch" mode="light">
      <ChartContainer title="T" summary="S" config={config} data={data} categoryKey="x">
        <svg />
      </ChartContainer>
    </PlumageProvider>
  );

  it("refuses a ninth categorical color instead of cycling", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const nine = Object.fromEntries(
      Array.from({ length: 9 }, (_, i) => [`s${String(i)}`, { label: `S${String(i)}` }]),
    );
    expect(() => render(chart(nine))).toThrow(/Fold the rest into "Other"/);
  });

  it("assigns categorical slots in config order, skipping explicit delta colors", () => {
    const { container } = render(
      chart({
        gain: { label: "Gain", color: "positive" },
        a: { label: "A" },
        b: { label: "B" },
      }),
    );
    const style = container.querySelector("figure")?.getAttribute("style") ?? "";
    expect(style).toContain("--series-gain: var(--pl-color-chart-delta-positive)");
    expect(style).toContain("--series-a: var(--pl-color-chart-categorical-1)");
    expect(style).toContain("--series-b: var(--pl-color-chart-categorical-2)");
  });
});

describe("useChartTokens", () => {
  it("resolves mark sizes for the active brand and density", () => {
    const finch = renderHook(() => useChartTokens(), { wrapper: withProvider("finch") }).result
      .current;
    expect(finch).toMatchObject({ lineWidth: 2, markGap: 2, markRadius: 2, barThickness: 16 });
    expect(finch.animationDuration).toBe(250);

    const sparrow = renderHook(() => useChartTokens(), { wrapper: withProvider("sparrow") }).result
      .current;
    expect(sparrow).toMatchObject({ markRadius: 4, barThickness: 20, animationDuration: 300 });
  });
});

describe("DataTable", () => {
  interface Row {
    name: string;
    value: number;
  }
  const column = createDataTableColumnHelper<Row>();
  const columns = column.columns([
    column.accessor("name", { header: "Name" }),
    column.accessor("value", { header: "Value", meta: { numeric: true } }),
  ]);
  const rows: Row[] = [
    { name: "b", value: 2 },
    { name: "a", value: 3 },
    { name: "c", value: 1 },
  ];

  it("sorts from the keyboard and right-aligns numeric columns", async () => {
    render(<DataTable caption="Rows" columns={columns} data={rows} />);
    const header = screen.getByRole("columnheader", { name: /Value/ });
    expect(header).toHaveAttribute("aria-sort", "none");
    expect(header).toHaveClass("text-right");

    // Number columns sort largest first, then flip.
    screen.getByRole("button", { name: /Value/ }).focus();
    await userEvent.keyboard("{Enter}");
    const firstValue = () => screen.getAllByRole("cell")[1];
    expect(header).toHaveAttribute("aria-sort", "descending");
    expect(firstValue()).toHaveTextContent("3");
    expect(firstValue()).toHaveClass("tabular-nums");

    await userEvent.keyboard("{Enter}");
    expect(header).toHaveAttribute("aria-sort", "ascending");
    expect(firstValue()).toHaveTextContent("1");
  });

  it("counts one item in the singular when given the word", () => {
    render(
      <PlumageProvider brand="finch" mode="light">
        <DataTable
          caption="People"
          columns={columns}
          data={[{ name: "Ada", value: 1 }]}
          itemLabel="people"
          itemLabelOne="person"
        />
      </PlumageProvider>,
    );
    expect(screen.getByText("1 person")).toBeInTheDocument();
  });
});
