// Ported from shadcn/ui (new-york-v4) alert, restyled with Plumage tokens.
// Tones replace shadcn's default/destructive pair, and the live role is opt-in.
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export const alertVariants = cva(
  [
    "relative grid w-full grid-cols-[0_1fr] items-start gap-y-2xs rounded-container border p-inset-sm text-body",
    "has-[>svg]:grid-cols-[var(--pl-size-icon-md)_1fr] has-[>svg]:gap-x-sm",
    "[&>svg]:mt-2xs [&>svg]:size-icon-md [&>svg]:shrink-0",
  ],
  {
    variants: {
      tone: {
        neutral: "border-default bg-surface text-default [&>svg]:text-subtle",
        info: "border-info-subtle bg-info-subtle text-default [&>svg]:text-info",
        positive: "border-positive-subtle bg-positive-subtle text-default [&>svg]:text-positive",
        warning: "border-warning-subtle bg-warning-subtle text-default [&>svg]:text-warning",
        negative: "border-negative-subtle bg-negative-subtle text-default [&>svg]:text-negative",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type AlertProps = ComponentProps<"div"> & VariantProps<typeof alertVariants>;

/**
 * A callout that stays on the page: stale data, an import's caveats, a
 * connection problem. Start with an icon that matches the tone, then an
 * AlertTitle and an AlertDescription.
 *
 * Not a live region by default. Pass role="alert" only for urgent messages
 * that appear while someone is working; role="status" for polite updates.
 */
export function Alert({ className, tone = "neutral", ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      data-tone={tone}
      className={cn(alertVariants({ tone }), className)}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 font-label text-default", className)}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("col-start-2 text-muted", className)}
      {...props}
    />
  );
}
