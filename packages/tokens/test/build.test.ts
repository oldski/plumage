// Contract tests over the built outputs. Run after `pnpm build`.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  brandDefaults,
  brands,
  cssVar,
  cssVars,
  densities,
  modes,
  primitives,
  resolve,
  tailwindMergeConfig,
  values,
} from "../dist/index.js";
import { loadSource } from "../build/source.ts";

const dist = (file: string) =>
  readFileSync(fileURLToPath(new URL(`../dist/${file}`, import.meta.url)), "utf8");
// Prettier puts each selector in a list on its own line; join them back for matching.
const css = dist("plumage.css").replace(/,\n(?=[:[])/g, ", ");
const source = loadSource();

describe("permutations", () => {
  it("covers every brand x mode x density with the same token names", () => {
    const keys = Object.keys(values);
    expect(keys).toHaveLength(brands.length * modes.length * densities.length);
    const names = Object.keys(values["finch/light/comfortable"]).sort();
    for (const key of keys) {
      expect(Object.keys(values[key as keyof typeof values]).sort()).toEqual(names);
    }
  });

  it("resolves to concrete values, never var() references", () => {
    for (const row of Object.values(values)) {
      for (const value of Object.values(row)) expect(value).not.toContain("var(");
    }
  });

  it("makes brands differ in color and radius, and densities differ in size", () => {
    const f = values["finch/light/comfortable"];
    const v = values["sparrow/light/comfortable"];
    expect(f["color.accent.default"]).not.toBe(v["color.accent.default"]);
    expect(f["radius.control"]).not.toBe(v["radius.control"]);
    expect(values["finch/light/compact"]["size.control.md"]).not.toBe(f["size.control.md"]);
  });

  it("gives finch its gold accent with dark text on it", () => {
    expect(resolve("color.accent.default", { brand: "finch" })).toBe(primitives["color.gold.300"]);
    expect(resolve("color.text.on-accent", { brand: "finch" })).toBe(primitives["color.gray.975"]);
  });

  it("gives hummingbird an emerald accent, with positive roles on teal to keep them apart", () => {
    const h = values["hummingbird/light/comfortable"];
    expect(h["color.accent.default"]).toBe(primitives["color.emerald.600"]);
    expect(h["color.text.on-accent"]).toBe(primitives["color.white"]);
    expect(h["color.feedback.positive"]).toBe(primitives["color.teal.600"]);
  });

  it("gives chickadee a buff accent with soft charcoal text, on cream neutrals", () => {
    const c = values["chickadee/light/comfortable"];
    expect(c["color.accent.default"]).toBe(primitives["color.buff.300"]);
    expect(c["color.text.on-accent"]).toBe(primitives["color.cream.975"]);
    expect(c["color.bg.canvas"]).toBe(primitives["color.cream.50"]);
  });

  it("gives each brand a chart highlight apart from its accent: ruby for hummingbird", () => {
    expect(values["hummingbird/light/comfortable"]["color.chart.highlight"]).toBe(
      primitives["color.ruby.500"],
    );
    for (const brand of brands) {
      const v = values[`${brand}/light/comfortable`];
      expect(v["color.chart.highlight"], brand).not.toBe(v["color.accent.default"]);
    }
  });

  it("sets display text per brand, always with lining figures", () => {
    expect(resolve("font.family.display", { brand: "hummingbird" })).toMatch(/^"?Clash Grotesk/);
    expect(resolve("font.family.display", { brand: "chickadee" })).toMatch(/^"?Gambetta/);
    for (const brand of brands) {
      expect(resolve("font.display.figures", { brand })).toContain("lining-nums");
      expect(Number(resolve("font.display.line-height", { brand }))).toBeGreaterThan(0);
    }
  });

  it("keeps every brand's colors distinct", () => {
    const accents = brands.map(
      (brand) => values[`${brand}/light/comfortable`]["color.accent.default"],
    );
    expect(new Set(accents).size).toBe(brands.length);
  });
});

describe("public API", () => {
  it("keeps primitives and the brand palette out of the public token names", () => {
    const names = Object.keys(cssVars);
    expect(names.some((n) => n.startsWith("brand."))).toBe(false);
    expect(names).not.toContain("color.gold.300");
  });

  it("defaults density per brand", () => {
    expect(brandDefaults).toEqual({
      finch: { density: "compact" },
      sparrow: { density: "comfortable" },
      hummingbird: { density: "comfortable" },
      chickadee: { density: "comfortable" },
    });
    expect(resolve("size.control.md", { brand: "finch" })).toBe(
      values["finch/light/compact"]["size.control.md"],
    );
  });

  it("gives tailwind-merge property-specific color groups and separate scales", () => {
    expect(tailwindMergeConfig.classGroups["text-color"]?.[0].text).toContain("muted");
    expect(tailwindMergeConfig.classGroups["bg-color"]?.[0].bg).toContain("raised");
    expect(tailwindMergeConfig.theme.color).not.toContain("raised");
    expect(tailwindMergeConfig.theme.text).toContain("body");
    expect(tailwindMergeConfig.theme.shadow).toContain("raised");
  });

  it("builds var() references", () => {
    expect(cssVar("color.chart.categorical.1")).toBe("var(--pl-color-chart-categorical-1)");
  });
});

describe("plumage.css scoping", () => {
  it("declares each layer under its own attribute", () => {
    for (const brand of brands) expect(css).toContain(`[data-brand="${brand}"] {`);
    expect(css).toContain(':root, [data-brand]:not([data-theme]), [data-theme="light"] {');
    expect(css).toContain('[data-theme="dark"] {');
    expect(css).toContain('[data-density="compact"] {');
    expect(css).toContain(":root, [data-brand], [data-theme], [data-density] {");
  });

  it("keeps aliases as var() so nested scopes re-resolve", () => {
    expect(css).toContain("--pl-color-bg-surface: var(--pl-brand-color-neutral-0);");
    expect(css).toContain("--pl-brand-color-accent-solid: var(--pl-color-gold-300);");
  });

  it("zeroes motion only under prefers-reduced-motion", () => {
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*--pl-motion-duration-fast: 0ms/);
    // Regression: a reduced-motion transform once leaked into finch's own brand rule.
    for (const brand of brands) {
      const rule =
        new RegExp(`\\[data-brand="${brand}"\\] \\{([\\s\\S]*?)\\n\\}`).exec(css)?.[1] ?? "";
      expect(rule, brand).toMatch(/--pl-motion-duration-fast: var\(--pl-duration-\d+\);/);
    }
  });

  it("declares every brand-layer token in every brand rule", () => {
    for (const brand of brands) {
      const rule =
        new RegExp(`\\[data-brand="${brand}"\\] \\{([\\s\\S]*?)\\n\\}`).exec(css)?.[1] ?? "";
      for (const id of source.idsByLayer.brand) {
        expect(rule, `${brand} missing ${id}`).toContain(`--pl-${id.replaceAll(".", "-")}:`);
      }
    }
  });
});

describe("figma export", () => {
  it("writes one file per collection and mode, with identical variable sets per collection", () => {
    const collect = (o: Record<string, unknown>, path: string[] = []): string[] =>
      Object.entries(o).flatMap(([k, v]) =>
        v && typeof v === "object" && "$value" in v
          ? [[...path, k].join(".")]
          : collect(v as Record<string, unknown>, [...path, k]),
      );
    const ids = (path: string) =>
      collect(JSON.parse(dist(`figma/${path}`)) as Record<string, unknown>).sort();
    for (const brand of brands) {
      expect(ids(`Brand/${brand}.tokens.json`)).toEqual(ids("Brand/finch.tokens.json"));
    }
    expect(ids("Mode/light.tokens.json")).toEqual(ids("Mode/dark.tokens.json"));
    expect(ids("Density/compact.tokens.json")).toEqual(ids("Density/comfortable.tokens.json"));
    expect(ids("Primitives/Value.tokens.json")).toContain("color.gold.300");
  });
});
