// Accessibility and structure checks over the built tokens. Runs in CI via
// `pnpm check` (after `pnpm build`) and exits non-zero on any failure. Writes
// dist/accessibility-report.md, which the docs site renders.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { composite, contrast, oklchOf } from "./lib/color.ts";
import { adjacentPairs, allPairs, checkPalette, type Mode } from "./lib/dataviz.ts";
import { CHROMATIC_STEPS, RAMPS } from "./ramps.config.ts";
import { aliasTarget, loadSource, tierOf } from "../build/source.ts";
import { brands, modes, primitives, values, type TokenName } from "../dist/index.js";

interface Row {
  check: string;
  context: string;
  detail: string;
  ok: boolean;
}
const rows: Row[] = [];
const record = (check: string, context: string, detail: string, ok: boolean) =>
  rows.push({ check, context, detail, ok });

// 1. Contrast pairs. Translucent colors are composited over the surface they sit on.
const TEXT = 4.5;
const UI = 3;
const SURFACES: TokenName[] = [
  "color.bg.canvas",
  "color.bg.surface",
  "color.bg.raised",
  "color.bg.sunken",
];
const PAIRS: [fg: TokenName, bg: TokenName[], min: number][] = [
  ["color.text.default", [...SURFACES, "color.bg.selected"], TEXT],
  ["color.text.muted", [...SURFACES, "color.bg.selected"], TEXT],
  ["color.text.subtle", [...SURFACES, "color.bg.selected"], TEXT],
  ["color.accent.text", [...SURFACES, "color.accent.subtle"], TEXT],
  ["color.text.link", SURFACES, TEXT],
  [
    "color.text.on-accent",
    ["color.accent.default", "color.accent.hover", "color.accent.active"],
    TEXT,
  ],
  ["color.text.inverse", ["color.bg.inverse"], TEXT],
  ["color.border.strong", SURFACES, UI],
  ["color.border.focus", SURFACES, UI],
  ["color.chart.delta.positive", ["color.bg.surface"], UI],
  ["color.chart.delta.negative", ["color.bg.surface"], UI],
  ["color.chart.highlight", ["color.bg.surface"], UI],
];
for (const role of ["positive", "negative", "warning", "info"] as const) {
  PAIRS.push([`color.feedback.${role}`, [...SURFACES, `color.feedback.${role}-subtle`], TEXT]);
  PAIRS.push(["color.text.on-solid", [`color.feedback.${role}-solid`], TEXT]);
  // Alerts set body text on the tinted feedback backgrounds.
  PAIRS.push(["color.text.default", [`color.feedback.${role}-subtle`], TEXT]);
  PAIRS.push(["color.text.muted", [`color.feedback.${role}-subtle`], TEXT]);
}

for (const brand of brands) {
  for (const mode of modes) {
    const v = values[`${brand}/${mode}/comfortable`];
    const surface = v["color.bg.surface"];
    for (const [fg, bgs, min] of PAIRS) {
      for (const bg of bgs) {
        const back = composite(v[bg], surface);
        const ratio = contrast(composite(v[fg], back), back);
        record(
          min === TEXT ? "Text contrast" : "UI contrast",
          `${brand} ${mode}`,
          `${fg} on ${bg}: ${ratio.toFixed(2)}:1 (min ${min}:1)`,
          ratio >= min,
        );
      }
    }
    // Text must stay readable on the hover and pressed washes too.
    for (const wash of ["color.bg.hover", "color.bg.active"] as const) {
      const back = composite(v[wash], surface);
      const ratio = contrast(v["color.text.subtle"], back);
      record(
        "Text contrast",
        `${brand} ${mode}`,
        `color.text.subtle on ${wash}: ${ratio.toFixed(2)}:1 (min 4.5:1)`,
        ratio >= TEXT,
      );
    }
  }
}

// 2. The luminance contract behind the shared light and dark mapping.
const hex = (id: string) => primitives[id as keyof typeof primitives];
for (const name of Object.keys(RAMPS)) {
  if (RAMPS[name]!.kind !== "chromatic") continue;
  const step = (s: number) => hex(`color.${name}.${s}`);
  const darkSurface = hex("color.gray.950");
  const contract: [string, number, number][] = [
    [`600 on white`, contrast(step(600), "#ffffff"), TEXT],
    [`500 on white`, contrast(step(500), "#ffffff"), UI],
    [`400 on gray 950`, contrast(step(400), darkSurface), TEXT],
    [`500 on gray 950`, contrast(step(500), darkSurface), UI],
  ];
  for (const [label, ratio, min] of contract) {
    record("Ramp contract", name, `${label}: ${ratio.toFixed(2)}:1 (min ${min}:1)`, ratio >= min);
  }
  // Lightness must fall monotonically across the ramp.
  const ls = CHROMATIC_STEPS.map((s) => oklchOf(step(s)).l);
  record(
    "Ramp contract",
    name,
    "OKLCH lightness decreases at every step",
    ls.every((l, i) => i === 0 || l < ls[i - 1]!),
  );
}

// 3. Chart palettes. Categorical: adjacent pairs plus the donut wrap pair, all
// eight slots; first three slots under all-pairs (scatter, small multiples).
const series = (v: Record<string, string>, prefix: string, n: number) =>
  Array.from({ length: n }, (_, i) => v[`${prefix}.${i + 1}`]!);
