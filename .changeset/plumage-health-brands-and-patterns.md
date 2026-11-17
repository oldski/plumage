---
"@plumage/tokens": minor
"@plumage/ui": minor
---

Finish the hummingbird and chickadee brands, and add four components for the health apps.

- Tokens: display faces Clash Grotesk (hummingbird) and Gambetta (chickadee, a serif with
  serif fallbacks); per-brand `font.display.weight`, `tracking`, `line-height` (a multiplier
  on the density's), and `figures` (always lining); `color.chart.highlight` from a new
  `brand.color.highlight` slot (ruby for hummingbird, violet for finch, teal for sparrow,
  pink for chickadee); component tokens for the slider, macro bar, and heatmap. Finch and
  Sparrow resolve to the same values as before.
- UI: `display-heading` and `display-figure` utilities, used by PageHeader and StatCard;
  `Slider`; `Measure` with `formatMeasure` and `convertMass`; `MacroBar` with
  `wholePercents`; `CalendarHeatmap`.
