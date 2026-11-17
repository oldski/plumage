"use client";

// Ported from shadcn/ui (new-york-v4) dropdown-menu, restyled with Plumage tokens.
import { CheckIcon, ChevronRightIcon, DotIcon } from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { usePortalContainer } from "../../provider/plumage-provider";

// Shared by Select so menus look and behave alike.
export const menuContentClasses = [
  "z-50 min-w-menu overflow-x-hidden overflow-y-auto rounded-menu border border-default bg-raised p-2xs",
  "text-default shadow-overlay",
  "data-[side=top]:-translate-y-2xs data-[side=bottom]:translate-y-2xs data-[side=left]:-translate-x-2xs data-[side=right]:translate-x-2xs",
  "data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out",
];

export const menuItemClasses = [
  "relative flex cursor-default items-center gap-sm rounded-control px-sm py-xs text-body outline-none select-none",
  "data-[highlighted]:bg-hover data-[disabled]:pointer-events-none data-[disabled]:opacity-disabled",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon-md [&_svg:not([class*='text-'])]:text-subtle",
];

/**
 * A list of actions or options opened from a button. Arrow keys move,
 * Enter selects, typing jumps to an item, Escape closes. For choosing a
 * form value, use Select.
 */
export function DropdownMenu(props: ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

export function DropdownMenuTrigger(props: ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

export function DropdownMenuPortal(props: ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  const container = usePortalContainer();
  return (
    <DropdownMenuPrimitive.Portal
      data-slot="dropdown-menu-portal"
      container={container}
      {...props}
    />
  );
}

export function DropdownMenuContent({
  className,
  sideOffset = 0,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPortal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          menuContentClasses,
          "max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin)",
          className,
        )}
        {...props}
      />
    </DropdownMenuPortal>
  );
}

export function DropdownMenuGroup(props: ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

export function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  /** Indent to line up with items that have an icon or indicator. */
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        menuItemClasses,
        "data-[inset]:pl-2xl",
        "data-[variant=destructive]:text-negative data-[variant=destructive]:data-[highlighted]:bg-negative-subtle",
        "data-[variant=destructive]:[&_svg]:text-negative",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(menuItemClasses, "pl-2xl", className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-sm flex size-icon-md items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon aria-hidden className="size-icon-md" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

export function DropdownMenuRadioGroup(
  props: ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>,
) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(menuItemClasses, "pl-2xl", className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-sm flex size-icon-md items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <DotIcon aria-hidden className="size-icon-lg" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

export function DropdownMenuLabel({
  className,
  inset,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("px-sm py-xs text-label font-label text-subtle data-[inset]:pl-2xl", className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-2xs my-2xs h-px bg-(--pl-color-border-subtle)", className)}
      {...props}
    />
  );
}

/** Keyboard shortcut hint. Visual only; wire the shortcut itself in the app. */
export function DropdownMenuShortcut({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("ml-auto font-mono text-caption text-subtle", className)}
      {...props}
    />
  );
}

export function DropdownMenuSub(props: ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

export function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(menuItemClasses, "data-[inset]:pl-2xl data-[state=open]:bg-hover", className)}
      {...props}
    >
      {children}
      <ChevronRightIcon aria-hidden className="ml-auto size-icon-sm" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

export function DropdownMenuSubContent({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPortal>
      <DropdownMenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        className={cn(
          menuContentClasses,
          "origin-(--radix-dropdown-menu-content-transform-origin)",
          className,
        )}
        {...props}
      />
    </DropdownMenuPortal>
  );
}
