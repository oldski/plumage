// Color math shared by the ramp generator and the token checks.
// Everything here is computed, never eyeballed: WCAG 2.x contrast for text and
// UI, OKLab distance for perceptual separation, and the Machado, Oliveira &
// Fernandes (2009) model for color vision deficiency simulation.
import {
  converter,
  differenceEuclidean,
  formatHex,
  parse,
  toGamut,
  wcagContrast,
  wcagLuminance,
  type Color,
  type Oklch,
  type Rgb,
} from "culori";

const toOklch = converter("oklch");
const toRgb = converter("rgb");
const toLrgb = converter("lrgb");
const mapToSrgb = toGamut("rgb", "oklch");
const deltaEOklab = differenceEuclidean("oklab");

export interface OklchTriple {
  l: number;
  c: number;
  h: number;
}

export function parseColor(input: string): Color {
  const color = parse(input);
  if (!color) throw new Error(`Unparseable color: ${input}`);
  return color;
}

export function hexOf(color: Color): string {
  return formatHex(color);
}

export function oklchOf(input: string | Color): OklchTriple {
  const c = toOklch(typeof input === "string" ? parseColor(input) : input);
  return { l: c.l, c: c.c, h: c.h ?? 0 };
}

export function luminance(input: string | Color): number {
  return wcagLuminance(typeof input === "string" ? parseColor(input) : input);
}

export function contrast(a: string | Color, b: string | Color): number {
  return wcagContrast(
    typeof a === "string" ? parseColor(a) : a,
    typeof b === "string" ? parseColor(b) : b,
  );
}

/** Composite a possibly translucent color over an opaque backdrop. */
export function composite(top: string, backdrop: string): string {
  const fg = toRgb(parseColor(top));
  const bg = toRgb(parseColor(backdrop));
  const a = fg.alpha ?? 1;
  const mix = (f: number, b: number) => f * a + b * (1 - a);
  const out: Rgb = { mode: "rgb", r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b) };
  return formatHex(out);
}

/**
 * Find the in-gamut sRGB color with the given hue and target chroma whose WCAG
 * relative luminance equals `targetY`. Lightness is solved by bisection; chroma
 * is reduced by CSS Color 4 gamut mapping wherever sRGB cannot reach it.
 */
export function solveForLuminance(targetY: number, chroma: number, hue: number): Color {
  let lo = 0;
  let hi = 1;
  let best: Color = mapToSrgb({ mode: "oklch", l: 0.5, c: chroma, h: hue } satisfies Oklch);
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2;
    const candidate = mapToSrgb({ mode: "oklch", l: mid, c: chroma, h: hue } satisfies Oklch);
    best = candidate;
    if (wcagLuminance(candidate) < targetY) lo = mid;
    else hi = mid;
  }
  return best;
}

export type Deficiency = "protan" | "deutan" | "tritan";

// Machado, Oliveira & Fernandes (2009), severity 1.0. The matrices are defined
// on LINEAR RGB. culori's filterDeficiency* helpers apply the same matrices to
// gamma-encoded sRGB, which overstates separation for saturated reds and
// greens, so we apply them ourselves. Cross-checked against an independent
// validator; see docs/adr/0004-luminance-matched-color-ramps.md.
const MACHADO: Record<Deficiency, number[][]> = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

export function simulateCvd(input: string | Color, deficiency: Deficiency): Color {
  const { r, g, b } = toLrgb(typeof input === "string" ? parseColor(input) : input);
  const m = MACHADO[deficiency];
  const clamp = (n: number) => Math.min(1, Math.max(0, n));
  const row = (i: number) => clamp(m[i]![0]! * r + m[i]![1]! * g + m[i]![2]! * b);
  return { mode: "lrgb", r: row(0), g: row(1), b: row(2) };
}

/** OKLab Euclidean distance x100, the unit the data-viz thresholds use. */
export function deltaE(a: string, b: string, deficiency?: Deficiency): number {
  if (!deficiency) return deltaEOklab(parseColor(a), parseColor(b)) * 100;
  return deltaEOklab(simulateCvd(a, deficiency), simulateCvd(b, deficiency)) * 100;
}
