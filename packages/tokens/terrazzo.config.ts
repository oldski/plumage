// Token build. plugin-css writes dist/plumage.css: one rule per layer, so each
// dimension (brand, mode, density) can be switched independently with a data
// attribute. The plumage plugin writes everything else. See
// docs/adr/0003-token-architecture-and-theming.md for the scoping rules.
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import plumage from "./build/plugin.ts";
import { ATTRIBUTE, loadSource, type Modifier } from "./build/source.ts";
import { cssVarName } from "./build/naming.ts";

const source = loadSource();

const block = (selector: string, contents: string, extra = "") =>
  `${selector} {\n${extra}  ${contents.trim()}\n}`;

/** Selector for one context of a modifier. The default context also covers scopes that omit the attribute. */
function selectorFor(modifier: Modifier, context: string): string {
  const attr = ATTRIBUTE[modifier];
  const own = `[${attr}="${context}"]`;
  if (modifier === "brand" || context !== source.defaults[modifier]) return own;
  return `:root, [data-brand]:not([${attr}]), ${own}`;
}

// Partial resolution: each rule emits only its own layer's tokens, and needs
// the primitives (plus brand, for mode) only to validate aliases.
const needs: Record<Modifier, Modifier[]> = {
  brand: ["brand"],
  mode: ["brand", "mode"],
  density: ["density"],
};

const layerPermutations = (["brand", "mode", "density"] as const).flatMap((modifier) =>
  source.contexts[modifier].map((context) => ({
    input: { [modifier]: context },
    only: { sets: ["primitives"], modifiers: needs[modifier] },
    include: source.idsByLayer[modifier],
    prepare: (contents: string) =>
      block(
        selectorFor(modifier, context),
        contents,
        modifier === "mode" ? `  color-scheme: ${context};\n` : "",
      ),
  })),
);

export default defineConfig({
  tokens: ["./src/plumage.resolver.json"],
  outDir: "./dist/",
  plugins: [
    css({
      filename: "plumage.css",
      legacyHex: true,
      variableName: (token) => cssVarName(token.id),
      permutations: [
        {
          input: {},
          include: source.idsByLayer.primitive,
          prepare: (contents) => block(":root", contents),
        },
        ...layerPermutations,
        {
          // Component tokens alias semantic tokens, so they are re-declared on
          // every scope root; otherwise a nested scope would inherit values
          // already resolved against the outer scope.
          input: {},
          include: source.idsByLayer.component,
          prepare: (contents) =>
            block(":root, [data-brand], [data-theme], [data-density]", contents),
        },
        // The prefers-reduced-motion block is appended by scripts/format-output.ts.
        // It cannot be a permutation here: Terrazzo caches transforms per resolver
        // input, so a "0ms" transform on the finch input leaks into finch's own rule.
      ],
    }),
    plumage(),
  ],
});
