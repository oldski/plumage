"use client";

import { resolve, type TokenName } from "@plumage/tokens";
import { TableIcon } from "lucide-react";
import {
  useId,
  useMemo,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import { ResponsiveContainer, type TooltipContentProps } from "recharts";
import { Button } from "../../components/button/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/table/table";
import { MAX_CATEGORICAL_SERIES, seriesColor, seriesIdent } from "../../lib/chart";
import { cn } from "../../lib/cn";
import { usePlumage } from "../../provider/plumage-provider";

/** A categorical slot (1 to 8), or a delta color when the series means gain or loss. */
export type ChartColor = number | "positive" | "negative" | "neutral";

export interface ChartSeries {
  /** Shown in the legend, the tooltip, and the table header. Plain text only. */
  label: string;
  /** Defaults to the next categorical slot, in config order. */
  color?: ChartColor;
}

/** Series (or, for a pie, slices) keyed by data field or category name. Order sets color. */
export type ChartConfig = Record<string, ChartSeries>;

type Row = Record<string, unknown>;

export interface ChartContainerProps extends Omit<ComponentProps<"figure">, "title" | "children"> {
  /** Visible title; names the figure. */
  title: ReactNode;
  /** One or two sentences stating what the chart shows; the takeaway, not a description of the axes. */
  summary: ReactNode;
  config: ChartConfig;
  /** The rows the chart draws; also rendered by the table view. */
  data: readonly Row[];
  /** Field for the x axis or slice name. */
  categoryKey: string;
  /** Header for the category column in the table view. Defaults to categoryKey. */
  categoryLabel?: string;
  /** Wide format (default): one column per series. Long format: one row per category with a single valueKey. */
  valueKey?: string;
  formatValue?: (value: number, seriesKey: string) => string;
  formatCategory?: (value: unknown) => string;
  height?: "sm" | "md" | "lg";
  /** Legend swatch shape: match the mark (line for line charts, rect for bars, areas, and slices). */
  legend?: "rect" | "line" | false;
  /** Keep the previous render, dimmed, while new data loads. */
  pending?: boolean;
  /** Extra controls in the header row. */
  actions?: ReactNode;
  /** A single Recharts chart (LineChart, BarChart, PieChart, ...). */
  children: ReactElement;
}

const HEIGHT_TOKEN = {
  sm: "size.chart.sm",
  md: "size.chart.md",
  lg: "size.chart.lg",
} as const satisfies Record<string, TokenName>;
const HEIGHT_CLASS = { sm: "h-chart-sm", md: "h-chart-md", lg: "h-chart-lg" } as const;

function colorVar(color: ChartColor): string {
  if (typeof color === "number") return `var(--pl-color-chart-categorical-${String(color)})`;
  return `var(--pl-color-chart-delta-${color})`;
}

/** Resolve each series' color: explicit choices first, then categorical slots in order. */
function seriesStyles(config: ChartConfig): CSSProperties {
  let slot = 0;
  // Custom properties are valid style keys; React passes them through.
  const style: CSSProperties & Record<string, string> = {};
  for (const [key, series] of Object.entries(config)) {
    let color = series.color;
    if (color === undefined) {
      slot += 1;
      if (slot > MAX_CATEGORICAL_SERIES) {
        throw new Error(
          `ChartContainer: more than ${String(MAX_CATEGORICAL_SERIES)} categorical series. Fold the rest into "Other" (foldToOther) or use small multiples; colors are never cycled.`,
        );
      }
      color = slot;
    }
    style[`--series-${seriesIdent(key)}`] = colorVar(color);
  }
  return style;
}

const toPx = (value: string) =>
  value.endsWith("rem") ? parseFloat(value) * 16 : parseFloat(value);

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

/**
 * Values for Recharts props, resolved from tokens for the active brand and
 * density: line width, the surface gap between touching marks, bar corner
 * radius, maximum bar thickness, and an entrance animation that uses the
 * brand's slow duration and switches off under prefers-reduced-motion.
 */
export function useChartTokens() {
  const { brand, resolvedMode: mode, density } = usePlumage();
  const reducedMotion = useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );
  return useMemo(() => {
    const px = (name: TokenName) => toPx(resolve(name, { brand, mode, density }));
    return {
      lineWidth: px("chart.line.stroke"),
      markGap: px("chart.mark.gap"),
      markRadius: px("chart.mark.radius"),
      barThickness: px("chart.bar.thickness"),
      animate: !reducedMotion,
      animationDuration: parseFloat(resolve("motion.duration.slow", { brand, mode, density })),
    };
  }, [brand, mode, density, reducedMotion]);
}

