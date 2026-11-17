# 0004. Luminance-matched color ramps and computed accessibility

- **Status:** Accepted
- **Date:** 2026-10-29
- **Scope:** Plumage

## Context

Two brands with very different accents (a light gold, a dark violet) need to share one
light and one dark semantic mapping (see [0003](0003-token-architecture-and-theming.md)).
That only works if a step number means the same contrast in every hue. Off-the-shelf
palettes do not guarantee that: yellow 600 and blue 600 usually differ a lot in
luminance.

Separately, the chart palette must be colorblind-safe, and the brief asks us to document
how that was checked.

## Decision

### Ramps are generated, not picked

`scripts/generate-ramps.ts` builds every ramp from `scripts/ramps.config.ts`. Each step
has a target WCAG relative luminance shared by all hues. For each hue and step, the
script solves for the OKLCH lightness that hits the target luminance at the requested
chroma, gamut-mapping chroma down where sRGB cannot reach it (CSS Color 4 method). Hue
drifts slightly across some ramps (gold moves toward amber as it darkens) to avoid
olive and muddy tones.

That makes contrast a property of the step:

| Step | On white     | On gray 950 (dark surface) | Use                                                         |
| ---- | ------------ | -------------------------- | ----------------------------------------------------------- |
| 400  | 2.38 to 2.40 | 6.89 to 6.93               | Text on dark surfaces                                       |
| 500  | 3.48 to 3.52 | 4.69 to 4.74               | Marks and boundaries in both modes                          |
| 600  | 5.51 to 5.54 | 2.98 to 2.99               | Text on light surfaces; solid fills with white text (5.5:1) |

Ranges are across all eight chromatic hues. Because 600 sits just under 3:1 on the dark
surface, dark mode never uses it as a boundary; solid fills at 600 carry their own text.

Steps 450 and 550 exist in chromatic ramps for chart palettes, which need finer
luminance control than UI roles.

### Every accessibility claim is computed

`pnpm --filter @plumage/tokens check` runs after every build and fails CI on any
violation. It covers every brand x mode:

- **Text contrast** (4.5:1) for default, muted, subtle, accent, link, feedback, and
  on-fill text, against canvas, surface, raised, sunken, selected, and the hover and
  pressed washes. Translucent tokens are composited over the surface first.
- **UI contrast** (3:1) for strong borders, the focus ring, and delta marks.
- **The ramp contract** above, plus monotonic lightness per ramp.
- **Chart palettes** (below), and the tier rule that component tokens alias only
  semantic or component tokens.

It writes `dist/accessibility-report.md`, which the docs site renders.

### Chart palette

The eight categorical hues are chosen by `scripts/choose-chart-palette.ts`, not by eye.
For every cyclic order of the eight hues (blue fixed first), it picks one step per hue
per mode, by dynamic programming, to maximize the weakest adjacent pair, subject to:

- OKLCH lightness band (0.43 to 0.77 light, 0.48 to 0.67 dark) and chroma of at least 0.10;
- at least 3:1 against the chart surface in that mode;
- CVD separation: OKLab distance x100 of at least 8 under simulated protanopia and
  deuteranopia (Machado, Oliveira and Fernandes 2009, severity 1.0), and at least 15 for
  normal vision;
- adjacency includes the wrap-around pair, because in a donut the last slice touches the
  first.

Ties are broken for a finance product: red and green carry gain and loss meaning, so they
go in the back half (slots 5 to 8). They can never be neighbors, since red beside green
is the classic deuteranopia collapse. Orange and gold are limited to their vivid steps
because they turn brown below step 550.

Result: blue, orange, teal, gold, pink, green, violet, red. In light mode every slot is
step 500. Worst adjacent CVD separation is 10.6 (light) and 14.2 (dark); the first three
slots also pass when every pair is checked, for scatter plots and small multiples. A
ninth series is folded into "Other", never generated.

### A bug we caught by cross-checking

Our first implementation used culori's `filterDeficiency*` helpers. They apply the
Machado matrices to gamma-encoded sRGB, but the model defines them on linear RGB. The
error overstated separation for saturated reds and greens: one red and green pair
measured 9.6 (pass) instead of 4.7 (fail). We found it by running the palette through an
independent validator, replaced the helper with our own linear-RGB implementation, and
added a regression test that pins the reference values.

## Consequences

- **Good:** a brand can swap its accent ramp without re-auditing the semantic mapping;
  the check proves it in seconds.
- **Good:** colorblind safety is reproducible from a script and a report, not asserted.
- **Bad:** luminance matching makes mid-step yellows and oranges darker than a designer
  might pick by eye. The gold accent uses step 300 (`#f4bc00`) for exactly that reason.
- **Bad:** contrast metrics are WCAG 2.x. If WCAG 3 (APCA) becomes the target, the check
  script needs a second metric; the ramps themselves would not change.
- **Follow-up:** charts must still pair color with a second channel (direct labels,
  patterns, or the table view). Color separation is necessary, not sufficient.

## References

- Machado, Oliveira, Fernandes. "A Physiologically-based Model for Simulation of Color
  Vision Deficiency." IEEE TVCG, 2009.
- WCAG 2.2, success criteria 1.4.3 and 1.4.11.
- Bjorn Ottosson, "A perceptual color space for image processing" (OKLab), 2020.
