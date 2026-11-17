"use client";

// Ported from shadcn/ui (new-york-v4) tooltip, restyled with Plumage tokens.
// The gap between trigger and tooltip is a token translate, not a pixel
// sideOffset, so it follows density.
import { Tooltip as TooltipPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { usePortalContainer } from "../../provider/plumage-provider";

export function TooltipProvider({
  delayDuration = 300,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

/**
 * A short, supplementary label shown on hover and keyboard focus. Never put
 * essential information or interactive content in a tooltip; it is invisible
 * on touch screens. Icon-only buttons still need their own aria-label.
 */
export function Tooltip(props: ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

export function TooltipTrigger(props: ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

export function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  const container = usePortalContainer();
  return (
    <TooltipPrimitive.Portal container={container}>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-fit max-w-tooltip origin-(--radix-tooltip-content-transform-origin) rounded-tooltip bg-inverse px-sm py-xs",
          "text-caption text-balance text-inverse",
          "data-[side=top]:-translate-y-xs data-[side=bottom]:translate-y-xs data-[side=left]:-translate-x-xs data-[side=right]:translate-x-xs",
          "data-[state=delayed-open]:animate-fade-in data-[state=instant-open]:animate-fade-in data-[state=closed]:animate-fade-out",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-(--pl-color-bg-inverse)" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
