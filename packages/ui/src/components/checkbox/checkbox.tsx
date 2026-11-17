"use client";

// Ported from shadcn/ui (new-york-v4) checkbox, restyled with Plumage tokens.
// Adds an indeterminate state.
import { CheckIcon, MinusIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root>;

/**
 * A yes or no choice that takes effect on submit. For settings that apply
 * immediately, use Switch. Supports checked="indeterminate" for a parent of
 * partially selected children.
 */
export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer group focus-ring size-checkbox shrink-0 rounded-checkbox border border-strong bg-surface",
        "transition-colors duration-(--pl-motion-duration-fast)",
        "data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-on-accent",
        "data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent data-[state=indeterminate]:text-on-accent",
        "disabled:cursor-not-allowed disabled:opacity-disabled aria-invalid:border-negative",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current"
      >
        <CheckIcon
          aria-hidden
          strokeWidth={3}
          className="size-icon-sm group-data-[state=indeterminate]:hidden"
        />
        <MinusIcon
          aria-hidden
          strokeWidth={3}
          className="hidden size-icon-sm group-data-[state=indeterminate]:block"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
