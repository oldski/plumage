---
"@plumage/tokens": minor
"@plumage/ui": minor
---

Add `NumberInput`, `Combobox`, `DatePicker` (with `Calendar`), `Popover`, and the `Money`
pattern. `formatNumber` now writes negatives with a true minus sign (U+2212, exported as
`MINUS`), so code comparing formatted text to a hyphen must change. Font primitives declare
whether they have tabular figures (`$extensions["dev.plumage"].tabularFigures`), and a test
requires every brand's numeric font to have them.
