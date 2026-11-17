import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ArrowLeftRightIcon,
  BriefcaseIcon,
  DownloadIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  WalletIcon,
} from "lucide-react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { expect } from "storybook/test";
import { Badge } from "../components/badge/badge";
import { Button } from "../components/button/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card/card";
import { parseDay } from "../lib/calendar";
import { seriesColor } from "../lib/chart";
import { formatNumber } from "../lib/format";
import { AppShell, AppShellNav, AppShellNavItem } from "../patterns/app-shell/app-shell";
import {
  ChartContainer,
  ChartTooltipContent,
  useChartTokens,
  type ChartConfig,
} from "../patterns/chart/chart";
import { createDataTableColumnHelper, DataTable } from "../patterns/data-table/data-table";
import { Delta } from "../patterns/delta/delta";
import { MacroBar } from "../patterns/macro-bar/macro-bar";
import { Money } from "../patterns/money/money";
import { PageHeader } from "../patterns/page-header/page-header";
import { StatCard } from "../patterns/stat-card/stat-card";
import {
  holdings,
  portfolioTotal,
  sectorAllocation,
  valueHistory,
  type SampleHolding,
} from "../stories/sample-data";
import { storyCanvas } from "../stories/story-canvas";

const meta = {
  title: "Examples/Finance overview",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// The history is a random walk whose last day barely moves. Scale it so the
// last close is today's total and the day before sits LAST_DAY_GAIN lower:
// every earlier point (both series) by one factor, the last point by another.
// The shape is kept, and the cards, the chart, and the table agree.
const LAST_DAY_GAIN = 0.005;
const lastIndex = valueHistory.length - 1;
const lastScale = portfolioTotal / valueHistory[lastIndex]!.value;
const earlierScale = portfolioTotal / (1 + LAST_DAY_GAIN) / valueHistory[lastIndex - 1]!.value;
const history = valueHistory.map((day, i) => {
  const scale = i === lastIndex ? lastScale : earlierScale;
  return {
    date: day.date,
    value: Math.round(day.value * scale * 100) / 100,
    benchmark: Math.round(day.benchmark * scale * 100) / 100,
  };
});
const first = history[0]!;
const previous = history[lastIndex - 1]!;
const days = `${String(history.length)} days`;
const periodReturn = portfolioTotal / first.value - 1;
const benchmarkReturn = history[lastIndex]!.benchmark / first.benchmark - 1;
const dayChange = portfolioTotal - previous.value;
// The page's date and the close the prices are from are the chart's last day,
// so they cannot disagree with it.
const lastDay = history[lastIndex]!.date;
const longDate = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
}).format(parseDay(lastDay));
const closeDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  timeZone: "UTC",
}).format(parseDay(lastDay));
const totalReturn = holdings.reduce((sum, h) => sum + h.unrealizedPl, 0);
const invested = portfolioTotal - totalReturn;

