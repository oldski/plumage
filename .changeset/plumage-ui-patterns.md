---
"@plumage/tokens": minor
"@plumage/ui": minor
---

Add patterns to `@plumage/ui`: AppShell, ChartContainer (Recharts 3), DataTable (TanStack
Table v9), Delta, EmptyState, PageHeader, and StatCard, plus `formatNumber`,
`foldToOther`, `seriesColor`, and `useChartTokens`.

Tokens gain `size.bar`, `size.chart.*`, `border.width.strong`, and component tokens for
the app shell, empty state, and chart marks.

Fix: base styles no longer set `font-size` on `<html>` in root scope, which had shrunk
every rem-based token to the body text ratio.