const defaultFormatValue = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);

/**
 * Wraps one Recharts chart in an accessible figure: a title, a written
 * summary, a legend whenever there are two or more series, a token-styled
 * tooltip, and a table view of the same data. Series colors come from the
 * validated categorical palette in config order and are never cycled.
 */
export function ChartContainer({
  title,
  summary,
  config,
  data,
  categoryKey,
  categoryLabel = categoryKey,
  valueKey,
  formatValue = defaultFormatValue,
  formatCategory = String,
  height = "md",
  legend = "rect",
  pending = false,
  actions,
  children,
  className,
  style,
  ...props
}: ChartContainerProps) {
  const titleId = useId();
  const summaryId = useId();
  const [view, setView] = useState<"chart" | "table">("chart");
  const { brand, resolvedMode, density } = usePlumage();
  const heightPx = toPx(resolve(HEIGHT_TOKEN[height], { brand, mode: resolvedMode, density }));
  const entries = Object.entries(config);
  const showLegend = legend !== false && entries.length >= 2;

  return (
    <figure
      data-slot="chart"
      aria-labelledby={titleId}
      aria-describedby={summaryId}
      aria-busy={pending || undefined}
      style={{ ...seriesStyles(config), ...style }}
      className={cn(
        "flex flex-col gap-sm",
        // Chart furniture: hairline, recessive, never dashed; text in ink tokens.
        "[&_.recharts-cartesian-grid_line]:stroke-(--pl-color-chart-grid)",
        "[&_.recharts-cartesian-axis-line]:stroke-(--pl-color-chart-axis) [&_.recharts-cartesian-axis-tick-line]:stroke-(--pl-color-chart-axis)",
        "[&_.recharts-cartesian-axis-tick_text]:fill-(--pl-color-text-subtle) [&_.recharts-text]:text-caption",
        "[&_.recharts-tooltip-cursor]:stroke-(--pl-color-chart-axis) [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-(--pl-color-bg-hover)",
        // Surface-colored ring around dots and gap between slices.
        "[&_.recharts-dot]:stroke-(--pl-color-bg-surface) [&_.recharts-active-dot_circle]:stroke-(--pl-color-bg-surface)",
        "[&_.recharts-sector]:stroke-(--pl-color-bg-surface)",
        "[&_.recharts-surface]:focus-ring [&_.recharts-surface]:rounded-control",
        className,
      )}
      {...props}
    >
      <div className="flex flex-wrap items-start justify-between gap-sm">
        <div className="flex min-w-0 flex-col gap-2xs">
          <figcaption id={titleId} className="text-title font-heading text-default">
            {title}
          </figcaption>
          <p id={summaryId} className="text-body text-muted">
            {summary}
          </p>
        </div>
        <div className="flex items-center gap-xs">
          {actions}
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={view === "table"}
            onClick={() => {
              setView(view === "table" ? "chart" : "table");
            }}
          >
            <TableIcon aria-hidden />
            Table
          </Button>
        </div>
      </div>

      {showLegend && view === "chart" && (
        <ul aria-label="Legend" className="flex flex-wrap gap-x-md gap-y-2xs">
          {entries.map(([key, series]) => (
            <li key={key} className="flex items-center gap-xs text-caption text-muted">
              <span
                aria-hidden
                className={cn(
                  "shrink-0 rounded-indicator",
                  legend === "line" ? "h-(--pl-chart-line-stroke) w-md" : "size-icon-sm",
                )}
                style={{ backgroundColor: seriesColor(key) }}
              />
              {series.label}
            </li>
          ))}
        </ul>
      )}

      {view === "chart" ? (
        <div
          className={cn(
            HEIGHT_CLASS[height],
            "w-full transition-opacity duration-(--pl-motion-duration-medium)",
            pending && "opacity-disabled",
          )}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: heightPx * 2, height: heightPx }}
          >
            {children}
          </ResponsiveContainer>
        </div>
      ) : (
        <ChartTable
          config={config}
          data={data}
          categoryKey={categoryKey}
          categoryLabel={categoryLabel}
          valueKey={valueKey}
          formatValue={formatValue}
          formatCategory={formatCategory}
        />
      )}
    </figure>
  );
}

