// Ported from shadcn/ui (new-york-v4) table, restyled with Plumage tokens.
// Row height and cell padding are component tokens, so tables follow density.
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

/**
 * Semantic HTML table for static, already-shaped data. Give it a caption or
 * aria-label. For sorting, filtering, and large data sets, use DataTable.
 * Align numbers right with tabular figures: className="text-right tabular-nums".
 */
export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom border-collapse text-body", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b [&_tr]:border-default [&_tr]:hover:bg-transparent", className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

export function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-default bg-sunken font-strong [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-subtle transition-colors duration-(--pl-motion-duration-fast)",
        "hover:bg-hover data-[state=selected]:bg-selected",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-table-header px-table-cell-x text-left align-middle text-label font-label whitespace-nowrap text-subtle",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("h-table-row px-table-cell-x align-middle whitespace-nowrap", className)}
      {...props}
    />
  );
}

export function TableCaption({ className, ...props }: ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-md text-caption text-subtle", className)}
      {...props}
    />
  );
}
