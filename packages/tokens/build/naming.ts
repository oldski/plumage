// Token ID -> CSS custom property, and token ID -> Tailwind v4 theme variables.

export const PREFIX = "pl";

export function cssVarName(id: string): string {
  return `--${PREFIX}-${id.replaceAll(".", "-")}`;
}

/**
 * Tailwind v4 theme variables for a public token. Tailwind looks up
 * property-specific namespaces before the shared `--color-*` one
 * (`text-*` checks `--text-color-*` first, `bg-*` checks
 * `--background-color-*`), so one role name can resolve to the right token
 * per property: `text-positive` is the text-safe green, `bg-positive` is the
 * solid fill. Throws for a public token with no mapping, so a new token is a
 * deliberate decision about its utility name.
 */
export function tailwindVars(id: string): string[] {
  const p = id.split(".");
  const rest = (from: number) => p.slice(from).join("-");

  if (p[0] === "color") {
    switch (p[1]) {
      case "bg":
        return [`--background-color-${rest(2)}`];
      case "text":
        return [`--text-color-${rest(2)}`];
      case "border":
        return p[2] === "focus"
          ? ["--border-color-focus", "--ring-color-focus", "--outline-color-focus"]
          : [`--border-color-${rest(2)}`];
      case "accent":
        if (p[2] === "default") return ["--color-accent"];
        if (p[2] === "text") return ["--text-color-accent"];
        return [`--color-accent-${rest(2)}`];
      case "feedback": {
        const [role, variant] = p[2]!.split("-") as [string, string | undefined];
        // text-negative and border-negative share the text-safe color, so an
        // invalid input's border meets 3:1. The softer outline for message
        // boxes is border-negative-subtle.
        if (!variant) return [`--text-color-${role}`, `--border-color-${role}`];
        if (variant === "solid") return [`--color-${role}`];
        if (variant === "subtle") return [`--color-${role}-subtle`];
        if (variant === "border") return [`--border-color-${role}-subtle`];
        break;
      }
      case "chart":
        if (p[2] === "categorical") return [`--color-chart-${p[3]}`];
        if (p[2] === "sequential") return [`--color-chart-seq-${p[3]}`];
        if (p[2] === "diverging") return [`--color-chart-div-${p[3]}`];
        if (p[2] === "delta") return [`--color-chart-${p[3]}`];
        return [`--color-chart-${rest(2)}`];
    }
  }
  if (p[0] === "shadow") return [`--shadow-${rest(1)}`];
  if (p[0] === "radius") return [`--radius-${rest(1)}`];
  if (p[0] === "font") {
    // The body family is Tailwind's default font-sans: "font-body" is already a weight.
    if (p[1] === "family") return [p[2] === "body" ? "--font-sans" : `--font-${p[2]}`];
    if (p[1] === "weight") return [`--font-weight-${p[2]}`];
    if (p[1] === "size") return [`--text-${p[2]}`];
    if (p[1] === "line-height") return [`--text-${p[2]}--line-height`];
    // How the display face is set: read by @plumage/ui's display utilities,
    // since "font-display" is already the family utility.
    if (p[1] === "display") return [];
  }
  if (p[0] === "space") {
    if (p[1] === "inset") return [`--padding-inset-${p[2]}`];
    if (p[1] === "control") return [`--padding-control-${p[2]}`];
    return [`--spacing-${p[1]}`];
  }
  if (p[0] === "size") {
    if (p[1] === "bar") return ["--height-bar"];
    if (p[1] === "chart") return [`--height-chart-${p[2]}`];
    if (p[1] === "control") return [`--height-control-${p[2]}`, `--size-control-${p[2]}`];
    if (p[1] === "row") return [`--height-row-${p[2]}`];
    if (p[1] === "icon") return [`--size-icon-${p[2]}`];
    if (p[1] === "figure") return [`--size-figure-${p[2]}`];
    if (p[1] === "overlay") {
      return [
        `--width-overlay-${p[2]}`,
        `--max-width-overlay-${p[2]}`,
        `--min-width-overlay-${p[2]}`,
      ];
    }
  }
  if (p[0] === "motion" && p[1] === "easing") return [`--ease-${p[2]}`];
  if (p[0] === "opacity") return [`--opacity-${rest(1)}`];
  // Exposed as CSS variables only: no Tailwind namespace fits them cleanly.
  if (p[0] === "motion" || p[0] === "focus" || p[0] === "border") return [];

  // Chart mark tokens are consumed by JavaScript (Recharts props), not utilities.
  if (p[0] === "chart") return [];

  // Component tokens: <component>.<...>.<property>
  const last = p.at(-1)!;
  const subject = p.slice(0, -1).join("-");
  if (last === "radius") return [`--radius-${subject}`];
  if (last === "padding") return [`--padding-${subject}`];
  if (last === "padding-x") return [`--padding-${subject}-x`];
  if (last === "height") return [`--height-${subject}`];
  if (last === "width") return [`--width-${subject}`, `--max-width-${subject}`];
  if (last === "max-width") return [`--max-width-${subject}`];
  if (last === "min-width") return [`--min-width-${subject}`];
  if (last === "size") return [`--size-${subject}`];
  if (last === "font-weight") return [`--font-weight-${subject}`];

  throw new Error(`No Tailwind mapping for token ${id}. Add one in build/naming.ts.`);
}

