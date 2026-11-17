"use client";

// A keyboard-first entry line: type a whole entry ("42.18 groceries publix"),
// complete words from suggestions, Enter to save, and the field is ready for
// the next one. The app parses the text and supplies suggestions; this pattern
// owns the combobox behavior (ARIA 1.2 combobox with a listbox popup).
import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { menuContentClasses, menuItemClasses } from "../../components/dropdown-menu/dropdown-menu";
import { Input } from "../../components/input/input";
import { Label } from "../../components/label/label";
import { cn } from "../../lib/cn";

export interface QuickAddSuggestion {
  id: string;
  label: string;
  /** Shown after the label, quieter: "category", "last used Oct 3". */
  detail?: string;
}

export interface QuickAddBarProps {
  /** Visible label for the field. */
  label: string;
  /** Hide the label visually; it is still announced. */
  hideLabel?: boolean;
  value: string;
  onValueChange: (value: string) => void;
  /** Completions for the word being typed, best first. Empty hides the list. */
  suggestions: readonly QuickAddSuggestion[];
  /** A suggestion was chosen (Enter, Tab, or click); the app completes the word. */
  onSuggestionPick: (suggestion: QuickAddSuggestion) => void;
  /** Enter with no suggestion highlighted. */
  onSubmit: () => void;
  /** How the app reads the current text, under the field. */
  preview?: ReactNode;
  /** The result of the last save, announced politely. */
  status?: ReactNode;
  placeholder?: string;
  busy?: boolean;
  /**
   * For a fixed-height spot such as an app header: the preview and status
   * float in a panel under the field, with the suggestions, while it has focus.
   */
  compact?: boolean;
  className?: string;
}

/**
 * Arrow keys move through suggestions, Enter or Tab takes the highlighted one,
 * Enter with none highlighted saves, Escape closes the list (and clears the
 * field when the list is already closed).
 */
export function QuickAddBar({
  label,
  hideLabel = false,
  value,
  onValueChange,
  suggestions,
  onSuggestionPick,
  onSubmit,
  preview,
  status,
  placeholder,
  busy = false,
  compact = false,
  className,
}: QuickAddBarProps) {
  const id = useId();
  const listId = `${id}-list`;
  const [active, setActive] = useState(-1);
  const [dismissed, setDismissed] = useState(false);
  const [focused, setFocused] = useState(false);
  const open = !dismissed && suggestions.length > 0;
  const current = open && active >= 0 ? suggestions[active] : undefined;

  const pick = (suggestion: QuickAddSuggestion) => {
    onSuggestionPick(suggestion);
    setActive(-1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        if (suggestions.length === 0) return;
        event.preventDefault();
        setDismissed(false);
        const last = suggestions.length - 1;
        setActive((index) =>
          event.key === "ArrowDown"
            ? index >= last
              ? 0
              : index + 1
            : index <= 0
              ? last
              : index - 1,
        );
        return;
      }
      case "Enter":
        event.preventDefault();
        if (current) pick(current);
        else if (!busy) onSubmit();
        return;
      case "Tab":
        if (current) {
          event.preventDefault();
          pick(current);
        }
        return;
      case "Escape":
        if (open) setDismissed(true);
        else onValueChange("");
        setActive(-1);
        return;
    }
  };

  const list = (
    <ul
      id={listId}
      role="listbox"
      aria-label={`${label} suggestions`}
      hidden={!open}
      className={cn(menuContentClasses, !compact && "absolute top-full left-0 mt-2xs w-full")}
    >
      {suggestions.map((suggestion, index) => (
        <li
          key={suggestion.id}
          id={`${listId}-${suggestion.id}`}
          role="option"
          aria-selected={index === active}
          data-highlighted={index === active ? "" : undefined}
          className={cn(menuItemClasses)}
          onMouseDown={(event) => {
            // Keep focus in the field.
            event.preventDefault();
            pick(suggestion);
          }}
          onMouseEnter={() => {
            setActive(index);
          }}
        >
          <span className="truncate">{suggestion.label}</span>
          {suggestion.detail && (
            <span className="ml-auto text-caption text-subtle">{suggestion.detail}</span>
          )}
        </li>
      ))}
    </ul>
  );
  const notes = (
    <>
      {preview && (
        <p id={`${id}-preview`} className="text-caption text-muted">
          {preview}
        </p>
      )}
      <p role="status" className="text-caption text-subtle empty:hidden">
        {status}
      </p>
    </>
  );

  return (
    <div className={cn("relative flex flex-col gap-2xs", className)}>
      <Label htmlFor={id} className={hideLabel ? "sr-only" : undefined}>
        {label}
      </Label>
      <Input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={current ? `${listId}-${current.id}` : undefined}
        aria-describedby={preview ? `${id}-preview` : undefined}
        aria-busy={busy || undefined}
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value);
          setDismissed(false);
          setActive(-1);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          setFocused(false);
          setDismissed(true);
        }}
      />
      {compact ? (
        <div className="absolute top-full left-0 z-50 mt-2xs flex w-full flex-col gap-2xs">
          {list}
          <div
            hidden={!focused || (!value && !status)}
            className="flex flex-col gap-2xs rounded-menu border border-default bg-raised px-sm py-xs shadow-overlay"
          >
            {notes}
          </div>
        </div>
      ) : (
        <>
          {list}
          {notes}
        </>
      )}
    </div>
  );
}
