# @plumage/ui

Plumage React components: shadcn/ui primitives on Radix, restyled so every class is a
Plumage token utility, plus product-agnostic patterns composed from them.

## Use it

```css
/* app.css */
@import "tailwindcss";
@import "@plumage/tokens/css";
@import "@plumage/tokens/tailwind.css";
@import "@plumage/ui/styles.css";
```

```tsx
import { Button, PlumageProvider, Toaster } from "@plumage/ui";

export function App() {
  return (
    <PlumageProvider brand="finch" mode="system">
      <Button>Analyze portfolio</Button>
      <Toaster />
    </PlumageProvider>
  );
}
```

`PlumageProvider` sets `data-brand`, `data-theme`, and `data-density` on `<html>` (root
scope) or on its own `<div>` (`scope="local"`, which also receives portaled overlays).
Density defaults to the brand's own: Finch compact; Sparrow, Hummingbird, and Chickadee comfortable.

## Components

**Primitives:** Alert, Badge, Button, Card, Checkbox, Combobox, DatePicker (and `Calendar`),
Dialog, DropdownMenu, Input, Label, NumberInput, Popover, Progress, ProgressRing, Select,
Separator, Sheet, Skeleton, Slider, Switch, Table, Tabs, Textarea, Toast (`Toaster` and
`toast()`), Tooltip.

**Patterns:** AppShell, CalendarHeatmap, ChartContainer (Recharts 3), DataTable (TanStack
Table v9), Delta, EmptyState, FileDropzone, MacroBar, Markdown, Measure, Money, PageHeader,
QuickAddBar, StatCard, Timeline.

**Helpers:** `formatNumber` (percent, currency, compact, signed), `foldToOther` and
`seriesColor` for charts, `useChartTokens` for Recharts props resolved from tokens.

Usage, do and don't, and accessibility notes for each live in its story
(`src/components/*/*.stories.tsx`), rendered by the docs site.

## Rules

- Style only with Plumage utilities (`bg-surface`, `text-muted`, `h-control-md`, `gap-sm`).
  `test/utilities.test.ts` compiles every class against the token theme and fails on raw
  values and typos.
- If a component needs a value Plumage lacks, add a token in `@plumage/tokens` first.
- Every interactive story has a play function; `test/stories.test.tsx` runs them all with
  axe.

Decisions: [ADR 0005](../../docs/adr/0005-component-architecture.md),
[0006](../../docs/adr/0006-plumage-provider-and-scopes.md),
[0007](../../docs/adr/0007-testing-strategy.md),
[0008](../../docs/adr/0008-patterns-data-table-and-charts.md).
