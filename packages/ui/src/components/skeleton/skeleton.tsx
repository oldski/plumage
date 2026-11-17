// Ported from shadcn/ui (new-york-v4) skeleton, restyled with Plumage tokens.
// Uses the translucent bg.active wash so it shows on any surface in any mode.
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

/**
 * Placeholder for content that is loading. Hidden from assistive tech: set
 * aria-busy="true" on the region that is loading, and announce completion
 * in that region's content.
 */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("animate-pulse rounded-control bg-active", className)}
      {...props}
    />
  );
}
