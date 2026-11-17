import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/cn";

/**
 * Dated moments in order, joined by a line: when each debt is paid off, the
 * steps of a plan. Each item is a TimelineItem. Order the items yourself;
 * the timeline does not sort.
 */
export function Timeline({ className, ...props }: ComponentProps<"ol">) {
  return <ol data-slot="timeline" className={cn("flex flex-col", className)} {...props} />;
}

export interface TimelineItemProps extends Omit<ComponentProps<"li">, "title"> {
  title: ReactNode;
  /** When it happens, as words ("March 2027"). */
  time?: ReactNode;
  /** The machine-readable date for time (YYYY-MM or YYYY-MM-DD). */
  dateTime?: string;
  /** A sentence of detail. */
  description?: ReactNode;
  /**
   * done: it has happened (a filled marker). upcoming: it is still ahead (an
   * open marker). The marker is decoration; say "done" in the words when it matters.
   */
  status?: "done" | "upcoming";
}

/** One moment on a Timeline. */
export function TimelineItem({
  title,
  time,
  dateTime,
  description,
  status = "upcoming",
  className,
  ...props
}: TimelineItemProps) {
  return (
    <li
      data-slot="timeline-item"
      data-status={status}
      className={cn("group/timeline flex gap-sm", className)}
      {...props}
    >
      <span aria-hidden className="flex w-(--pl-size-icon-md) shrink-0 flex-col items-center">
        <span
          data-slot="timeline-marker"
          className={cn(
            "mt-2xs size-icon-sm shrink-0 rounded-pill border-(length:--pl-border-width-strong)",
            status === "done" ? "border-accent bg-accent" : "border-strong bg-surface",
          )}
        />
        <span className="mt-2xs w-px flex-1 bg-(--pl-color-border-default) group-last/timeline:hidden" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2xs pb-md group-last/timeline:pb-0">
        <span className="flex flex-wrap items-baseline justify-between gap-x-sm">
          <span className="text-body font-label text-default">{title}</span>
          {time !== undefined && (
            <time dateTime={dateTime} className="text-caption tabular-nums text-muted">
              {time}
            </time>
          )}
        </span>
        {description !== undefined && <p className="text-caption text-muted">{description}</p>}
      </div>
    </li>
  );
}
