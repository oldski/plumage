// Ported from shadcn/ui (new-york-v4) badge, restyled with Plumage tokens.
// Variants are tones rather than shadcn's emphasis levels, because status is
// the main thing badges carry in a data product.
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center gap-2xs rounded-badge border border-transparent px-sm",
    "text-label font-label whitespace-nowrap",
    "[&>svg]:pointer-events-none [&>svg]:size-icon-sm",
  ],
  {
    variants: {
      tone: {
        neutral: "bg-sunken text-muted",
        accent: "bg-accent-subtle text-accent",
        positive: "bg-positive-subtle text-positive",
        negative: "bg-negative-subtle text-negative",
        warning: "bg-warning-subtle text-warning",
        info: "bg-info-subtle text-info",
        outline: "border-default text-muted",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  };

/**
 * A short label for status or category. Tone is never the only signal: the
 * text must say what the color means ("Down 2%", not just red).
 */
export function Badge({ className, tone = "neutral", asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span";
  return (
    <Comp
      data-slot="badge"
      data-tone={tone}
      className={cn(badgeVariants({ tone }), className)}
      {...props}
    />
  );
}
