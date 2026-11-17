# 0027. Plumage number entry, pickers, money, and figures that line up

- **Status:** Accepted
- **Date:** 2026-10-30
- **Scope:** Plumage

## Context

Steps 2 and 4 still listed two token items (tabular numbers with a `tnum` check and a
monospace fallback, and a true minus sign) and the components NumberInput, Combobox,
DatePicker, Money, ProgressRing, and Timeline. ProgressRing and Timeline arrived with step
13 (recorded in an app-level decision record). This finishes the rest.

## Decision

**Tabular figures.** Each font primitive declares whether it has tabular figures in
`$extensions["dev.plumage"].tabularFigures`, and a tokens test requires every brand's
`font.family.numeric` to point at one that does. The monospace fallback is
`font.family.jetbrains-mono`, which always has them: a brand whose chosen font lacks
tabular figures points its numeric role there. Inter, Switzer, Satoshi, and JetBrains Mono are marked
as having them; Cabinet Grotesk, General Sans, and the system stack are not, since none is
relied on for figures. The Fontshare declarations are not yet checked against the font
files, which Plumage never bundles (a follow-up). Components that show figures set `font-numeric tabular-nums`.

**A true minus sign.** `formatNumber` writes negatives with U+2212 (exported as `MINUS`)
instead of a hyphen. It is as wide as the plus sign and the digits, so signed figures line
up, and screen readers read it as "minus". Both apps format through `formatNumber`, so the
change reaches every amount at once.

**New pieces**, each with stories (usage, do and don't, accessibility, a play test that
also runs axe) and unit tests:

- `Popover`, the surface the pickers open in, styled like menus.
- `NumberInput`: a text field with a decimal keyboard, right-aligned tabular figures, an
  optional prefix or suffix, and arrow-key stepping (Shift for ten steps). It keeps the
  typed text as a string, so apps parse money into integer cents themselves; stepping is
  done in scaled integers (`stepNumberText`), so 0.1 plus 0.2 is 0.3.
- `Combobox`: a searchable Select, built like shadcn/ui's from Popover and cmdk, with
  keywords, descriptions, clearing, and a hidden input for forms.
- `DatePicker` and `Calendar`, built like shadcn/ui's from Popover and react-day-picker.
  Values are `"2026-10-30"` strings in and out, never Date objects, so a time zone cannot
  move a day; a day that does not exist (February 30) is not a date.
- `Money`, a pattern: a `data` element holding the number, formatted as currency with the
  true minus sign and tabular figures. It takes dollars for display; stored money stays in
  integer cents.

## Consequences

- **Good:** amounts look and align the same in both apps, and the remaining form controls
  the apps need exist in Plumage, so neither app has to build its own.
- **Bad:** two new dependencies in `@plumage/ui`, `cmdk` and `react-day-picker`, the ones
  shadcn/ui uses.
- **Bad:** any code comparing formatted text with a hyphen breaks. None does in either
  app today; the tests passed unchanged apart from Plumage's own formatting test.
- **Bad:** cmdk marks items with `data-disabled="false"`, which the shared menu item
  classes read as disabled, so Combobox items have their own classes that match the value.
- **Follow-ups:** adopt NumberInput, Combobox, DatePicker, and Money in the apps' forms and
  tables (amount fields, category pickers, goal dates); confirm the tabular-figure
  declarations against the fonts once the apps load them.

## References

- `packages/tokens/src/primitives/typography.tokens.json`, `packages/tokens/test/fonts.test.ts`
- `packages/ui/src/lib/format.ts`
- `packages/ui/src/components/popover/`, `number-input/`, `combobox/`, `date-picker/`
- `packages/ui/src/patterns/money/`
- `packages/ui/test/inputs.test.tsx`
