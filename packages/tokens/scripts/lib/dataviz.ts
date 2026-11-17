// Computable checks for a categorical chart palette. The thresholds follow a
// published data-viz method: OKLCH lightness band per mode, a chroma floor,
// CVD separation under Machado 2009 (severity 1.0) protanopia and
// deuteranopia, a normal-vision floor, and 3:1 contrast against the chart
// surface. Delta E is Euclidean distance in OKLab, multiplied by 100.
import { contrast, deltaE, oklchOf } from "./color.ts";

export type Mode = "light" | "dark";

export const THRESHOLDS = {
  band: { light: [0.43, 0.77], dark: [0.48, 0.67] } as Record<Mode, [number, number]>,
  chromaFloor: 0.1,
  cvdTarget: 8,
  cvdFloor: 6,
  normalFloor: 15,
  contrastMin: 3,
} as const;

export type Verdict = "pass" | "warn" | "fail";

export interface SwatchReport {
  hex: string;
  lightness: number;
  chroma: number;
  contrast: number;
  band: Verdict;
  chroma_: Verdict;
  contrast_: Verdict;
}

export interface PairReport {
  a: number;
  b: number;
  protan: number;
  deutan: number;
  tritan: number;
  normal: number;
  cvd: Verdict;
  normal_: Verdict;
}

export interface PaletteReport {
  mode: Mode;
  surface: string;
  swatches: SwatchReport[];
  pairs: PairReport[];
  worstCvd: number;
  worstNormal: number;
  verdict: Verdict;
}

export function checkSwatch(hex: string, mode: Mode, surface: string): SwatchReport {
  const { l, c } = oklchOf(hex);
  const [lo, hi] = THRESHOLDS.band[mode];
  const ratio = contrast(hex, surface);
  return {
    hex,
    lightness: l,
    chroma: c,
    contrast: ratio,
    band: l >= lo && l <= hi ? "pass" : "fail",
    chroma_: c >= THRESHOLDS.chromaFloor ? "pass" : "fail",
    // Below 3:1 is legal only with a relief channel (direct labels or a table view).
    contrast_: ratio >= THRESHOLDS.contrastMin ? "pass" : "warn",
  };
}

export function checkPair(colors: readonly string[], a: number, b: number): PairReport {
  const ca = colors[a]!;
  const cb = colors[b]!;
  const protan = deltaE(ca, cb, "protan");
  const deutan = deltaE(ca, cb, "deutan");
  const tritan = deltaE(ca, cb, "tritan");
  const normal = deltaE(ca, cb);
  const worst = Math.min(protan, deutan);
  return {
    a,
    b,
    protan,
    deutan,
    tritan,
    normal,
    cvd: worst >= THRESHOLDS.cvdTarget ? "pass" : worst >= THRESHOLDS.cvdFloor ? "warn" : "fail",
    normal_: normal >= THRESHOLDS.normalFloor ? "pass" : "fail",
  };
}

/**
 * Adjacent pairs in slot order, plus the wrap-around pair (last, first),
 * because in a donut or pie the final slice touches the first.
 */
export function adjacentPairs(count: number): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < count - 1; i++) pairs.push([i, i + 1]);
  if (count > 2) pairs.push([count - 1, 0]);
  return pairs;
}

export function allPairs(count: number): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < count; i++) for (let j = i + 1; j < count; j++) pairs.push([i, j]);
  return pairs;
}

export function checkPalette(
  colors: readonly string[],
  mode: Mode,
  surface: string,
  pairs: [number, number][] = adjacentPairs(colors.length),
): PaletteReport {
  const swatches = colors.map((hex) => checkSwatch(hex, mode, surface));
  const pairReports = pairs.map(([a, b]) => checkPair(colors, a, b));
  const worstCvd = Math.min(...pairReports.map((p) => Math.min(p.protan, p.deutan)));
  const worstNormal = Math.min(...pairReports.map((p) => p.normal));
  const verdicts: Verdict[] = [
    ...swatches.flatMap((s) => [s.band, s.chroma_, s.contrast_]),
    ...pairReports.flatMap((p) => [p.cvd, p.normal_]),
  ];
  const verdict: Verdict = verdicts.includes("fail")
    ? "fail"
    : verdicts.includes("warn")
      ? "warn"
      : "pass";
  return { mode, surface, swatches, pairs: pairReports, worstCvd, worstNormal, verdict };
}
