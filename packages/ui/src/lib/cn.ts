import { tailwindMergeConfig } from "@plumage/tokens";
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge only resolves conflicts between classes it recognizes. The
// token build exports Plumage's utility names, so cn() knows that text-muted
// (a color) and text-body (a font size) can coexist, while h-control-sm and
// h-control-md cannot.
const twMerge = extendTailwindMerge({
  extend: tailwindMergeConfig,
});

/** Join class names, letting later Plumage utilities override earlier ones. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
