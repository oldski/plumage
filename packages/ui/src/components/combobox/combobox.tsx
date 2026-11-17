"use client";

// A Select you can type into: a button that opens a searchable list. Built
// like shadcn/ui's combobox, from Popover and cmdk's Command, restyled with
// Plumage tokens.
import { Command as CommandPrimitive, defaultFilter } from "cmdk";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";

// Like menu items, but cmdk writes data-selected and data-disabled as "true" or
// "false", so the states match on the value, not on the attribute being there.
const itemClasses = cn(
  "relative flex cursor-default items-center gap-sm rounded-control px-sm py-xs text-body outline-none select-none",
  "data-[selected=true]:bg-hover data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-disabled",
  "[&_svg]:pointer-events-none [&_svg]:size-icon-md [&_svg]:shrink-0 [&_svg]:text-subtle",
);

export interface ComboboxOption {
  value: string;
  label: string;
  /** Extra words the search matches, such as a payee's other spellings. */
  keywords?: string[];
  /** A second line under the label. */
  description?: ReactNode;
}

export interface ComboboxProps {
  options: readonly ComboboxOption[];
  /** The chosen option's value, when controlled; null for none. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Shown on the button when nothing is chosen. */
  placeholder?: string;
  /** The search field's placeholder; the field is labelled by the button's label too. */
  searchPlaceholder?: string;
  /** Shown when the search matches nothing. */
  emptyText?: string;
  /** Lets a click on the chosen option clear it. */
  clearable?: boolean;
  /** For a Label's htmlFor; goes on the button. */
  id?: string;
  /** Submits the chosen value with a form, through a hidden input. */
  name?: string;
  /** "sm" for tight places such as a table row, like Select's small trigger. */
  size?: "sm" | "md";
  disabled?: boolean;
  /** Names the button when no visible Label points at it, such as in a table row. */
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  className?: string;
}

/**
 * Picks one value from a long list by typing to narrow it: a category, a
 * payee, an account. For a handful of options, Select is simpler. Label the
 * button with a Label (htmlFor its id) or aria-label.
 */
/**
 * Search matches what people read: the label first, then the keywords. The
 * value (often an id) is never searched, so typing "a1" does not find an
 * option whose id happens to contain it.
 */
const searchLabels = (_value: string, search: string, keywords?: string[]) => {
  const [label = "", ...rest] = keywords ?? [];
  return defaultFilter(label, search, rest);
};

export function Combobox({
  options,
  value,
  defaultValue = null,
  onValueChange,
  placeholder = "Choose…",
  searchPlaceholder = "Search…",
  emptyText = "Nothing matches.",
  clearable = false,
  id,
  name,
  size = "md",
  disabled,
  className,
  ...aria
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [own, setOwn] = useState(defaultValue);
  const chosen = value === undefined ? own : value;
  const selected = options.find((option) => option.value === chosen);

  function choose(next: string | null) {
    if (value === undefined) setOwn(next);
    onValueChange?.(next);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          id={id}
          disabled={disabled}
          data-slot="combobox-trigger"
          data-size={size}
          data-placeholder={selected ? undefined : ""}
          className={cn(
            "focus-ring flex w-full min-w-0 cursor-pointer items-center justify-between gap-sm rounded-input border border-strong bg-surface",
            "data-[size=md]:h-control-md data-[size=md]:px-control-md data-[size=sm]:h-control-sm data-[size=sm]:px-control-sm",
            "text-body whitespace-nowrap text-default data-[placeholder]:text-subtle",
            "disabled:cursor-not-allowed disabled:opacity-disabled aria-invalid:border-negative",
            className,
          )}
          {...aria}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronsUpDownIcon aria-hidden className="size-icon-md shrink-0 text-subtle" />
        </button>
      </PopoverTrigger>
      {name !== undefined && <input type="hidden" name={name} value={chosen ?? ""} />}
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <CommandPrimitive data-slot="combobox" filter={searchLabels} className="flex flex-col">
          <CommandPrimitive.Input
            placeholder={searchPlaceholder}
            className="h-control-md border-b border-default bg-transparent px-control-md text-body text-default outline-none placeholder:text-subtle"
          />
          <CommandPrimitive.List className="max-h-(--pl-size-overlay-sm) overflow-y-auto p-2xs">
            <CommandPrimitive.Empty className="px-sm py-xs text-body text-subtle">
              {emptyText}
            </CommandPrimitive.Empty>
            {options.map((option) => (
              <CommandPrimitive.Item
                key={option.value}
                value={option.value}
                keywords={[option.label, ...(option.keywords ?? [])]}
                onSelect={() => {
                  choose(clearable && option.value === chosen ? null : option.value);
                }}
                className={itemClasses}
              >
                <CheckIcon
                  aria-hidden
                  className={cn(option.value === chosen ? "opacity-100" : "opacity-0")}
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{option.label}</span>
                  {option.description !== undefined && (
                    <span className="text-caption text-subtle">{option.description}</span>
                  )}
                </span>
              </CommandPrimitive.Item>
            ))}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  );
}