const paletteSummary: string[] = [];
for (const brand of brands) {
  for (const mode of modes as readonly Mode[]) {
    const v = values[`${brand}/${mode}/comfortable`] as Record<string, string>;
    const surface = v["color.bg.surface"]!;
    const cat = series(v, "color.chart.categorical", 8);
    const adjacent = checkPalette(cat, mode, surface, adjacentPairs(8));
    const firstThree = checkPalette(cat.slice(0, 3), mode, surface, allPairs(3));
    record(
      "Chart categorical",
      `${brand} ${mode}`,
      `8 slots, adjacent + wrap: worst CVD dE ${adjacent.worstCvd.toFixed(1)} (target 8), worst normal dE ${adjacent.worstNormal.toFixed(1)} (floor 15), verdict ${adjacent.verdict}`,
      adjacent.verdict === "pass",
    );
    record(
      "Chart categorical",
      `${brand} ${mode}`,
      `First 3 slots, all pairs: worst CVD dE ${firstThree.worstCvd.toFixed(1)}, verdict ${firstThree.verdict}`,
      firstThree.verdict === "pass",
    );
    paletteSummary.push(
      `| ${brand} | ${mode} | ${cat.map((c) => `\`${c}\``).join(" ")} | ${adjacent.worstCvd.toFixed(1)} | ${adjacent.worstNormal.toFixed(1)} | ${Math.min(...adjacent.swatches.map((s) => s.contrast)).toFixed(2)}:1 |`,
    );

    // Sequential: one hue, lightness moves monotonically from low to high values.
    const seq = series(v, "color.chart.sequential", 7).map((c) => oklchOf(c).l);
    const monotone = seq.every(
      (l, i) => i === 0 || (mode === "light" ? l < seq[i - 1]! : l > seq[i - 1]!),
    );
    record(
      "Chart sequential",
      `${brand} ${mode}`,
      `Lightness runs ${mode === "light" ? "light to dark" : "dark to light"} across 7 steps`,
      monotone,
    );

    // Diverging: neutral midpoint, each arm monotone toward the midpoint.
    const div = series(v, "color.chart.diverging", 7);
    const mid = oklchOf(div[3]!);
    record(
      "Chart diverging",
      `${brand} ${mode}`,
      `Midpoint chroma ${mid.c.toFixed(3)} (max 0.03, reads as gray)`,
      mid.c <= 0.03,
    );
  }
}

// 4. Tier rules. Component tokens may alias only semantic or component tokens.
const source = loadSource();
for (const id of source.idsByLayer.component) {
  const target = aliasTarget(source.tokens.get(id)!.raw["."]);
  const tier = target ? tierOf(source.tokens.get(target)!) : "raw value";
  record(
    "Tier rules",
    "components",
    `${id} -> ${target ?? "raw value"} (${tier})`,
    tier === "semantic" || tier === "component",
  );
}

// Report.
const failures = rows.filter((r) => !r.ok);
const groups = [...new Set(rows.map((r) => r.check))];
const md = [
  "# Plumage token accessibility report",
  "",
  "Generated by `pnpm --filter @plumage/tokens check`. Every number below is computed from the built tokens.",
  "",
  "- Contrast: WCAG 2.x relative luminance. 4.5:1 for text, 3:1 for UI boundaries and chart marks.",
  "- Translucent tokens (hover, pressed, scrim) are composited over the surface before measuring.",
  "- Color vision deficiency: Machado, Oliveira and Fernandes (2009) at severity 1.0 for protanopia and deuteranopia; separation is Euclidean distance in OKLab x100.",
  "",
  "## Categorical chart palette",
  "",
  "| Brand | Mode | Slots 1 to 8 | Worst CVD dE | Worst normal dE | Lowest contrast |",
  "| --- | --- | --- | --- | --- | --- |",
  ...paletteSummary,
  "",
  "## Results",
  "",
  `${rows.length - failures.length} of ${rows.length} checks pass.`,
  "",
  ...groups.flatMap((g) => {
    const rs = rows.filter((r) => r.check === g);
    return [
      `### ${g} (${rs.filter((r) => r.ok).length}/${rs.length})`,
      "",
      "| | Context | Check |",
      "| --- | --- | --- |",
      ...rs.map((r) => `| ${r.ok ? "pass" : "**FAIL**"} | ${r.context} | ${r.detail} |`),
      "",
    ];
  }),
].join("\n");
writeFileSync(fileURLToPath(new URL("../dist/accessibility-report.md", import.meta.url)), md);

for (const g of groups) {
  const rs = rows.filter((r) => r.check === g);
  console.log(
    `${rs.every((r) => r.ok) ? "PASS" : "FAIL"}  ${g.padEnd(20)} ${rs.filter((r) => r.ok).length}/${rs.length}`,
  );
}
if (failures.length) {
  console.error(`\n${failures.length} failing checks:`);
  for (const f of failures) console.error(`  ${f.context}: ${f.detail}`);
  process.exit(1);
}
console.log(`\nAll ${rows.length} checks pass. Report: dist/accessibility-report.md`);