/** The utility a reader would type, for docs: --background-color-surface -> bg-surface. */
export function exampleUtility(themeVar: string): string | undefined {
  const table: [RegExp, string][] = [
    [/^--background-color-(.+)$/, "bg-$1"],
    [/^--text-color-(.+)$/, "text-$1"],
    [/^--border-color-(.+)$/, "border-$1"],
    [/^--ring-color-(.+)$/, "ring-$1"],
    [/^--outline-color-(.+)$/, "outline-$1"],
    [/^--color-(.+)$/, "bg-$1"],
    [/^--shadow-(.+)$/, "shadow-$1"],
    [/^--radius-(.+)$/, "rounded-$1"],
    [/^--font-weight-(.+)$/, "font-$1"],
    [/^--font-(.+)$/, "font-$1"],
    [/^--text-(.+)--line-height$/, ""],
    [/^--text-(.+)$/, "text-$1"],
    [/^--spacing-(.+)$/, "gap-$1"],
    [/^--padding-(.+)$/, "p-$1"],
    [/^--height-(.+)$/, "h-$1"],
    [/^--max-width-(.+)$/, "max-w-$1"],
    [/^--min-width-(.+)$/, "min-w-$1"],
    [/^--width-(.+)$/, "w-$1"],
    [/^--size-(.+)$/, "size-$1"],
    [/^--ease-(.+)$/, "ease-$1"],
    [/^--opacity-(.+)$/, "opacity-$1"],
  ];
  for (const [re, out] of table)
    if (re.test(themeVar)) return themeVar.replace(re, out) || undefined;
  return undefined;
}

/**
 * tailwind-merge configuration, so cn() resolves conflicts between Plumage
 * utilities. Property-specific color names (bg-raised, text-muted) extend
 * their own class groups; only shared --color-* names join the color scale.
 * Otherwise a name like "raised" would also read as a shadow color, and
 * shadow-raised would stop overriding shadow-modal.
 */
export interface TailwindMergeConfig {
  theme: Record<string, string[]>;
  classGroups: Record<string, [Record<string, string[]>]>;
}

const PROPERTY_COLOR_GROUPS: Record<string, [group: string, prefix: string]> = {
  "background-color": ["bg-color", "bg"],
  "text-color": ["text-color", "text"],
  "border-color": ["border-color", "border"],
  "ring-color": ["ring-color", "ring"],
  "outline-color": ["outline-color", "outline"],
};

export function tailwindMergeConfig(themeVars: string[]): TailwindMergeConfig {
  const theme: Record<string, Set<string>> = {};
  const groups: Record<string, Set<string>> = {};
  const add = (bucket: Record<string, Set<string>>, key: string, value: string) =>
    (bucket[key] ??= new Set()).add(value);
  for (const v of themeVars) {
    let m: RegExpExecArray | null;
    if (
      (m = /^--(background-color|text-color|border-color|ring-color|outline-color)-(.+)$/.exec(v))
    ) {
      add(groups, m[1]!, m[2]!);
    } else if ((m = /^--color-(.+)$/.exec(v))) add(theme, "color", m[1]!);
    else if (/^--text-.+--line-height$/.test(v)) continue;
    else if ((m = /^--text-(.+)$/.exec(v))) add(theme, "text", m[1]!);
    else if ((m = /^--font-weight-(.+)$/.exec(v))) add(theme, "font-weight", m[1]!);
    else if ((m = /^--font-(.+)$/.exec(v))) add(theme, "font", m[1]!);
    else if ((m = /^--radius-(.+)$/.exec(v))) add(theme, "radius", m[1]!);
    else if ((m = /^--shadow-(.+)$/.exec(v))) add(theme, "shadow", m[1]!);
    else if ((m = /^--ease-(.+)$/.exec(v))) add(theme, "ease", m[1]!);
    else if ((m = /^--(?:spacing|padding|height|size|width|max-width|min-width)-(.+)$/.exec(v))) {
      add(theme, "spacing", m[1]!);
    }
  }
  const sorted = (set: Set<string>) => [...set].sort();
  return {
    theme: Object.fromEntries(Object.entries(theme).map(([k, set]) => [k, sorted(set)])),
    classGroups: Object.fromEntries(
      Object.entries(groups).map(([property, set]) => {
        const [group, prefix] = PROPERTY_COLOR_GROUPS[property]!;
        return [group, [{ [prefix]: sorted(set) }]];
      }),
    ),
  };
}
