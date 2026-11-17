import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { expect, userEvent, within } from "storybook/test";
import { foldToOther, seriesColor } from "../../lib/chart";
import { formatNumber } from "../../lib/format";
import { holdings, sectorAllocation, valueHistory } from "../../stories/sample-data";
import { storyCanvas } from "../../stories/story-canvas";
import { ChartContainer, ChartTooltipContent, useChartTokens, type ChartConfig } from "./chart";

const meta = {
  title: "Patterns/ChartContainer",
  component: ChartContainer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Wraps one Recharts chart in an accessible figure: title, written summary, legend, token-styled tooltip, and a table view of the same data.

**Do**
- Write the \`summary\` as the takeaway ("Up 7% over 90 days, ahead of the benchmark"), not a description of the axes.
- Order \`config\` deliberately: it assigns the validated categorical colors, and colors follow the entity, never its rank.
- Fold long tails with \`foldToOther\` (part-to-whole reads best at 6 slices or fewer), and give the Other slice \`color: "neutral"\`.
- Read mark sizes from \`useChartTokens()\`: 2px lines, thin bars with rounded data ends, surface gaps between slices.
- Use \`color: "positive" | "negative"\` only when a series means gain or loss.

**Don't**
- Use two y-axes. Index both series to a common base, or use two charts.
- Chart a single number; use a StatCard.
- Color text with the series color. Labels and values stay in ink tokens.

**Accessibility**
- A \`<figure>\` named by its title and described by its summary.
- The Table button switches to an equivalent data table: every value is reachable without hovering.
- Recharts' keyboard layer is on: focus the chart and use arrow keys to move the tooltip.
- A legend appears automatically for two or more series; single-series charts are named by their title.
- Entrance animation uses the brand's slow duration and is off under reduced motion.
`,
      },
    },
  },
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj;

