// Figures in tables and stats line up only if the numeric font has tabular
// figures (the OpenType tnum feature). Each font primitive declares whether it
// does; every brand's numeric role must point at one that does. When a brand's
// chosen font does not, point font.family.numeric at font.family.jetbrains-mono,
// the monospace fallback, whose figures are always the same width.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  JSON.parse(readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8")) as {
    font: { family: Record<string, unknown> };
  };

interface Family {
  $extensions?: { "dev.plumage"?: { tabularFigures?: boolean } };
}
const families = read("primitives/typography.tokens.json").font.family as Record<string, Family>;
const tabular = (name: string) => families[name]?.$extensions?.["dev.plumage"]?.tabularFigures;

describe("tabular figures", () => {
  it("is declared for every font primitive", () => {
    const declared = Object.keys(families)
      .filter((key) => !key.startsWith("$"))
      .map((key) => [key, typeof tabular(key)]);
    expect(declared.filter(([, type]) => type !== "boolean")).toEqual([]);
  });

  it("keeps the monospace fallback tabular", () => {
    expect(tabular("jetbrains-mono")).toBe(true);
  });

  it.each(["finch", "sparrow", "hummingbird", "chickadee"])(
    "gives the %s brand a numeric font with tabular figures",
    (brand) => {
      const role = (
        read(`brands/${brand}.tokens.json`).font.family as Record<string, { $value: string }>
      ).numeric;
      const target = /^\{font\.family\.([\w-]+)\}$/.exec(role?.$value ?? "")?.[1];
      expect(target && tabular(target)).toBe(true);
    },
  );
});
