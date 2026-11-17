// Post-build: add a reader-facing header to plumage.css and run Prettier over
// the generated CSS so the output reads like hand-written code.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { format } from "prettier";
import { cssVarName } from "../build/naming.ts";
import { loadSource } from "../build/source.ts";

const dist = (file: string) => fileURLToPath(new URL(`../dist/${file}`, import.meta.url));

const HEADER = `/*
 * @plumage/tokens: CSS custom properties. Generated from src/plumage.resolver.json.
 *
 * Layers, in cascade order:
 *   :root                       Primitives. Constant values, never used by components.
 *   [data-brand="..."]          Brand palette (--pl-brand-*) and brand-level semantics.
 *   [data-theme="light|dark"]   Semantic colors, chart colors, and shadows.
 *   [data-density="..."]        Spacing, control and row sizes, type sizes.
 *   scope roots                 Component tokens, re-declared on every scope root.
 *
 * A scope is any element with data-brand. Within a scope, an omitted
 * data-theme or data-density falls back to light and comfortable. Set all
 * three together (PlumageProvider does) to switch them independently.
 */
`;

// Reduced motion: every semantic duration drops to 0ms. [data-brand] has the
// same specificity as the brand rules and comes later, so it wins when the
// media query matches.
const durations = loadSource().idsByLayer.brand.filter((id) => id.startsWith("motion.duration."));
const REDUCED_MOTION = `
@media (prefers-reduced-motion: reduce) {
  [data-brand] {
${durations.map((id) => `    ${cssVarName(id)}: 0ms;`).join("\n")}
  }
}
`;

for (const file of ["plumage.css", "tailwind.css"]) {
  const path = dist(file);
  let css = readFileSync(path, "utf8");
  if (file === "plumage.css") {
    css = css.replace(/^\/\*[\s\S]*?\*\/\s*/, HEADER + "\n") + REDUCED_MOTION;
  }
  writeFileSync(path, await format(css, { parser: "css", printWidth: 100 }));
}
console.log("Formatted dist/plumage.css and dist/tailwind.css");
