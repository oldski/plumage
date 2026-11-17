"use client";

// A text input for amounts, rates, and counts. It keeps the typed text as a
// string, so apps parse it themselves (money into integer cents, never a
// float), and adds what number fields need: a decimal keyboard, figures that
// line up, an optional prefix or suffix, and arrow-key stepping.
import { useState, type ComponentProps, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { MINUS } from "../../lib/format";

export interface NumberInputProps extends Omit<
  ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "prefix"
> {
  /** The text in the field, when controlled. */
  value?: string;
  defaultValue?: string;
  /** Called with the new text on every change, including steps. */
  onValueChange?: (text: string) => void;
  /** Shown before the figures, such as "$". Decoration: say the unit in the label too. */
  prefix?: ReactNode;
  /** Shown after the figures, such as "%". */
  suffix?: ReactNode;
  /** Arrow Up and Down add or subtract this; Shift steps ten times as far. Omit to turn stepping off. */
  step?: number;
  min?: number;
  max?: number;
}

/** Decimal places in a step: 0.01 has 2. */
const places = (n: number) => (String(n).split(".")[1] ?? "").length;

/**
 * Adds `by` to the number in `text` without float drift, clamped to min and
 * max, keeping at least the step's decimal places. Returns null when the text
 * is not a plain number.
 */
export function stepNumberText(
  text: string,
  by: number,
  { min, max }: { min?: number; max?: number } = {},
): string | null {
  const cleaned = text.trim().replaceAll(",", "").replace(MINUS, "-");
  const current = cleaned === "" ? 0 : Number(cleaned);
  if (!/^-?\d*\.?\d*$/.test(cleaned) || Number.isNaN(current)) return null;
  const digits = Math.max(places(by), (cleaned.split(".")[1] ?? "").length);
  const scale = 10 ** digits;
  let next = (Math.round(current * scale) + Math.round(by * scale)) / scale;
  if (min !== undefined) next = Math.max(min, next);
  if (max !== undefined) next = Math.min(max, next);
  return next.toFixed(digits);
}

/**
 * A number field. Pair it with a Label; mark invalid values with aria-invalid
 * and point aria-describedby at the message, as with Input.
 */
export function NumberInput({
  className,
  value,
  defaultValue = "",
  onValueChange,
  onChange,
  onKeyDown,
  prefix,
  suffix,
  step,
  min,
  max,
  disabled,
  ...props
}: NumberInputProps) {
  const [own, setOwn] = useState(defaultValue);
  const text = value ?? own;
  const set = (next: string) => {
    if (value === undefined) setOwn(next);
    onValueChange?.(next);
  };

  function stepBy(event: KeyboardEvent<HTMLInputElement>) {
    if (step === undefined || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
    const size = event.shiftKey ? step * 10 : step;
    const next = stepNumberText(text, event.key === "ArrowUp" ? size : -size, { min, max });
    if (next === null) return;
    event.preventDefault();
    set(next);
  }

  return (
    <div
      data-slot="number-input"
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "focus-ring-within flex h-control-md w-full min-w-0 items-center gap-2xs rounded-input border border-strong bg-surface px-control-md",
        "has-[input[aria-invalid=true]]:border-negative",
        "data-[disabled]:cursor-not-allowed data-[disabled]:bg-disabled",
        className,
      )}
    >
      {prefix !== undefined && (
        <span aria-hidden className="text-body text-subtle">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        data-slot="number-input-field"
        value={text}
        disabled={disabled}
        onChange={(event) => {
          onChange?.(event);
          set(event.target.value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) stepBy(event);
        }}
        className={cn(
          "h-full w-full min-w-0 bg-transparent text-right font-numeric text-body text-default tabular-nums outline-none",
          "placeholder:text-subtle disabled:cursor-not-allowed disabled:text-disabled",
        )}
        {...props}
      />
      {suffix !== undefined && (
        <span aria-hidden className="text-body text-subtle">
          {suffix}
        </span>
      )}
    </div>
  );
}
