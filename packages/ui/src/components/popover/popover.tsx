"use client";

// Ported from shadcn/ui (new-york-v4) popover, restyled with Plumage tokens.
import { Popover as PopoverPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { usePortalContainer } from "../../provider/plumage-provider";
import { menuContentClasses } from "../dropdown-menu/dropdown-menu";

/**
 * Rich content anchored to a trigger: a calendar, a filter form, a searchable
 * list. Focus moves inside when it opens and returns to the trigger when it
 * closes; Escape and clicking outside close it. For a list of actions, use
 * DropdownMenu; for a short hint, Tooltip.
 */
export function Popover(props: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

export function PopoverTrigger(props: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

export function PopoverAnchor(props: ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export function PopoverContent({
  className,
  align = "start",
  sideOffset = 0,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  const container = usePortalContainer();
  return (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          menuContentClasses,
          "origin-(--radix-popover-content-transform-origin) p-sm",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
