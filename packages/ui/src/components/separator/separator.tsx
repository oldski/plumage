"use client";

// Ported from shadcn/ui (new-york-v4) separator, restyled with Plumage tokens.
import { Separator as SeparatorPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export type SeparatorProps = ComponentProps<typeof SeparatorPrimitive.Root>;

/**
 * A dividing line. Decorative by default (hidden from assistive tech); set
 * decorative={false} when the line separates meaningful sections.
 */
export function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-(--pl-color-border-default)",
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}
