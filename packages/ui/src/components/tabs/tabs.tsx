"use client";

// Ported from shadcn/ui (new-york-v4) tabs, restyled with Plumage tokens.
// The line variant's indicator uses the text-safe accent so the selected tab
// meets 3:1 against the surface in every brand.
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

/**
 * Switches between views of related content in the same place. Arrow keys
 * move between tabs; Tab moves into the panel.
 */
export function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      orientation={orientation}
      className={cn("group/tabs flex gap-sm data-[orientation=horizontal]:flex-col", className)}
      {...props}
    />
  );
}

export const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "gap-2xs rounded-control bg-sunken p-2xs text-muted",
        line: "gap-md border-b border-default text-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function TabsList({
  className,
  variant = "default",
  ...props
}: ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "focus-ring relative inline-flex h-control-sm cursor-pointer items-center justify-center gap-xs px-control-sm",
        "text-label font-label whitespace-nowrap text-muted transition-colors duration-(--pl-motion-duration-fast)",
        "hover:text-default data-[state=active]:text-default",
        "disabled:pointer-events-none disabled:opacity-disabled [&_svg]:size-icon-sm",
        "group-data-[variant=default]/tabs-list:rounded-control",
        "group-data-[variant=default]/tabs-list:data-[state=active]:bg-surface group-data-[variant=default]/tabs-list:data-[state=active]:shadow-raised",
        "group-data-[variant=line]/tabs-list:after:absolute group-data-[variant=line]/tabs-list:after:inset-x-0 group-data-[variant=line]/tabs-list:after:-bottom-px",
        "group-data-[variant=line]/tabs-list:after:h-(--pl-focus-ring-width) group-data-[variant=line]/tabs-list:data-[state=active]:after:bg-(--pl-color-accent-text)",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("focus-ring flex-1 rounded-control", className)}
      {...props}
    />
  );
}
