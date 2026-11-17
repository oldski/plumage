import { describe, expect, it } from "vitest";
import { composite, contrast, deltaE } from "../scripts/lib/color.ts";
import { adjacentPairs, checkPalette } from "../scripts/lib/dataviz.ts";

describe("contrast", () => {
  it("matches WCAG reference values", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrast("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });

  it("composites translucent colors before measuring", () => {
    expect(composite("#00000080", "#ffffff")).toBe("#7f7f7f");
  });
});

describe("CVD simulation", () => {
  // Reference numbers from an independent implementation that applies the
  // Machado 2009 matrices in linear RGB. culori's filterDeficiency* applies
  // them to gamma-encoded sRGB and reports about 9.6 for the first pair, which
  // would wrongly pass a red/green neighbor. This pins the correct model.
  it.each([
    ["#1daf49", "#e3343b", "deutan", 4.7],
    ["#009f36", "#a90017", "deutan", 13.6],
  ] as const)("%s vs %s under %s is dE %d", (a, b, kind, expected) => {
    expect(deltaE(a, b, kind)).toBeCloseTo(expected, 1);
  });

  it("measures normal vision without simulation", () => {
    expect(deltaE("#ec4998", "#a66d00")).toBeCloseTo(23.4, 1);
  });

  it("flags red next to green as a CVD failure", () => {
    const report = checkPalette(["#1daf49", "#e3343b"], "dark", "#1d1f23", [[0, 1]]);
    expect(report.pairs[0]?.cvd).toBe("fail");
  });
});

describe("adjacentPairs", () => {
  it("includes the wrap-around pair for donuts", () => {
    expect(adjacentPairs(4)).toEqual([
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ]);
  });
});
