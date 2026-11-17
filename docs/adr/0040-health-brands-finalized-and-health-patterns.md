# 0040. The health brands finalized: display faces, display tokens, a chart highlight, and four patterns

- **Status:** Accepted
- **Date:** 2026-10-30
- **Scope:** Plumage
- **Finalizes:** [ADR 0039](0039-hummingbird-and-chickadee-brands.md)

## Context

ADR 0039 added the hummingbird and chickadee brands with Switzer standing in for display
and left two questions for step 13: the display faces, and what Hummingbird's ruby is for.
The brief has since named the faces (Clash Grotesk for Hummingbird, Gambetta, a serif, for
Chickadee) and asked for per-brand display tokens for tracking, line height, and weight,
since a serif and a grotesk need different spacing. It also warned that Gambetta may
default to oldstyle figures, which make a large number look uneven, and asked for a token
or flag to handle it. Step 13 also adds the components the health apps need: Measure,
MacroBar, CalendarHeatmap, and Slider.

## Checking the fonts

Plumage never bundles Fontshare files, but checking them is allowed. Fontshare's webfont
files were downloaded to a scratch folder and read with fontTools on 2026-10-30:

| Face            | `tnum` | Default figures                                               |
| --------------- | ------ | ------------------------------------------------------------- |
| Switzer         | no     | tabular (every digit is 576 units wide), lining               |
| Satoshi         | yes    | proportional, lining                                          |
| Cabinet Grotesk | no     | proportional, lining                                          |
| Clash Grotesk   | no     | proportional, lining                                          |
| Gambetta        | no     | proportional, lining (digits 650 to 660 high, cap height 680) |

So the existing `tabularFigures` declarations were right (Switzer's figures are tabular
without the feature), and Gambetta's own figures are lining. Its fallback is not: Georgia
defaults to oldstyle figures, and Georgia is what renders until an app loads Gambetta.

## Options considered

For the display tokens:

1. **Fold weight, tracking, and line height into a typography composite.** DTCG has one,
   but a composite also fixes the size, which is a density token here.
2. **Four brand tokens under `font.display`, applied by two utilities.** Chosen.

For line height:

1. **A unitless ratio that replaces the density's line height for display text.** One
   ratio cannot reproduce Finch's and Sparrow's current heading (32/24) and display (36/30)
   leading at once, so both would shift.
2. **A multiplier on the density's line height.** 1 keeps every current value exactly.
   Chosen.

For oldstyle figures:

1. **Render display numbers in the numeric font for brands whose face has oldstyle
   figures.** Gives up the display face for the numbers that most show it off.
2. **A `font.display.figures` token, `font-variant-numeric`, set to lining for every
   brand.** No effect on faces that are already lining; it corrects a fallback that is
   not. Chosen.

For ruby (asked at the start of step 13): a chart highlight. One brand-level color for an
emphasized mark, rather than a full secondary-accent role with UI variants.

## Decision

**Tokens**

- Font primitives `clash-grotesk` and `gambetta`. Gambetta's stack falls back to Iowan Old
  Style, Georgia, and the system serif rather than to Inter, since a sans fallback would
  lose the brand's character.
- Per brand, under `font.display`: `weight` (a fontWeight), `tracking` (a number in em),
  `line-height` (a multiplier), and `figures` (a string, `lining-nums proportional-nums`).
  They are CSS variables only: `font-display` is already Tailwind's family utility.

  | Brand       | Face            | Weight | Tracking | Line height |
  | ----------- | --------------- | ------ | -------- | ----------- |
  | finch       | Cabinet Grotesk | 600    | 0        | 1           |
  | sparrow     | Satoshi         | 500    | 0        | 1           |
  | hummingbird | Clash Grotesk   | 600    | −0.01em  | 1           |
  | chickadee   | Gambetta        | 500    | 0        | 1.05        |

  Finch and Sparrow keep the weights their titles already had.

- A `brand.color.highlight` ramp in every brand (ruby for hummingbird; violet for finch,
  teal for sparrow, pink for chickadee, each away from the brand's accent), exposed as
  `color.chart.highlight` (step 500 in light, 400 in dark), and checked at 3:1 against
  the surface.
- Component tokens: `slider.track.height`, `slider.thumb.size`, `macro-bar.height`,
  `heatmap.cell.size`, `heatmap.cell.radius`, all following density.

**UI**

- `display-heading` and `display-figure` utilities in `@plumage/ui` set the display face
  with all four tokens, at the heading and display sizes. PageHeader and StatCard use
  them.
- **Measure**: a value and its unit (`kg`, `lb`, `g`, `oz`, `kcal`, `bpm`, `ms`, and
  `duration` in minutes shown as hours and minutes), with `formatMeasure` and an exact
  `convertMass`. The abbreviation is shown; the unit is read in words.
- **MacroBar**: a stacked part-to-whole bar on the categorical palette, with shares as
  whole percentages that add up to 100 (`wholePercents`, largest remainder) and a legend
  that carries every number.
- **CalendarHeatmap**: days as an ARIA grid with one Tab stop and arrow keys by day and
  week, shades from the sequential scale, `today` outlined in the chart highlight, and
  every day named with its date and value. Dates are handled at UTC midnight, so no
  daylight saving change moves a day.
- **Slider**: Radix Slider with density-sized track and thumb, a range with
  `thumbLabels`, and the slider's own name passed to its thumb. The unfilled track uses
  the strong border color; the sunken background disappeared in dark mode.

## Consequences

- **Good:** Finch and Sparrow resolve to the same values as before, only gaining the new
  tokens, and none of their 760 visual baselines changed, including StatCard and
  PageHeader on the new utilities.
- **Good:** 714 token checks pass; the visual suite now covers 106 stories, 1,696
  screenshots, with 176 new baselines and 44 updated (hummingbird and chickadee display
  text).
- **Bad:** the screenshots show the fallbacks (Inter, and Georgia for Chickadee's display),
  not the Fontshare faces, since Plumage does not bundle them. The apps will show the real
  faces once they self-host them.
- **Follow-ups:** look at the brands on real Hummingbird and Chickadee screens (steps 15 to
  18); self-host Clash Grotesk and Gambetta in those apps; CalendarHeatmap uses the shared
  blue sequential scale, which could become brand-tinted if the screens call for it.

## References

- `packages/tokens/src/brands/*.tokens.json`, `src/primitives/typography.tokens.json`
- `packages/ui/src/styles.css`, `src/lib/measure.ts`, `src/lib/calendar.ts`,
  `src/lib/chart.ts`, and the four new component folders
- ADR 0027 (tabular figures), ADR 0039 (the brands)
