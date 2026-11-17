import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { storyCanvas } from "../../stories/story-canvas";
import { Badge } from "../badge/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

const meta = {
  title: "Primitives/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Semantic HTML table for small, already-shaped data.

**Do**
- Give it a \`TableCaption\` or \`aria-label\`.
- Right-align numbers and use tabular figures (\`text-right tabular-nums\`).
- Mark a selected row with \`data-state="selected"\`.

**Don't**
- Build sorting or filtering on top of it. Use the DataTable pattern (step 4).
- Rely on red and green alone for gains and losses; include the sign.

**Accessibility**
- Real \`<table>\`, \`<th>\`, and \`<caption>\` elements, so screen readers announce headers with each cell.
- Row height and cell padding are component tokens that follow density.
`,
      },
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  { symbol: "VTI", source: "CSV", qty: "48", value: "$13,402.08", pl: "+$1,204.11", up: true },
  { symbol: "AAPL", source: "Agentic", qty: "12", value: "$2,746.20", pl: "-$88.40", up: false },
  { symbol: "BND", source: "CSV", qty: "30", value: "$2,181.30", pl: "+$12.90", up: true },
];

export const Positions: Story = {
  render: () => (
    <Table>
      <TableCaption>Positions across both sources, as of the last snapshot.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Symbol</TableHead>
          <TableHead scope="col">Source</TableHead>
          <TableHead scope="col" className="text-right">
            Quantity
          </TableHead>
          <TableHead scope="col" className="text-right">
            Market value
          </TableHead>
          <TableHead scope="col" className="text-right">
            Unrealized P/L
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.symbol} data-state={row.symbol === "AAPL" ? "selected" : undefined}>
            <TableCell className="font-label">{row.symbol}</TableCell>
            <TableCell>
              <Badge tone={row.source === "CSV" ? "neutral" : "accent"}>{row.source}</Badge>
            </TableCell>
            <TableCell className="text-right tabular-nums">{row.qty}</TableCell>
            <TableCell className="text-right tabular-nums">{row.value}</TableCell>
            <TableCell
              className={`text-right tabular-nums ${row.up ? "text-positive" : "text-negative"}`}
            >
              {row.pl}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right tabular-nums">$18,329.58</TableCell>
          <TableCell className="text-right tabular-nums text-positive">+$1,128.61</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const table = storyCanvas(canvasElement).getByRole("table", {
      name: /Positions across both sources/,
    });
    await expect(within(table).getAllByRole("columnheader")).toHaveLength(5);
  },
};
