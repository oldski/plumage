// WCAG 2.x contrast for the token reference, computed from resolved token
// values (hex, with alpha composited over a backdrop). The token build checks
// every required pairing in CI (pnpm --filter @plumage/tokens check); this
// shows the same numbers next to the swatches.

type Rgba = [number, number, number, number];

/** "#rrggbb" or "#rrggbbaa" as 0 to 255 channels and 0 to 1 alpha; null otherwise. */
export function parseHex(value: string): Rgba | null {
  const match = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(value.trim());
  if (!match?.[1]) return null;
  const hex = match[1];
  const channel = (i: number) => parseInt(hex.slice(i, i + 2), 16);
  return [channel(0), channel(2), channel(4), match[2] ? parseInt(match[2], 16) / 255 : 1];
}

/** A translucent color as it looks over an opaque backdrop. */
function over([r, g, b, a]: Rgba, [br, bg, bb]: Rgba): Rgba {
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1];
}

function luminance([r, g, b]: Rgba): number {
  const linear = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/**
 * The contrast ratio of two colors. A translucent background (a hover tint)
 * is composited over the backdrop first, and a translucent foreground over
 * the result, as the browser draws them.
 */
export function contrast(
  foreground: string,
  background: string,
  backdrop: string = background,
): number | null {
  const fg = parseHex(foreground);
  const bg = parseHex(background);
  const base = parseHex(backdrop);
  if (!fg || !bg || !base) return null;
  const solid = over(bg, over(base, [255, 255, 255, 1]));
  const [a, b] = [luminance(over(fg, solid)), luminance(solid)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