const money = (value: number) => formatNumber(value, { format: "currency" });
const compactMoney = (value: number) => formatNumber(value, { format: "currency", compact: true });
const shortDate = (value: unknown) =>
  new Date(`${String(value)}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

function ValueOverTime() {
  const t = useChartTokens();
  const config = { value: { label: "Portfolio value" } } satisfies ChartConfig;
  return (
    <ChartContainer
      title="Portfolio value"
      summary="Up about 13% over 90 days; the largest one-day drop was 0.8%, in late September."
      config={config}
      data={valueHistory}
      categoryKey="date"
      categoryLabel="Date"
      formatCategory={shortDate}
      formatValue={money}
    >
      <AreaChart data={valueHistory} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={shortDate}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          domain={["dataMin - 500", "dataMax + 500"]}
          tickFormatter={compactMoney}
        />
        <Tooltip
          content={
            <ChartTooltipContent config={config} formatValue={money} formatCategory={shortDate} />
          }
        />
        <Area
          dataKey="value"
          type="monotone"
          stroke={seriesColor("value")}
          strokeWidth={t.lineWidth}
          fill={seriesColor("value")}
          fillOpacity={0.1}
          activeDot={{ r: 4, strokeWidth: t.markGap }}
          isAnimationActive={t.animate}
          animationDuration={t.animationDuration}
        />
      </AreaChart>
    </ChartContainer>
  );
}

export const SingleSeries: Story = {
  render: () => <ValueOverTime />,
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    const figure = canvas.getByRole("figure", { name: "Portfolio value" });
    await expect(figure).toHaveAccessibleDescription(/Up about 13% over 90 days/);
    // One series: the title names it, so there is no legend box.
    await expect(within(figure).queryByRole("list", { name: "Legend" })).toBeNull();

    await userEvent.click(within(figure).getByRole("button", { name: "Table" }));
    await expect(within(figure).getByRole("button", { name: "Table" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const table = within(figure).getByRole("table");
    await expect(within(table).getAllByRole("row")).toHaveLength(valueHistory.length + 1);
  },
};

function VersusBenchmark() {
  const t = useChartTokens();
  const config = {
    value: { label: "Portfolio" },
    benchmark: { label: "Benchmark" },
  } satisfies ChartConfig;
  return (
    <ChartContainer
      title="Portfolio and benchmark"
      summary="The portfolio rose about 13% while the benchmark rose about 3%."
      config={config}
      data={valueHistory}
      categoryKey="date"
      categoryLabel="Date"
      formatCategory={shortDate}
      formatValue={money}
      legend="line"
    >
      <LineChart data={valueHistory} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={shortDate}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          domain={["auto", "auto"]}
          tickFormatter={compactMoney}
        />
        <Tooltip
          content={
            <ChartTooltipContent config={config} formatValue={money} formatCategory={shortDate} />
          }
        />
        {Object.keys(config).map((key) => (
          <Line
            key={key}
            dataKey={key}
            type="monotone"
            stroke={seriesColor(key)}
            strokeWidth={t.lineWidth}
            dot={false}
            activeDot={{ r: 4, strokeWidth: t.markGap }}
            isAnimationActive={t.animate}
            animationDuration={t.animationDuration}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}

export const TwoSeries: Story = {
  render: () => <VersusBenchmark />,
  play: async ({ canvasElement }) => {
    const legend = storyCanvas(canvasElement).getByRole("list", { name: "Legend" });
    await expect(within(legend).getAllByRole("listitem")).toHaveLength(2);
  },
};

function Allocation() {
  const t = useChartTokens();
  // Each slice carries its own fill (Recharts 3 reads it from the row; Cell is deprecated).
  const slices = foldToOther(
    holdings.map((h) => ({ symbol: h.symbol, value: h.marketValue })),
    { valueKey: "value", labelKey: "symbol", max: 6 },
  ).map((slice) => ({ ...slice, fill: seriesColor(slice.symbol) }));
  // "Other" is de-emphasized gray, so it never reads as one more holding.
  const config: ChartConfig = Object.fromEntries(
    slices.map((slice) => [
      slice.symbol,
      { label: slice.symbol, color: slice.symbol === "Other" ? "neutral" : undefined },
    ]),
  );
  return (
    <ChartContainer
      title="Allocation by holding"
      summary="VTI is about half of the portfolio; the top three holdings are about 71%."
      config={config}
      data={slices}
      categoryKey="symbol"
      categoryLabel="Holding"
      valueKey="value"
      formatValue={money}
      height="sm"
    >
      <PieChart>
        <Tooltip content={<ChartTooltipContent config={config} formatValue={money} hideLabel />} />
        <Pie
          data={slices}
          dataKey="value"
          nameKey="symbol"
          innerRadius="62%"
          outerRadius="100%"
          strokeWidth={t.markGap}
          isAnimationActive={t.animate}
          animationDuration={t.animationDuration}
        />
      </PieChart>
    </ChartContainer>
  );
}

export const Donut: Story = {
  render: () => <Allocation />,
  play: async ({ canvasElement }) => {
    const legend = storyCanvas(canvasElement).getByRole("list", { name: "Legend" });
    // Eight holdings fold to five plus Other.
    await expect(within(legend).getAllByRole("listitem")).toHaveLength(6);
    await expect(within(legend).getByText("Other")).toBeInTheDocument();
  },
};

function BySector() {
  const t = useChartTokens();
  const config = { value: { label: "Market value" } } satisfies ChartConfig;
  return (
    <ChartContainer
      title="Exposure by sector"
      summary="Technology and the broad-market fund together are over two thirds of the portfolio."
      config={config}
      data={sectorAllocation}
      categoryKey="sector"
      categoryLabel="Sector"
      formatValue={money}
    >
      <BarChart
        data={sectorAllocation}
        layout="vertical"
        margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={compactMoney} />
        <YAxis type="category" dataKey="sector" tickLine={false} axisLine={false} width={112} />
        <Tooltip content={<ChartTooltipContent config={config} formatValue={money} />} />
        <Bar
          dataKey="value"
          fill={seriesColor("value")}
          maxBarSize={t.barThickness}
          radius={[0, t.markRadius, t.markRadius, 0]}
          isAnimationActive={t.animate}
          animationDuration={t.animationDuration}
        />
      </BarChart>
    </ChartContainer>
  );
}

export const Bars: Story = { render: () => <BySector /> };

/** While data refetches, the previous render stays, dimmed; no skeleton flash. */
export const Pending: Story = {
  render: () => {
    function PendingChart() {
      const t = useChartTokens();
      const config = { value: { label: "Portfolio value" } } satisfies ChartConfig;
      return (
        <ChartContainer
          title="Portfolio value"
          summary="Refreshing prices."
          config={config}
          data={valueHistory}
          categoryKey="date"
          formatValue={money}
          pending
        >
          <LineChart data={valueHistory}>
            <Line
              dataKey="value"
              stroke={seriesColor("value")}
              strokeWidth={t.lineWidth}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      );
    }
    return <PendingChart />;
  },
};
