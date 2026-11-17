// Compiles real Tailwind v4 against the generated theme to prove two things:
// token utilities resolve to Plumage CSS variables, and Tailwind's default
// palette and scales are gone, so raw values cannot sneak into components.
import { fileURLToPath } from "node:url";
import { compile } from "@tailwindcss/node";
import { beforeAll, describe, expect, it } from "vitest";

const base = fileURLToPath(new URL("..", import.meta.url));
let build: (candidates: string[]) => string;

beforeAll(async () => {
  const compiler = await compile(`@import "tailwindcss";\n@import "./dist/tailwind.css";\n`, {
    base,
    onDependency: () => undefined,
  });
  build = (candidates) => compiler.build(candidates);
});

/** The declaration block Tailwind generated for one utility class, or "" if none. */
function rule(candidate: string): string {
  const css = build([candidate]);
  const escaped = candidate.replace(/[:/.[\]()]/g, (c) => `\\\\${c}`);
  const match = new RegExp(`\\.${escaped}\\s*\\{([^}]*)\\}`).exec(css);
  return match?.[1]?.trim() ?? "";
}

describe("token utilities", () => {
  it.each([
    ["bg-surface", "background-color: var(--pl-color-bg-surface)"],
    ["bg-canvas", "background-color: var(--pl-color-bg-canvas)"],
    ["text-default", "color: var(--pl-color-text-default)"],
    ["text-muted", "color: var(--pl-color-text-muted)"],
    ["border-strong", "border-color: var(--pl-color-border-strong)"],
    ["bg-accent", "background-color: var(--pl-color-accent-default)"],
    ["text-accent", "color: var(--pl-color-accent-text)"],
    ["text-on-accent", "color: var(--pl-color-text-on-accent)"],
    ["bg-positive", "background-color: var(--pl-color-feedback-positive-solid)"],
    ["text-positive", "color: var(--pl-color-feedback-positive)"],
    ["bg-negative-subtle", "background-color: var(--pl-color-feedback-negative-subtle)"],
    ["border-negative", "border-color: var(--pl-color-feedback-negative)"],
    ["border-warning-subtle", "border-color: var(--pl-color-feedback-warning-border)"],
    ["outline-focus", "outline-color: var(--pl-color-border-focus)"],
    ["fill-chart-1", "fill: var(--pl-color-chart-categorical-1)"],
    ["stroke-chart-seq-3", "stroke: var(--pl-color-chart-sequential-3)"],
    ["rounded-control", "border-radius: var(--pl-radius-control)"],
    ["rounded-button", "border-radius: var(--pl-button-radius)"],
    ["h-control-md", "height: var(--pl-size-control-md)"],
    ["size-icon-sm", "width: var(--pl-size-icon-sm)"],
    ["h-table-row", "height: var(--pl-table-row-height)"],
    ["px-control-md", "padding-inline: var(--pl-space-control-md)"],
    ["p-inset-md", "padding: var(--pl-space-inset-md)"],
    ["p-card", "padding: var(--pl-card-padding)"],
    ["py-card", "padding-block: var(--pl-card-padding)"],
    ["max-w-dialog", "max-width: var(--pl-dialog-width)"],
    ["w-sheet", "width: var(--pl-sheet-width)"],
    ["min-w-menu", "min-width: var(--pl-menu-min-width)"],
    ["max-w-tooltip", "max-width: var(--pl-tooltip-max-width)"],
    ["size-checkbox", "width: var(--pl-checkbox-size)"],
    ["w-switch-track", "width: var(--pl-switch-track-width)"],
    ["h-switch-track", "height: var(--pl-switch-track-height)"],
    ["size-switch-thumb", "height: var(--pl-switch-thumb-size)"],
    ["h-progress-track", "height: var(--pl-progress-track-height)"],
    ["size-figure-lg", "width: var(--pl-size-figure-lg)"],
    ["rounded-indicator", "border-radius: var(--pl-radius-indicator)"],
    ["gap-sm", "gap: var(--pl-space-sm)"],
    ["text-body", "font-size: var(--pl-font-size-body)"],
    ["font-sans", "font-family: var(--pl-font-family-body)"],
    ["font-numeric", "font-family: var(--pl-font-family-numeric)"],
    ["font-heading", "font-weight: var(--pl-font-weight-heading)"],
    ["shadow-overlay", "var(--pl-shadow-overlay)"],
    ["ease-enter", "var(--pl-motion-easing-enter)"],
    ["opacity-disabled", "opacity: var(--pl-opacity-disabled)"],
  ])("%s uses the token", (candidate, expected) => {
    expect(rule(candidate)).toContain(expected);
  });

  it.each([
    ["p-0", "padding: var(--spacing-0)"],
    ["inset-0", "inset: var(--spacing-0)"],
    ["min-w-0", "min-width: var(--spacing-0)"],
  ])("%s still works (zero is not a design value)", (candidate, expected) => {
    expect(rule(candidate)).toContain(expected);
  });

  it("text-body carries the density-aware line height", () => {
    expect(rule("text-body")).toContain(
      "line-height: var(--tw-leading, var(--pl-font-line-height-body))",
    );
  });

  it("dark: follows data-theme, not prefers-color-scheme", () => {
    const css = build(["dark:bg-raised"]);
    expect(css).toContain('[data-theme="dark"]');
    expect(css).not.toContain("prefers-color-scheme");
  });
});

describe("Tailwind defaults are switched off", () => {
  it.each([
    "bg-red-500",
    "text-zinc-900",
    "border-gray-200",
    "text-sm",
    "rounded-lg",
    "shadow-md",
    "p-4",
    "gap-2",
    "h-9",
    "font-bold",
    "ease-in-out",
  ])("%s generates nothing", (candidate) => {
    expect(rule(candidate)).toBe("");
  });
});
