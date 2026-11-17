// Inputs for the primitive color ramps. Edit this file, then run `pnpm ramps`
// to regenerate src/primitives/color.tokens.json.
//
// Every ramp shares one luminance scale: step N has the same WCAG relative
// luminance in every hue. That makes contrast a property of the step number,
// not of the hue, which is what lets one semantic mapping serve every brand.
// See docs/adr/0004-luminance-matched-color-ramps.md.

/** Target WCAG relative luminance (0 to 1) for each step. */
export const LUMINANCE_BY_STEP = {
  25: 0.965,
  50: 0.925,
  100: 0.865,
  150: 0.8,
  200: 0.72,
  300: 0.55,
  400: 0.39,
  450: 0.315,
  500: 0.25,
  550: 0.19,
  600: 0.14,
  700: 0.085,
  800: 0.05,
  850: 0.037,
  900: 0.027,
  925: 0.019,
  950: 0.0135,
  975: 0.008,
} as const;

export type Step = keyof typeof LUMINANCE_BY_STEP;

// 450 and 550 are half steps around the middle of the ramp, where data
// visualization needs finer luminance control than UI roles do.
export const CHROMATIC_STEPS = [
  50, 100, 200, 300, 400, 450, 500, 550, 600, 700, 800, 900, 950,
] as const satisfies readonly Step[];

export const NEUTRAL_STEPS = [
  25, 50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 900, 925, 950, 975,
] as const satisfies readonly Step[];

/** Relative chroma per chromatic step; multiplied by a ramp's peak chroma. */
const DEFAULT_SHAPE: Record<(typeof CHROMATIC_STEPS)[number], number> = {
  50: 0.12,
  100: 0.24,
  200: 0.45,
  300: 0.72,
  400: 0.92,
  450: 0.97,
  500: 1,
  550: 1,
  600: 1,
  700: 0.92,
  800: 0.78,
  900: 0.62,
  950: 0.5,
};

export interface ChromaticRamp {
  kind: "chromatic";
  description: string;
  /** OKLCH hue at the lightest step and at the darkest step; interpolated between. */
  hue: readonly [light: number, dark: number];
  /** Peak OKLCH chroma; gamut mapping lowers it where sRGB cannot reach. */
  peakChroma: number;
  shape?: Partial<typeof DEFAULT_SHAPE>;
  /** Hue overrides for single steps, where the interpolated hue lands in a neighbor's territory. */
  hueAt?: Partial<Record<(typeof CHROMATIC_STEPS)[number], number>>;
}

export interface NeutralRamp {
  kind: "neutral";
  description: string;
  hue: number;
  /** OKLCH chroma at the lightest and darkest step; interpolated between. */
  chroma: readonly [light: number, dark: number];
}

export const RAMPS: Record<string, ChromaticRamp | NeutralRamp> = {
  gray: {
    kind: "neutral",
    description: "Neutral gray with a barely perceptible cool cast.",
    hue: 260,
    chroma: [0.003, 0.008],
  },
  stone: {
    kind: "neutral",
    description: "Warm, sandy neutral for calm, earthy brands.",
    hue: 70,
    chroma: [0.008, 0.014],
  },
  cream: {
    kind: "neutral",
    description:
      "Warm cream neutral: buttery at the light end, a soft warm charcoal at the dark end. For cozy, kitchen-warm brands.",
    hue: 85,
    chroma: [0.018, 0.012],
  },
  red: {
    kind: "chromatic",
    description: "Red. Default home of negative and destructive roles.",
    hue: [25, 24],
    peakChroma: 0.21,
  },
  orange: {
    kind: "chromatic",
    description: "Orange. Warning for brands whose accent is yellow.",
    hue: [58, 40],
    peakChroma: 0.19,
    // At these luminances hue 40 to 44 reads as red, so dark-mode warning
    // surfaces looked like errors. Swing back toward amber-brown instead.
    hueAt: { 700: 50, 800: 56, 900: 60, 950: 62 },
  },
  russet: {
    kind: "chromatic",
    description:
      "Earthy red-brown. Lower chroma than red or orange, so it reads as brown, not as an error or a warning.",
    hue: [52, 44],
    peakChroma: 0.13,
  },
  buff: {
    kind: "chromatic",
    description:
      "Warm buff: a muted tan, like a chickadee's flanks. Low chroma, so it reads as a soft natural color, not as gold or a warning.",
    hue: [78, 62],
    peakChroma: 0.085,
  },
  gold: {
    kind: "chromatic",
    description: "Warm yellow-gold. Hue drifts toward amber as it darkens to avoid olive.",
    hue: [96, 66],
    peakChroma: 0.18,
    shape: { 200: 0.7, 300: 1, 400: 1 },
  },
  green: {
    kind: "chromatic",
    description: "Green. Default home of positive roles.",
    hue: [146, 150],
    peakChroma: 0.19,
  },
  emerald: {
    kind: "chromatic",
    description:
      "Iridescent emerald: bluer than green, so a brand accent in it stays apart from positive roles kept on teal or green.",
    hue: [160, 164],
    peakChroma: 0.17,
  },
  teal: {
    kind: "chromatic",
    description: "Teal.",
    hue: [182, 188],
    peakChroma: 0.15,
  },
  blue: {
    kind: "chromatic",
    description: "Blue. Default home of informational roles and sequential data.",
    hue: [250, 262],
    peakChroma: 0.2,
  },
  violet: {
    kind: "chromatic",
    description: "Violet.",
    hue: [296, 290],
    peakChroma: 0.24,
  },
  ruby: {
    kind: "chromatic",
    description:
      "Ruby: a deep crimson between red and pink, like a hummingbird's throat. Reserved for a secondary accent.",
    hue: [10, 12],
    peakChroma: 0.22,
  },
  pink: {
    kind: "chromatic",
    description: "Pink.",
    hue: [354, 356],
    peakChroma: 0.21,
  },
};

export function chromaFor(ramp: ChromaticRamp, step: (typeof CHROMATIC_STEPS)[number]): number {
  return ramp.peakChroma * (ramp.shape?.[step] ?? DEFAULT_SHAPE[step]);
}

/** A step's hue: its override, or the light-to-dark interpolation at position t. */
export function hueFor(
  ramp: ChromaticRamp,
  step: (typeof CHROMATIC_STEPS)[number],
  t: number,
): number {
  return ramp.hueAt?.[step] ?? ramp.hue[0] + (ramp.hue[1] - ramp.hue[0]) * t;
}
