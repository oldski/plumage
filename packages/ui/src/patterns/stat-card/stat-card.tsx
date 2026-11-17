import type { ComponentProps, ReactNode } from "react";
import { Card } from "../../components/card/card";
import { Skeleton } from "../../components/skeleton/skeleton";
import { cn } from "../../lib/cn";

export interface StatCardProps extends Omit<ComponentProps<"div">, "children"> {
  /** What the number is, in sentence case with no trailing colon: "Total value". */
  label: ReactNode;
  /** The figure, already formatted. Use formatNumber(..., { compact: true }) for large values. */
  value: ReactNode;
  /** Usually a <Delta /> with a named period. */
  delta?: ReactNode;
  /** One line of context under the figure: "Cash, 12% of portfolio". */
  description?: ReactNode;
  /** Optional slot to the right of the label, such as an info tooltip. */
  action?: ReactNode;
  /** Shows placeholders and marks the card busy. */
  loading?: boolean;
}

/**
 * One headline number with its label and change. The label and value form a
 * description list, so assistive tech reads "Total value, $48,210.55, Up
 * 1.24% today" as one unit.
 */
export function StatCard({
  label,
  value,
  delta,
  description,
  action,
  loading = false,
  className,
  ...props
}: StatCardProps) {
  return (
    <Card
      data-slot="stat-card"
      aria-busy={loading || undefined}
      className={cn("gap-xs px-card", className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-sm">
        <dl className="flex min-w-0 flex-col gap-xs">
          <dt className="text-label font-label text-muted">{label}</dt>
          {loading ? (
            <>
              <dd>
                <Skeleton className="h-row-md w-2/3" />
              </dd>
              {delta !== undefined && (
                <dd>
                  <Skeleton className="h-row-sm w-1/3" />
                </dd>
              )}
            </>
          ) : (
            <>
              {/*
               * The brand's display figures: proportional and lining, never
               * tabular. A figure wider than the card wraps onto a second
               * line instead of running past the edge, so it is never cut off.
               */}
              <dd className="display-figure wrap-break-word text-default">{value}</dd>
              {delta !== undefined && <dd>{delta}</dd>}
            </>
          )}
        </dl>
        {action}
      </div>
      {description && <p className="text-caption text-subtle">{description}</p>}
    </Card>
  );
}
