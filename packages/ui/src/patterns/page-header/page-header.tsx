import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface PageHeaderProps extends Omit<ComponentProps<"div">, "title"> {
  /** The page's single h1. */
  title: ReactNode;
  /** One sentence on what the page is for. */
  description?: ReactNode;
  /** Small text above the title: a breadcrumb, a section name, or a timestamp. */
  eyebrow?: ReactNode;
  /** Page-level actions, aligned to the end. Put the primary action last. */
  actions?: ReactNode;
  /** Draw a divider under the header. */
  separated?: boolean;
}

/**
 * The top of a page: its h1, a short description, and page-level actions.
 * Renders the only h1, so use one per page.
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  separated = false,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        "flex flex-wrap items-end justify-between gap-md",
        separated && "border-b border-default pb-lg",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-2xs">
        {eyebrow && <div className="text-label font-label text-subtle">{eyebrow}</div>}
        <h1 className="display-heading text-default">{title}</h1>
        {description && <p className="max-w-overlay-lg text-body text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-sm">{actions}</div>}
    </div>
  );
}
