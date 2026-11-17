# 0008. Patterns: DataTable on TanStack Table v9, charts on Recharts 3

- **Status:** Accepted
- **Date:** 2026-10-29
- **Scope:** Plumage

## Context

Step 4 adds composed, product-agnostic patterns: StatCard, Delta, DataTable,
ChartContainer, EmptyState, PageHeader, and AppShell. Two of them sit on third-party
engines (a table model and a chart renderer), and the charts have to honor the data-viz
rules already encoded in the tokens ([ADR 0004](0004-luminance-matched-color-ramps.md)):
eight validated categorical colors, never cycled, text never in the series color.

## Decision

**Patterns are built only from primitives and tokens.** The class guard from
[ADR 0005](0005-component-architecture.md) scans them too. Values that must reach
JavaScript (Recharts props) come from the token build's `values` export, never literals.

**DataTable uses TanStack Table v9**, the current major. It registers only what it uses
(`rowSortingFeature`, column and global filtering, and their row models) through
`tableFeatures()`, and adds one typed column option by declaration merging:
`meta: { numeric: true }` right-aligns a column and gives it tabular figures. Behavior:

- Sortable headers are buttons inside `<th aria-sort>`. Number columns sort largest first
  (TanStack's default, and the right one for money), text columns A to Z, then each flips.
  Sorting never returns to "unsorted".
- A polite status line in the caption reports the count after a search ("1 of 8
  positions") and, for screen readers, the current sort.
- A search that matches nothing renders an EmptyState inside the table body.
- No pagination: a personal portfolio is tens of rows, and search plus sort is faster.

**ChartContainer wraps Recharts 3** in a `<figure>` and owns everything around the plot:

- A visible title and a written summary (the takeaway) name and describe the figure.
- A Table button swaps in an equivalent data table, so tooltips never gate a value.
- A legend appears automatically for two or more series (line or rect swatches to match
  the mark); a single series is named by its title.
- Series colors come from `config` order: categorical slots 1 to 8, or `positive`,
  `negative`, `neutral` when a series means gain, loss, or "Other". A ninth categorical
  series throws, pointing at `foldToOther()` or small multiples.
- Furniture is styled through Recharts' class names with token utilities: hairline grid,
  subtle axis text, surface rings on dots, surface gaps between slices.
- `useChartTokens()` resolves mark sizes for the active brand and density (2px lines,
  `radius.indicator` bar ends, `size.icon.lg` maximum bar thickness) and an entrance
  animation that uses the brand's slow duration and turns off under reduced motion.
- Recharts 3 deprecates `Cell`; per-slice colors go on the data rows as `fill`.

**Delta** carries direction three ways (arrow, sign, color) and speaks words to screen
readers ("Down 0.80% today"). `invert` flips color for metrics where down is good;
`threshold` keeps tiny moves from flickering red and green.

**StatCard** is a description list (label, value, change) with proportional figures,
per the data-viz guidance that tabular figures belong in columns.

**AppShell** takes props (`brand`, `nav`, `header`, children) rather than compound
children, so the landmark structure (skip link, `nav`, `header`, focusable `main`) cannot
be assembled wrongly. Below `md` the sidebar moves into a Sheet.

## A bug this step uncovered

Measuring the AppShell in a browser showed a 195px sidebar where the token says 240px.
The base stylesheet set `font-size` on every `[data-brand]` element, including `<html>` in
root scope. That redefined `1rem` as 13px (Finch compact body text), so every rem-based
token rendered at 13/16 of its size since step 3. Body text size now goes on `<body>` for
the root scope and on the scope element otherwise, and a test compiles the stylesheet and
fails if any rule can set `font-size` on `<html>`.

## Consequences

- **Good:** the palette rules (fixed order, no cycling, fold to Other, neutral Other,
  legend for two or more series, table view) are enforced by the component, not left to
  each chart author.
- **Good:** charts and tables restyle with brand, mode, and density like everything else.
- **Bad:** chart styling depends on Recharts' CSS class names. A Recharts major could
  rename them; the story screenshots and play functions are the early warning.
- **Bad:** TanStack Table v9 is young; its declaration-merging signature must track the
  library's type parameters exactly.
- **Follow-up:** add a sparkline to StatCard, and a "top movers" bar pattern with delta
  colors, when Finch needs them.
