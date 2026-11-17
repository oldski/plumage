"use client";

// Ported from shadcn/ui (new-york-v4) label, restyled with Plumage tokens.
import { Label as LabelPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export type LabelProps = ComponentProps<typeof LabelPrimitive.Root>;

/** Names a form control. Point htmlFor at the control's id, or wrap the control. */
export function Label({ className, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-xs text-label font-label text-default select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-disabled",
        className,
      )}
      {...props}
    />
  );
}
