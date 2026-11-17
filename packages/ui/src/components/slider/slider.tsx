"use client";

// Ported from shadcn/ui (new-york-v4) slider, restyled with Plumage tokens.
// Track and thumb sizes come from density. One thumb per value, so a range
// slider is value={[min, max]}.
import { Slider as SliderPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export type SliderProps = ComponentProps<typeof SliderPrimitive.Root> & {
  /** Names for the thumbs, in order: ["Minimum", "Maximum"]. One thumb takes the slider's own label. */
  thumbLabels?: readonly string[];
};

/**
 * Picks a value, or a range, from a continuous scale by dragging or with the
 * arrow keys (Page Up and Page Down take bigger steps, Home and End go to the
 * ends). Use it where the exact number matters less than the feel (a target
 * rate, a session length); pair it with a NumberInput when it does matter.
 * Name it with aria-label or aria-labelledby; a range names each thumb with
 * thumbLabels.
 */
export function Slider({
  className,
  value,
  defaultValue,
  min = 0,
  max = 100,
  thumbLabels,
  "aria-label": ariaLabel,
  "aria-labelledby": labelledBy,
  ...props
}: SliderProps) {
  const thumbs = (value ?? defaultValue ?? [min]).length;
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow overflow-hidden rounded-pill bg-(--pl-color-border-strong)",
          "data-[orientation=horizontal]:h-slider-track data-[orientation=horizontal]:w-full",
          "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-(--pl-slider-track-height)",
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-accent data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbs }, (_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          data-slot="slider-thumb"
          // Radix names the root, but the thumb is the slider: it takes the name.
          aria-label={thumbLabels?.[i] ?? ariaLabel}
          aria-labelledby={thumbLabels?.[i] ? undefined : labelledBy}
          className={cn(
            "focus-ring block size-slider-thumb shrink-0 cursor-grab rounded-pill",
            "border border-(--pl-color-border-strong) bg-surface shadow-raised",
            "transition-colors duration-(--pl-motion-duration-fast) hover:border-accent",
            "active:cursor-grabbing",
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}
