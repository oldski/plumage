import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileUpIcon } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";
import { Badge } from "../../components/badge/badge";
import { Button } from "../../components/button/button";
import { formatNumber } from "../../lib/format";
import { holdings, type SampleHolding } from "../../stories/sample-data";
import { storyCanvas } from "../../stories/story-canvas";
import { Delta } from "../delta/delta";
import { EmptyState } from "../empty-state/empty-state";
import { createDataTableColumnHelper, DataTable } from "./data-table";

const column = createDataTableColumnHelper<SampleHolding>();
const money = (value: number) => formatNumber(value, { format: "currency" });

// Module scope keeps columns stable across renders, as TanStack Table requires.
const columns = column.columns([
  // The value includes the name so search matches either; it sorts by symbol first.
  column.accessor((row) => `${row.symbol} ${row.name}`, {
    id: "symbol",
    header: "Symbol",
    cell: (info) => (
      <div className="flex flex-col">
        <span className="font-label">{info.row.original.symbol}</span>
        <span className="text-caption text-subtle">{info.row.original.name}</span>
      </div>
    ),
  }),
  column.accessor("source", {
    header: "Source",
    cell: (info) => (
      <Badge tone={info.getValue() === "CSV" ? "neutral" : "accent"}>{info.getValue()}</Badge>
    ),
  }),
  column.accessor("quantity", { header: "Quantity", meta: { numeric: true } }),
  column.accessor("price", {
    header: "Price",
    meta: { numeric: true },
    cell: (info) => money(info.getValue()),
  }),
  column.accessor("marketValue", {
    header: "Market value",
    meta: { numeric: true },
    cell: (info) => money(info.getValue()),
  }),
  column.accessor("unrealizedPlPct", {
    header: "Unrealized P/L",
    meta: { numeric: true },
    cell: (info) => <Delta value={info.getValue()} size="sm" />,
  }),
  column.accessor("weight", {
    header: "% of portfolio",
    meta: { numeric: true },
    cell: (info) => formatNumber(info.getValue(), { format: "percent", precision: 1 }),
  }),
]);

const meta = {
  title: "Patterns/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
A sortable, searchable table on TanStack Table, built from the Table primitive so rows follow density.

**Do**
- Define columns at module scope (or \`useMemo\`) with \`createDataTableColumnHelper<Row>()\`.
- Mark number columns \`meta: { numeric: true }\`: they right-align and use tabular figures.
- Give it a \`caption\` and an \`itemLabel\` ("positions") so the live count reads naturally.
- Render gains and losses with \`Delta\`, so direction is never color alone.

**Don't**
- Paginate a few hundred rows; search and sort are faster to use.
- Hide the search box label; it is visually hidden but always present.

**Accessibility**
- Sortable headers are buttons inside \`<th aria-sort>\`. Number columns sort largest first, text columns A to Z, then each flips.
- A polite status line announces the row count after a search and the current sort.
- A search that matches nothing shows an empty state in the table body, instead of an empty table.
`,
      },
    },
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj;

export const Holdings: Story = {
  render: () => (
    <DataTable
      caption="Positions"
      itemLabel="positions"
      columns={columns}
      data={holdings}
      getRowId={(row) => row.symbol}
      initialSorting={[{ id: "marketValue", desc: true }]}
      search={{ label: "Search positions", placeholder: "Search symbol or name" }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    const header = canvas.getByRole("columnheader", { name: /Market value/ });
    await expect(header).toHaveAttribute("aria-sort", "descending");

    await userEvent.click(within(header).getByRole("button"));
    await expect(header).toHaveAttribute("aria-sort", "ascending");
    await expect(canvas.getByRole("status")).toHaveTextContent(/sorted by Market value, ascending/);

    await userEvent.type(canvas.getByRole("searchbox", { name: "Search positions" }), "micro");
    await expect(canvas.getByRole("status")).toHaveTextContent("1 of 8 positions");
    await expect(canvas.getAllByRole("row")).toHaveLength(2);
  },
};

export const NoMatches: Story = {
  render: () => (
    <DataTable
      caption="Positions"
      itemLabel="positions"
      columns={columns}
      data={holdings}
      search={{ label: "Search positions" }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = storyCanvas(canvasElement);
    await userEvent.type(canvas.getByRole("searchbox"), "zzz");
    await expect(canvas.getByText("No positions match “zzz”")).toBeVisible();
  },
};

export const Empty: Story = {
  render: () => (
    <DataTable
      caption="Positions"
      itemLabel="positions"
      columns={columns}
      data={[]}
      empty={
        <EmptyState
          titleAs="p"
          icon={<FileUpIcon />}
          title="No positions yet"
          description="Import a CSV to see your holdings here."
          action={<Button>Import CSV</Button>}
        />
      }
    />
  ),
};

export const SelectedRow: Story = {
  render: () => (
    <DataTable
      caption="Positions"
      itemLabel="positions"
      columns={columns}
      data={holdings}
      isRowSelected={(row) => row.symbol === "AAPL"}
    />
  ),
};
