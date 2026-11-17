# 0002. Build tokens with Terrazzo and a DTCG resolver

- **Status:** Accepted
- **Date:** 2026-10-29
- **Scope:** Plumage

## Context

`@plumage/tokens` must turn W3C DTCG JSON into four outputs: CSS custom properties
scoped by `[data-brand]`, `[data-theme]`, and `[data-density]`; a Tailwind v4 `@theme`;
typed TypeScript exports; and files Figma can import as variables in four collections
(Primitives, Brand, Mode, Density).

The hard part is the theming matrix. Brand, mode, and density are independent, so the
build has to know, for every token, which dimension it varies by, and emit it under the
right selector while keeping aliases as `var()` references so nested scopes re-resolve.

The DTCG format reached its first stable version (2025.10), which includes color objects
(`colorSpace`, `components`, `hex`) and a Resolver module: a standard JSON document that
describes sets (always applied) and modifiers with named contexts (applied on demand).
Brand, mode, and density are exactly three modifiers.

## Options considered

1. **Style Dictionary 5.** The most widely used tool, with a large ecosystem and fully
   custom formats. Multi-dimensional theming is done by convention: one build per layer,
   with source globs and filters per file. Nothing in the token files themselves says how
   the layers combine; that knowledge lives in build scripts.
2. **Terrazzo 2 (`@terrazzo/cli`, `plugin-css`).** DTCG-native, written by DTCG spec
   contributors. Reads a DTCG Resolver document directly; `plugin-css` maps each
   resolver permutation to a CSS selector, and supports partial application so a rule
   can contain only one layer's tokens. Smaller ecosystem, faster-moving API.
3. **Hand-rolled script.** Full control, but we would be re-implementing alias
   resolution, type validation, and DTCG parsing.

## Decision

Use Terrazzo, driven by `src/plumage.resolver.json`.

Before deciding we ran a spike (a three-modifier resolver with a component set that
aliases across layers). Terrazzo produced orthogonal per-layer rules with aliases kept as
`var()` references on the first try, which is the property the CSS scoping depends on
(see [0003](0003-token-architecture-and-theming.md)). The spike also surfaced the one
constraint we design around: partial application needs every alias target present, so
the mode rule is resolved with the brand modifier loaded.

`plugin-css` writes `dist/plumage.css`. A small project plugin (`build/plugin.ts`) writes
the Tailwind theme, the TypeScript module, the Figma collections, and a manifest for the
docs site, all derived from the same resolver, so there is no hand-maintained list of
tokens anywhere in the build.

## Consequences

- **Good:** the theming matrix is data, in a standard format, not build-script
  convention. The resolver document maps one to one onto Figma collections (modifier) and
  modes (context), which is the Figma sync story.
- **Good:** DTCG 2025.10 color objects and type validation come for free; the build
  failed loudly on our first run when a token was declared in two layers.
- **Bad:** Terrazzo is younger than Style Dictionary and has fewer community plugins. We
  pin minor versions and keep our own outputs in one plugin file so a migration would
  touch one place.
- **Bad:** three quirks found and worked around: (a) gamut-mapped colors stored as rounded
  OKLCH land a hair outside sRGB and trigger `@media (color-gamut)` blocks, so primitives
  store exact sRGB components with OKLCH kept in `$extensions`; (b) when a token aliases
  another token in the same file, the CSS comment shows the target's description, so
  semantic tokens alias the brand palette directly; (c) transforms are cached per resolver
  input, so a per-permutation override (we tried `0ms` durations for reduced motion) leaks
  into any other rule with the same input. The reduced-motion block is appended after the
  build instead, and a regression test pins it.
- **Follow-ups:** report quirks (b) and (c) upstream; revisit if Style Dictionary ships first-class
  resolver support.

## References

- DTCG format 2025.10: https://www.designtokens.org/tr/2025.10/format/
- DTCG resolver module: https://www.designtokens.org/tr/2025.10/resolver/
- Terrazzo: https://terrazzo.app
- Style Dictionary: https://styledictionary.com
