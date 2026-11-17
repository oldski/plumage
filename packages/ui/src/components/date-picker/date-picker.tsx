"use client";

// A date field: a button that opens a month calendar. Built like shadcn/ui's
// date picker, from Popover and react-day-picker, restyled with Plumage tokens.
// Dates are plain "2026-10-30" strings in and out, never Date objects, so no
// time zone can move them a day.
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "../../lib/cn";
import { buttonVariants } from "../button/button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";

/** "2026-10-30" as a local Date at midnight, or undefined when it is not a date. */
export function fromIsoDate(value: string | null | undefined): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  // "2026-02-30" would roll over to March 2; a day that does not exist is not a date.
  return toIsoDate(date) === value ? date : undefined;
}

/** A local Date as "2026-10-30". */
export function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export type CalendarProps = ComponentProps<typeof DayPicker>;

/** A month grid. Arrow keys move by day and week, Page Up and Down by month. */
export function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      data-slot="calendar"
      showOutsideDays
      className={cn("text-body text-default", className)}
      classNames={{
        months: "relative flex flex-col gap-md",
        month: "flex flex-col gap-sm",
        month_caption: "flex h-control-sm items-center justify-center",
        caption_label: "text-label font-label",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: cn(buttonVariants({ variant: "ghost", size: "icon-sm" })),
        button_next: cn(buttonVariants({ variant: "ghost", size: "icon-sm" })),
        month_grid: "border-collapse",
        weekdays: "flex",
        weekday: "w-(--pl-size-control-sm) text-caption font-label text-subtle",
        week: "flex",
        day: "size-control-sm p-0 text-center",
        day_button: cn(
          "focus-ring size-control-sm cursor-pointer rounded-control tabular-nums",
          "hover:bg-hover disabled:cursor-not-allowed",
        ),
        selected: "[&>button]:bg-accent [&>button]:text-on-accent [&>button]:hover:bg-accent-hover",
        today: "[&>button]:font-label [&>button]:underline",
        outside: "text-subtle",
        disabled: "opacity-disabled",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeftIcon aria-hidden className="size-icon-md" />
          ) : (
            <ChevronRightIcon aria-hidden className="size-icon-md" />
          ),
      }}
      {...props}
    />
  );
}

export interface DatePickerProps {
  /** "2026-10-30", when controlled; null for no date. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Earliest and latest dates that can be picked, as "2026-10-30". */
  min?: string;
  max?: string;
  placeholder?: string;
  /** For an optional date: a Clear button under the calendar sets it back to none. */
  clearable?: boolean;
  /** How the chosen date reads on the button. */
  locale?: string;
  /** For a Label's htmlFor; goes on the button. */
  id?: string;
  /** Submits the date with a form, through a hidden input. */
  name?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  className?: string;
}

/**
 * Picks a day. Typing a date is often faster: for dates people know by heart,
 * an Input with type="date" may serve better. Label the button with a Label
 * (htmlFor its id) or aria-label.
 */
export function DatePicker({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  placeholder = "Pick a date",
  clearable = false,
  locale = "en-US",
  id,
  name,
  disabled,
  className,
  ...aria
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [own, setOwn] = useState(defaultValue);
  const chosen = value === undefined ? own : value;
  const date = fromIsoDate(chosen);
  const before = fromIsoDate(min);
  const after = fromIsoDate(max);
  const label = date
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date)
    : placeholder;

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
          id={id}
          disabled={disabled}
          data-slot="date-picker-trigger"
          data-placeholder={date ? undefined : ""}
          className={cn(
            "focus-ring flex h-control-md w-full min-w-0 cursor-pointer items-center gap-sm rounded-input border border-strong bg-surface px-control-md",
            "text-body whitespace-nowrap text-default data-[placeholder]:text-subtle",
            "disabled:cursor-not-allowed disabled:opacity-disabled aria-invalid:border-negative",
            className,
          )}
          {...aria}
        >
          <CalendarIcon aria-hidden className="size-icon-md shrink-0 text-subtle" />
          <span className="truncate">{label}</span>
        </button>
      </PopoverTrigger>
      {name !== undefined && <input type="hidden" name={name} value={chosen ?? ""} />}
      <PopoverContent className="w-auto">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          disabled={[...(before ? [{ before }] : []), ...(after ? [{ after }] : [])]}
          onSelect={(day) => {
            choose(day ? toIsoDate(day) : null);
          }}
          autoFocus
        />
        {clearable && date && (
          <div className="flex justify-end border-t border-default pt-xs">
            <button
              type="button"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
              onClick={() => {
                choose(null);
              }}
            >
              Clear date
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
