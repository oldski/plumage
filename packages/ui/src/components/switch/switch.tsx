"use client";

// Ported from shadcn/ui (new-york-v4) switch, restyled with Plumage tokens.
// Track and thumb sizes come from density, so the switch shrinks in compact.
import { Switch as SwitchPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export type SwitchProps = ComponentProps<typeof SwitchPrimitive.Root>;

/**
 * Turns a setting on or off immediately. For choices that take effect on
 * submit, use Checkbox. Always give it a visible Label.
 */
export function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer focus-ring inline-flex h-switch-track w-switch-track shrink-0 cursor-pointer items-center",
        "rounded-pill border border-transparent transition-colors duration-(--pl-motion-duration-fast)",
        "data-[state=checked]:bg-accent data-[state=unchecked]:bg-(--pl-color-border-strong)",
        "disabled:cursor-not-allowed disabled:opacity-disabled",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-switch-thumb rounded-pill bg-surface shadow-raised",
          "transition-transform duration-(--pl-motion-duration-fast) ease-standard",
          "data-[state=checked]:bg-(--pl-color-text-on-accent)",
          "data-[state=checked]:translate-x-[calc(var(--pl-switch-track-width)-var(--pl-switch-thumb-size)-2*var(--pl-border-width-default))]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