const money = (value: number) => formatNumber(value, { format: "currency" });
const compactMoney = (value: number) => formatNumber(value, { format: "currency", compact: true });
const percent = (value: number) => formatNumber(value, { format: "percent", precision: 1 });
const shortDate = (value: unknown) =>
  new Date(`${String(value)}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

const column = createDataTableColumnHelper<SampleHolding>();
const columns = column.columns([
  column.accessor((row) => `${row.symbol} ${row.name}`, {
    id: "symbol",
    header: "Holding",
    cell: (info) => (
      <div className="flex flex-col">
        <span className="font-label">{info.row.original.symbol}</span>
        <span className="text-caption text-subtle">{info.row.original.name}</span>
      </div>
    ),
  }),
  column.accessor("quantity", { header: "Shares", meta: { numeric: true } }),
  column.accessor("price", {
    header: "Price",
    meta: { numeric: true },
    cell: (info) => <Money value={info.getValue()} />,
  }),
  column.accessor("marketValue", {
    header: "Value",
    meta: { numeric: true },
    cell: (info) => <Money value={info.getValue()} />,
  }),
  column.accessor("unrealizedPl", {
    header: "Gain or loss",
    meta: { numeric: true },
    cell: (info) => (
      <div className="flex flex-col items-end">
        <Money value={info.getValue()} sign="always" />
        <Delta value={info.row.original.unrealizedPlPct} size="sm" />
      </div>
    ),
  }),
  column.accessor("weight", {
    header: "Weight",
    meta: { numeric: true },
    cell: (info) => percent(info.getValue()),
  }),
]);

const sectors = sectorAllocation.map((s) => ({
  key: s.sector,
  label: s.sector,
  value: s.value,
  display: <Money value={s.value} compact />,
}));

function ValueChart() {
  const t = useChartTokens();
  const config = {
    value: { label: "Portfolio" },
    benchmark: { label: "Benchmark" },
  } satisfies ChartConfig;
  return (
    <ChartContainer
      title="Value over time"
      summary={`Up ${percent(periodReturn)} over ${days}, ahead of the benchmark's ${percent(benchmarkReturn)}.`}
      config={config}
      data={history}
      categoryKey="date"
      categoryLabel="Date"
      formatCategory={shortDate}
      formatValue={money}
      legend="line"
    >
      <LineChart data={history} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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

function FinanceOverview() {
  return (
    <AppShell
      brand={
        <span className="flex items-center gap-sm font-display text-title font-heading">
          <WalletIcon aria-hidden className="size-icon-lg text-accent" />
          Portfolio
        </span>
      }
      nav={
        <AppShellNav>
          <AppShellNavItem href="#overview" current icon={<LayoutDashboardIcon />}>
            Overview
          </AppShellNavItem>
          <AppShellNavItem href="#holdings" icon={<BriefcaseIcon />}>
            Holdings
          </AppShellNavItem>
          <AppShellNavItem href="#activity" icon={<ArrowLeftRightIcon />}>
            Activity
          </AppShellNavItem>
          <AppShellNavItem href="#settings" icon={<SettingsIcon />}>
            Settings
          </AppShellNavItem>
        </AppShellNav>
      }
      sidebarFooter={`Prices as of the ${closeDate} close`}
      header={
        <div className="flex flex-1 items-center justify-between gap-sm">
          <span className="text-label text-subtle">All accounts</span>
          <Badge tone="positive">Synced</Badge>
        </div>
      }
    >
      <div className="flex flex-col gap-lg p-inset-lg">
        <PageHeader
          eyebrow={longDate}
          title="Overview"
          description="Every account in one place, valued at the last close."
          actions={
            <Button variant="secondary">
              <DownloadIcon aria-hidden /> Export
            </Button>
          }
        />

        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total value"
            value={money(portfolioTotal)}
            delta={<Delta value={periodReturn} period={`over ${days}`} />}
          />
          <StatCard
            label="Day change"
            value={formatNumber(dayChange, { format: "currency", sign: "always" })}
            delta={<Delta value={dayChange / previous.value} period="today" />}
          />
          <StatCard
            className="sm:col-span-2 lg:col-span-1"
            label="Total return"
            value={formatNumber(totalReturn, { format: "currency", sign: "always" })}
            delta={<Delta value={totalReturn / invested} period="all time" />}
            description={`Unrealized, on ${money(invested)} invested`}
          />
        </div>

        <Card>
          <CardContent>
            <ValueChart />
          </CardContent>
        </Card>

        {/* Full width, so the bar is long enough to compare sectors and the legend sits on one or two lines. */}
        <Card>
          <CardHeader>
            <CardTitle asChild>
              <h2>Allocation</h2>
            </CardTitle>
            <CardDescription>By sector, as a share of total value.</CardDescription>
          </CardHeader>
          <CardContent>
            <MacroBar label="Allocation by sector" segments={sectors} />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <DataTable
              caption="Holdings"
              itemLabel="holdings"
              itemLabelOne="holding"
              columns={columns}
              data={holdings}
              getRowId={(row) => row.symbol}
              initialSorting={[{ id: "marketValue", desc: true }]}
              search={{ label: "Search holdings", placeholder: "Search symbol or name" }}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export const Default: Story = {
  render: () => <FinanceOverview />,
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible();
    // The chart's last day is October 28; the page's date follows it.
    await expect(canvas.getByText("Wednesday, October 28, 2026")).toBeVisible();
    await expect(canvas.getByRole("figure", { name: "Value over time" })).toBeInTheDocument();
    await expect(canvas.getAllByRole("row")).toHaveLength(holdings.length + 1);
  },
};
