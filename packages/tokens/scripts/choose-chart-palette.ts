// Chooses the categorical chart palette from the primitive ramps instead of by
// eye. For every cyclic ordering of the eight chart hues, it picks one ramp
// step per hue per mode to maximize the weakest adjacent pair (including the
// wrap-around pair, since donut slices touch end to end), subject to the
// per-swatch gates. The same hue order is used in both modes; only the steps
// differ. Run with `node --experimental-strip-types scripts/choose-chart-palette.ts`.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { deltaE } from "./lib/color.ts";
import { THRESHOLDS, checkPalette, checkSwatch, allPairs, type Mode } from "./lib/dataviz.ts";

const HUES = ["blue", "orange", "teal", "gold", "pink", "green", "violet", "red"] as const;
const CANDIDATE_STEPS: Record<Mode, string[]> = {
  light: ["450", "500", "550", "600", "700"],
  dark: ["400", "450", "500", "550"],
};
// Chart surfaces: semantic color.bg.surface in each mode (neutral 0 and neutral 950).
const primitives = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../src/primitives/color.tokens.json", import.meta.url)),
    "utf8",
  ),
) as { color: Record<string, Record<string, { $value: { hex: string } }>> };
const hexOf = (hue: string, step: string) => primitives.color[hue]![step]!.$value.hex;
const SURFACE: Record<Mode, string> = { light: "#ffffff", dark: hexOf("gray", "950") };

interface Option {
  step: string;
  hex: string;
}

// Orange and gold turn brown below step 550, so they keep to their vivid steps.
const VIVID_ONLY = new Set(["orange", "gold"]);
const MAX_VIVID_STEP = 550;

function optionsFor(mode: Mode): Option[][] {
  return HUES.map((hue) =>
    CANDIDATE_STEPS[mode]
      .filter((step) => !VIVID_ONLY.has(hue) || Number(step) <= MAX_VIVID_STEP)
      .map((step) => ({ step, hex: hexOf(hue, step) }))
      .filter(({ hex }) => {
        const s = checkSwatch(hex, mode, SURFACE[mode]);
        return s.band === "pass" && s.chroma_ === "pass" && s.contrast_ === "pass";
      }),
  );
}

function pairScore(a: string, b: string): number {
  const cvd = Math.min(deltaE(a, b, "protan"), deltaE(a, b, "deutan"));
  const normal = deltaE(a, b);
  return Math.min(cvd / THRESHOLDS.cvdTarget, normal / THRESHOLDS.normalFloor);
}

/** Bottleneck-optimal steps along a cycle, by dynamic programming. */
function bestSteps(order: number[], options: Option[][], cache: Map<string, number>) {
  const score = (x: Option, y: Option) => {
    const key = `${x.hex}${y.hex}`;
    let v = cache.get(key);
    if (v === undefined) {
      v = pairScore(x.hex, y.hex);
      cache.set(key, v);
    }
    return v;
  };
  let best = { value: -Infinity, picks: [] as Option[] };
  for (const first of options[order[0]!]!) {
    let layer = [{ value: Infinity, picks: [first] }];
    for (let i = 1; i < order.length; i++) {
      layer = options[order[i]!]!.map((opt) => {
        let pick = { value: -Infinity, picks: [] as Option[] };
        for (const prev of layer) {
          const v = Math.min(prev.value, score(prev.picks.at(-1)!, opt));
          if (v > pick.value) pick = { value: v, picks: [...prev.picks, opt] };
        }
        return pick;
      });
    }
    for (const end of layer) {
      const v = Math.min(end.value, score(end.picks.at(-1)!, first));
      if (v > best.value) best = { value: v, picks: end.picks };
    }
  }
  return best;
}

function* permutations(items: number[]): Generator<number[]> {
  if (items.length <= 1) {
    yield items;
    return;
  }
  for (let i = 0; i < items.length; i++) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const p of permutations(rest)) yield [items[i]!, ...p];
  }
}

const options = { light: optionsFor("light"), dark: optionsFor("dark") };
for (const mode of ["light", "dark"] as const) {
  options[mode].forEach((opts, i) => {
    if (opts.length === 0) throw new Error(`${HUES[i]} has no ${mode} step that passes the gates`);
  });
}

const caches = { light: new Map<string, number>(), dark: new Map<string, number>() };
const results: { order: number[]; value: number; light: Option[]; dark: Option[] }[] = [];
// Blue is pinned to slot 1: rotations of a cycle are equivalent for adjacency.
for (const tail of permutations([1, 2, 3, 4, 5, 6, 7])) {
  const order = [0, ...tail];
  const light = bestSteps(order, options.light, caches.light);
  const dark = bestSteps(order, options.dark, caches.dark);
  results.push({
    order,
    value: Math.min(light.value, dark.value),
    light: light.picks,
    dark: dark.picks,
  });
}
// Ranking: every order scoring >= 1 clears all gates. Among those, a finance
// product prefers red and green late (they carry gain/loss
// meaning) somewhere in slots 5 to 8 (they can never touch: red next to green
// is the classic deuteranopia collapse), then the widest margin, then the strongest first three slots
// under all-pairs checking (small charts and scatter plots use only those).
const RED = HUES.indexOf("red");
const GREEN = HUES.indexOf("green");
const lateStatusHues = (order: number[]) =>
  [RED, GREEN].every((h) => order.indexOf(h) >= order.length / 2) ? 1 : 0;
const firstThreeStrength = (r: (typeof results)[number]) =>
  Math.min(
    checkPalette(
      r.light.slice(0, 3).map((p) => p.hex),
      "light",
      SURFACE.light,
      allPairs(3),
    ).worstCvd,
    checkPalette(
      r.dark.slice(0, 3).map((p) => p.hex),
      "dark",
      SURFACE.dark,
      allPairs(3),
    ).worstCvd,
  );
const passes = (r: (typeof results)[number]) => (r.value >= 1 ? 1 : 0);
results.sort(
  (a, b) =>
    passes(b) - passes(a) ||
    lateStatusHues(b.order) - lateStatusHues(a.order) ||
    Number((b.value - a.value).toFixed(3)) ||
    firstThreeStrength(b) - firstThreeStrength(a),
);

console.log(
  "Top orders (score >= 1.0 clears CVD target 8 and normal floor 15 on every adjacent pair):\n",
);
for (const r of results.slice(0, 5)) {
  const names = r.order.map((i) => HUES[i]).join(", ");
  const lightSteps = r.light.map((o) => o.step).join("/");
  const darkSteps = r.dark.map((o) => o.step).join("/");
  const first3 = (picks: Option[], mode: Mode) =>
    checkPalette(
      picks.slice(0, 3).map((p) => p.hex),
      mode,
      SURFACE[mode],
      allPairs(3),
    );
  const l3 = first3(r.light, "light");
  const d3 = first3(r.dark, "dark");
  console.log(
    `${r.value.toFixed(3)}  ${names}\n        light ${lightSteps}  dark ${darkSteps}  ` +
      `first-3 all-pairs: light cvd ${l3.worstCvd.toFixed(1)} / dark cvd ${d3.worstCvd.toFixed(1)}`,
  );
}
