# 0020. Sparrow replaces VibeCheck, and fonts become body, display, and numeric roles

- **Status:** Accepted
- **Date:** 2026-10-29
- **Scope:** Plumage

## Context

Plumage shipped two brands: Finch and VibeCheck, a violet placeholder whose only job was
to prove the system is multi-brand ([ADR 0003](0003-token-architecture-and-theming.md)).
The spec replaces it with **Sparrow**, the budget app's brand: warm, earthy russet and
brown, calm, comfortable density. It also asks for font roles `font.family.body`,
`display`, and `numeric`:

| Brand   | Body    | Display                           | Numeric          |
| ------- | ------- | --------------------------------- | ---------------- |
| Finch   | Switzer | Cabinet Grotesk                   | Switzer, tabular |
| Sparrow | Switzer | Satoshi (alternate: General Sans) | Switzer, tabular |

All four are Fontshare families under the ITF Free Font License, which allows using them
but not redistributing the font files, so they cannot ship in this repo or its packages.
The spec marks the choices provisional.

## Decision

**Sparrow's palette** uses two new ramps, generated like the rest on the shared luminance
scale ([ADR 0004](0004-luminance-matched-color-ramps.md)):

- **russet** (hue 52 to 44, peak chroma 0.13) for the accent. Its chroma is well below red
  and orange, so it reads as brown, not as an error or a warning. The solid fill is
  russet 600 (`#a7501e`) with white text, darkening to 700 and 800 on hover and press.
- **stone** (hue 70, a warm sandy neutral) for surfaces, text, and borders. It replaces
  mauve, which only VibeCheck used.

Feedback colors: positive green, negative red, info blue, and **warning gold** rather than
orange, which would sit next to the russet accent. Every contrast pair passes in both
modes (`pnpm check`: 381 of 381).

**Sparrow's shape and feel:** medium radii (control 150, container 250, overlay 300),
calm motion (150, 200, and 300 ms, decelerating, no overshoot), lighter headings
(weight 500), and comfortable density by default.

**Font roles.** Each brand sets `font.family.body`, `display`, `numeric`, and `mono`
(code). `sans` is gone: it is now `body`. In Tailwind, the body family stays `font-sans`,
the default family, because `font-body` is already the body weight utility; the new
`font-numeric` sets the numeric family.

**Fontshare fonts are named, never bundled.** The primitives hold the stacks `switzer`,
`cabinet-grotesk`, `satoshi` (falling back to General Sans), and `general-sans`. Each
falls back to Inter, which the apps already bundle through Fontsource (SIL Open Font
License), then to the system UI font. So nothing changes on screen until an app loads a
Fontshare font, or the font is installed on the computer. Loading them (for example from
Fontshare's own service) is an app decision for later; for a local-only app it would be
an outside request on every page load, so it should be opt-in.

**VibeCheck is removed** from tokens, components, stories, tests, and docs. Accepted ADRs
that mention it stay as written; they record what was decided then.

## Consequences

- **Good:** the second brand is a real product's, so every component is now checked
  against the theme it will actually ship in.
- **Good:** adding a brand is documented end to end (Storybook, "Adding a brand").
- **Bad:** renaming `font.family.sans` and removing a brand are breaking changes for
  anyone using the tokens, so `@plumage/tokens` takes a major bump.
- **Bad:** until a Fontshare font is loaded, both brands render in Inter; the type is
  provisional in practice as well as in the spec.
- **Follow-ups:** tabular numerals with a check that the font actually has them (falling
  back to the mono family) and a true minus sign (U+2212) come with the number formatting
  work; the 2 by 2 by 2 visual regression matrix comes with step 15.

## References

- `packages/tokens/src/brands/sparrow.tokens.json`, `packages/tokens/scripts/ramps.config.ts`
- `packages/tokens/src/primitives/typography.tokens.json`, `packages/tokens/build/naming.ts`
- `apps/docs/src/adding-a-brand.mdx`
- [Fontshare](https://www.fontshare.com) and the ITF Free Font License
