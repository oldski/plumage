# 0003. Token tiers, the brand palette seam, and CSS scoping

- **Status:** Accepted
- **Date:** 2026-10-29
- **Scope:** Plumage

## Context

Plumage has three token tiers (primitive, semantic, component), two brands, two modes,
and two densities. Components may reference only semantic or component tokens. A new
brand should be a single file. Light and dark should be designed, not inverted. Any
element should be able to switch brand, mode, or density for its subtree.

## Decision

### Tiers and layers

| Tier      | Where it lives                              | Named by             | Example                                                 |
| --------- | ------------------------------------------- | -------------------- | ------------------------------------------------------- |
| Primitive | `src/primitives/`                           | value                | `color.gold.300`, `space.400`, `font.family.inter`      |
| Semantic  | `src/brands/`, `src/modes/`, `src/density/` | role                 | `color.bg.surface`, `radius.control`, `size.control.md` |
| Component | `src/components/`                           | component + property | `button.radius`, `table.row.height`                     |

Each semantic token is declared in exactly one layer: the dimension it varies by.
Colors and shadows live in the Mode layer; spacing, sizes, and type sizes in the Density
layer; radius, typefaces, weights, motion, and focus ring in the Brand layer. The build
fails if a token is declared in two layers, or if contexts of one modifier (finch and
vibecheck, say) do not declare the same tokens.

### The brand palette seam

A brand file also declares `brand.color.*`: which primitive ramp fills each color role
(neutral, accent, positive, negative, warning, info), plus the brand's signature solid fill
and the text color on it. The Mode layer reads only from `brand.color.*`, never from hue
primitives, so **one light mapping and one dark mapping serve every brand.** This works
because all ramps are luminance-matched (see
[0004](0004-luminance-matched-color-ramps.md)): step 600 of any hue has the same contrast
on white, so `color.accent.text: {brand.color.accent.600}` is safe whether the accent is
gold or violet. The only per-brand color decision is the solid fill, because that depends
on the hue's natural lightness: finch's gold is light and takes dark text; VibeCheck's
violet is dark and takes white text.

`brand.*` is not a tier. It is internal: it is not in the Tailwind theme or the public
TypeScript names. Chart hues are the one Mode-layer exception that point at primitives,
because the categorical palette is validated once for all brands.

### CSS scoping

Every CSS variable is prefixed `--pl-`. Aliases stay `var()` references, so a value
resolves on the element where it is declared. The CSS is one rule per layer and context:

```css
:root { /* primitives */ }
[data-brand="finch"] { /* brand palette + brand semantics */ }
:root, [data-brand]:not([data-theme]), [data-theme="light"] { color-scheme: light; ... }
[data-theme="dark"] { color-scheme: dark; ... }
:root, [data-brand]:not([data-density]), [data-density="comfortable"] { ... }
[data-density="compact"] { ... }
:root, [data-brand], [data-theme], [data-density] { /* component tokens */ }
@media (prefers-reduced-motion: reduce) { [data-brand] { /* durations: 0ms */ } }
```

Rules:

1. **A scope is any element with `data-brand`.** Within a scope an omitted
   `data-theme` or `data-density` falls back to light and comfortable.
2. **Nesting works per attribute.** `<section data-theme="dark">` inside a finch scope
   re-declares the mode layer, which re-resolves against the inherited finch palette.
3. **Component tokens are re-declared on every scope root.** A custom property inherits
   its computed value, so `--pl-button-radius: var(--pl-radius-control)` declared only on
   `:root` would carry `:root`'s radius into a nested VibeCheck scope.
4. **There is no default brand in CSS.** Plumage is brand-agnostic; without
   `data-brand`, color tokens are invalid and render as their initial values, which makes
   a missing provider obvious. (The resolver's `default: "finch"` only tells tooling which
   context to use when none is specified.)
5. `PlumageProvider` (step 3) always sets all three attributes together.

### Tailwind

The generated theme maps semantic and component tokens to Tailwind v4 namespaces with
`@theme inline`, so utilities point at runtime variables. It uses property-specific
namespaces so one role name is correct per property: `text-positive` is the text-safe
green, `bg-positive` is the solid fill, `border-positive` is the outline. Tailwind's
default palette, type scale, radii, shadows, easings, and spacing scale are reset, so
`bg-zinc-900`, `text-sm`, and `p-4` compile to nothing inside Plumage.

## Options considered

- **Per-brand light and dark files (brand x mode).** Simplest mental model, but every
  brand repeats the whole semantic mapping, and nothing stops two brands from drifting
  apart in how they use their ramps. Rejected in favor of the palette seam.
- **Compound selectors (`[data-brand="finch"][data-theme="dark"]`).** Fully resolved
  values per combination, but nesting one attribute without the others breaks, and the
  CSS grows with brands x modes x densities. Rejected.
- **A neutral default brand on `:root`.** Convenient, but it would make one brand the
  implicit Plumage look. Rejected; the provider is required.

## Consequences

- **Good:** a new brand is one file with one contract, checked by the build. The light
  and dark mappings are designed once, then verified for every brand.
- **Good:** utilities cannot reference raw values or primitives, so the tier rule is
  enforced by the toolchain rather than by review.
- **Bad:** components need a token for every size they use; there is no numeric spacing
  escape hatch. We accept that friction and will add component tokens as primitives are
  ported in step 3. If it proves too costly, a new ADR can restore a density-aware numeric
  scale.
- **Bad:** a nested `data-brand` without `data-theme` renders light, even inside a dark
  scope. Documented; the provider avoids it.

## References

- `packages/tokens/src/plumage.resolver.json`
- `packages/tokens/terrazzo.config.ts`
- `packages/tokens/build/naming.ts` (Tailwind mapping)
