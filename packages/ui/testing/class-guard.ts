// The token-only class guard, shared by Plumage's own tests and by apps built
// on it (Finch runs it over its app and components).
//
// Tailwind's own scanner extracts every class candidate from the sources; each
// one is compiled against the Plumage theme (Tailwind's default palette and
// scales are switched off there). A candidate that names a real utility but
// compiles to nothing is either a typo or a raw Tailwind value such as text-sm
// or p-4. Arbitrary values must reference variables, never literal lengths,
// durations, or colors. Needs @tailwindcss/node and @tailwindcss/oxide.
import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { __unstable__loadDesignSystem } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";

const LITERAL =
  /\d*\.?\d+(px|rem|em|ms|s|vh|vw|deg)\b|#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|oklch|oklab)\(/i;

/** .ts and .tsx files under dir, skipping tests and stories. */
export function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    const isSource = extname(entry.name) === ".tsx" || extname(entry.name) === ".ts";
    return isSource && !/\.(test|stories)\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

/** Comments describe classes ("the text-safe accent") without using them. */
const stripComments = (code: string) =>
  code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

export interface ClassReport {
  /** Candidates per file, relative to base. */
  candidates: Map<string, string[]>;
  /** "file: class" for utilities that compile to nothing: typos or raw Tailwind scales. */
  unknown: string[];
  /** "file: class" for arbitrary values holding literal lengths, durations, or colors. */
  literals: string[];
}

/**
 * Scans files and checks every utility class against a stylesheet that
 * imports Tailwind and the Plumage theme. css is resolved from base.
 */
export async function checkClasses({
  base,
  css,
  files,
}: {
  base: string;
  css: string;
  files: readonly string[];
}): Promise<ClassReport> {
  const design = await __unstable__loadDesignSystem(css, { base });
  // Bare words ("accent", "start", "bottom") come from props and strings in
  // code; with no value they cannot carry a design value, so skip them.
  const isUtility = (candidate: string) =>
    /[-:[(]/.test(candidate) && design.parseCandidate(candidate).length > 0;

  const scanner = new Scanner({ sources: [] });
  const candidates = new Map(
    files.map((file) => [
      relative(base, file),
      scanner.scanFiles([{ content: stripComments(readFileSync(file, "utf8")), extension: "tsx" }]),
    ]),
  );

  const unknown: string[] = [];
  const literals: string[] = [];
  for (const [file, found] of candidates) {
    const utilities = found.filter(isUtility);
    design.candidatesToCss(utilities).forEach((compiled, i) => {
      if (compiled === null) unknown.push(`${file}: ${utilities[i] ?? ""}`);
    });
    for (const candidate of utilities) {
      const arbitrary = /-\[(.+)\]$|-\((.+)\)$/.exec(candidate.split(":").at(-1) ?? "");
      const value = arbitrary?.[1] ?? arbitrary?.[2];
      if (value && LITERAL.test(value)) literals.push(`${file}: ${candidate}`);
    }
  }
  return { candidates, unknown, literals };
}