function ChartTable({
  config,
  data,
  categoryKey,
  categoryLabel,
  valueKey,
  formatValue,
  formatCategory,
}: Pick<ChartContainerProps, "config" | "data" | "categoryKey" | "valueKey"> &
  Required<Pick<ChartContainerProps, "formatValue" | "formatCategory" | "categoryLabel">>) {
  // Long format (one value per row, as in a pie) gets a single value column.
  const columns = valueKey
    ? [[valueKey, "Value"] as const]
    : Object.entries(config).map(([key, series]) => [key, series.label] as const);
  return (
    <Table>
      <TableCaption className="sr-only">Data table</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">{categoryLabel}</TableHead>
          {columns.map(([key, label]) => (
            <TableHead key={key} scope="col" className="text-right">
              {label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => {
          const category = row[categoryKey];
          const name =
            valueKey && typeof category === "string"
              ? (config[category]?.label ?? category)
              : formatCategory(category);
          return (
            <TableRow key={index}>
              <TableHead scope="row" className="h-table-row font-body text-default">
                {name}
              </TableHead>
              {columns.map(([key]) => (
                <TableCell key={key} className="text-right tabular-nums">
                  {typeof row[key] === "number" ? formatValue(row[key], key) : ""}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export interface ChartTooltipContentProps extends Partial<TooltipContentProps> {
  config: ChartConfig;
  formatValue?: (value: number, seriesKey: string) => string;
  formatCategory?: (value: unknown) => string;
  /** Hide the category heading (useful for pies, where the slice name is the series). */
  hideLabel?: boolean;
}

/**
 * Tooltip body for Recharts' <Tooltip content={...} />. Values lead in strong
 * ink; series names follow; each row is keyed by a short line in the series
 * color. Text never takes the series color.
 */
export function ChartTooltipContent({
  active,
  payload,
  label,
  config,
  formatValue = defaultFormatValue,
  formatCategory = String,
  hideLabel = false,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-menu rounded-control border border-default bg-raised p-sm text-caption text-default shadow-overlay">
      {!hideLabel && label !== undefined && (
        <p className="mb-2xs text-subtle">{formatCategory(label)}</p>
      )}
      <ul className="flex flex-col gap-2xs">
        {payload.map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? index);
          const seriesKey = config[key] ? key : String(item.name ?? key);
          const value = typeof item.value === "number" ? item.value : Number(item.value);
          return (
            <li key={seriesKey} className="flex items-center gap-sm">
              <span
                aria-hidden
                className="h-(--pl-chart-line-stroke) w-sm shrink-0 rounded-pill"
                style={{ backgroundColor: seriesColor(seriesKey) }}
              />
              <span className="font-strong tabular-nums">{formatValue(value, seriesKey)}</span>
              <span className="text-muted">{config[seriesKey]?.label ?? seriesKey}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
