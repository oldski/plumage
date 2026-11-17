"use client";

import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type CellData,
  type ColumnDef,
  type Header,
  type RowData,
  type SortingState,
  type TableFeatures,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, SearchXIcon } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/table/table";
import { Input } from "../../components/input/input";
import { Label } from "../../components/label/label";
import { cn } from "../../lib/cn";
import { EmptyState } from "../empty-state/empty-state";

/* eslint-disable @typescript-eslint/no-unused-vars -- declaration merging must repeat the library's type parameters exactly */
declare module "@tanstack/table-core" {
  interface ColumnMeta<
    in out TFeatures extends TableFeatures,
    in out TData extends RowData,
    TValue extends CellData = CellData,
  > {
    /** Right-align the column and use tabular figures, for numbers that should line up. */
    numeric?: boolean;
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * The TanStack Table features DataTable registers: client-side sorting and a
 * global text filter. Column helpers and definitions are typed against it.
 */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
});

export type DataTableFeatures = typeof dataTableFeatures;
export type DataTableColumn<TData extends RowData> = ColumnDef<DataTableFeatures, TData>;
export type { SortingState };

/** Column helper typed for DataTable. Define columns at module scope so they stay stable. */
export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>();
}

export interface DataTableProps<TData extends RowData> {
  /** Column definitions; keep them stable (module scope or useMemo). */
  columns: DataTableColumn<TData>[];
  data: TData[];
  /** Names the table for everyone, as a visible caption. */
  caption: ReactNode;
  getRowId?: (row: TData, index: number) => string;
  initialSorting?: SortingState;
  /** A search box that filters every text and number column. */
  search?: { label: string; placeholder?: string };
  /** Extra controls in the toolbar row, such as filters or a column menu. */
  toolbar?: ReactNode;
  /** Plural noun for the live count: "positions". */
  itemLabel?: string;
  /** Singular noun, for a count of one: "position". Defaults to itemLabel. */
  itemLabelOne?: string;
  /** Shown when there is no data at all (not when a search matches nothing). */
  empty?: ReactNode;
  /** Mark rows as selected (data-state="selected"). */
  isRowSelected?: (row: TData) => boolean;
  className?: string;
}

const SORT_ICONS = { asc: ArrowUpIcon, desc: ArrowDownIcon, none: ArrowUpDownIcon } as const;
const ARIA_SORT = { asc: "ascending", desc: "descending" } as const;

function headerText<TData extends RowData>(header: Header<DataTableFeatures, TData>) {
  const label = header.column.columnDef.header;
  return typeof label === "string" ? label : header.column.id;
}

/**
 * A sortable, searchable table built on TanStack Table and the Table
 * primitive, so row height and padding follow density. Sorting is announced
 * through aria-sort and a polite status line that also reports how many rows
 * the search leaves.
 */
export function DataTable<TData extends RowData>({
  columns,
  data,
  caption,
  getRowId,
  initialSorting = [],
  search,
  toolbar,
  itemLabel = "rows",
  itemLabelOne,
  empty,
  isRowSelected,
  className,
}: DataTableProps<TData>) {
  const noun = (count: number) => (count === 1 ? (itemLabelOne ?? itemLabel) : itemLabel);
  const searchId = useId();
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    enableSortingRemoval: false,
  });

  const rows = table.getRowModel().rows;
  const leafHeaders = table.getHeaderGroups().at(-1)?.headers ?? [];
  const sorted = sorting[0];
  const sortedHeader = sorted && leafHeaders.find((h) => h.column.id === sorted.id);
  const columnCount = table.getAllLeafColumns().length;
  const hasToolbar = Boolean(search ?? toolbar);

  return (
    <div data-slot="data-table" className={cn("flex flex-col gap-sm", className)}>
      {hasToolbar && (
        <div className="flex flex-wrap items-center gap-sm">
          {search && (
            <div className="w-full sm:w-overlay-xs">
              <Label htmlFor={searchId} className="sr-only">
                {search.label}
              </Label>
              <Input
                id={searchId}
                type="search"
                placeholder={search.placeholder}
                value={globalFilter}
                onChange={(event) => {
                  setGlobalFilter(event.target.value);
                }}
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      <Table>
        <TableCaption className="mt-0 mb-sm caption-top text-left text-label font-label text-muted">
          {caption}
          {/* Polite live region: count after search, and the current sort. */}
          <span role="status" className="ml-sm font-body text-subtle">
            {globalFilter
              ? `${String(rows.length)} of ${String(data.length)} ${noun(data.length)}`
              : `${String(data.length)} ${noun(data.length)}`}
            {sortedHeader && (
              <span className="sr-only">
                , sorted by {headerText(sortedHeader)}, {ARIA_SORT[sorted.desc ? "desc" : "asc"]}
              </span>
            )}
          </span>
        </TableCaption>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => {
                const numeric = header.column.columnDef.meta?.numeric;
                const canSort = header.column.getCanSort();
                const direction = header.column.getIsSorted();
                const SortIcon = SORT_ICONS[direction || "none"];
                return (
                  <TableHead
                    key={header.id}
                    scope="col"
                    aria-sort={canSort ? (direction ? ARIA_SORT[direction] : "none") : undefined}
                    className={cn(numeric && "text-right")}
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          "focus-ring -mx-xs inline-flex cursor-pointer items-center gap-2xs rounded-control px-xs",
                          "transition-colors duration-(--pl-motion-duration-fast) hover:text-default",
                          direction && "text-default",
                          numeric && "flex-row-reverse",
                        )}
                      >
                        <table.FlexRender header={header} />
                        <SortIcon
                          aria-hidden
                          className={cn("size-icon-sm", !direction && "opacity-disabled")}
                        />
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={isRowSelected?.(row.original) ? "selected" : undefined}
            >
              {row.getAllCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(cell.column.columnDef.meta?.numeric && "text-right tabular-nums")}
                >
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="h-auto whitespace-normal">
                {data.length === 0 ? (
                  empty
                ) : (
                  <EmptyState
                    titleAs="p"
                    icon={<SearchXIcon />}
                    title={`No ${itemLabel} match “${globalFilter}”`}
                    description="Try a shorter search, or clear it to see everything."
                  />
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
