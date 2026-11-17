import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface EmptyStateProps extends Omit<ComponentProps<"div">, "title"> {
  /** A simple line icon. Decorative; it is hidden from assistive tech. */
  icon?: ReactNode;
  title: ReactNode;
  /** Heading level that fits the page outline. Use "p" inside a table or card that already has a heading. */
  titleAs?: "h2" | "h3" | "h4" | "p";
  /** Why it is empty and what to do next, in one or two sentences. */
  description?: ReactNode;
  /** The next step, usually one Button. */
  action?: ReactNode;
}

/**
 * Explains why there is nothing to show and offers the next step. Use for
 * first-run states ("Import a CSV to see positions") and for filters that
 * match nothing ("No positions match VTX").
 */
export function EmptyState({
  icon,
  title,
  titleAs: Title = "h2",
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-sm p-inset-lg text-center",
        className,
      )}
      {...props}
    >
      {icon && (
        <div
          aria-hidden
          className="flex size-empty-state-icon items-center justify-center rounded-pill bg-sunken text-subtle [&_svg]:size-icon-lg"
        >
          {icon}
        </div>
      )}
      <div className="flex max-w-overlay-sm flex-col gap-2xs">
        <Title className="text-title font-heading text-default">{title}</Title>
        {description && <p className="text-body text-muted">{description}</p>}
      </div>
      {action && <div className="mt-xs flex flex-wrap justify-center gap-sm">{action}</div>}
    </div>
  );
}
