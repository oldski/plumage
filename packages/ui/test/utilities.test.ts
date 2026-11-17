// @vitest-environment node
// Guards the rule that components style themselves only with Plumage tokens.
// The guard itself lives in testing/class-guard.ts so apps can run it too.
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { checkClasses, sourceFiles, type ClassReport } from "../testing/class-guard";

const PACKAGE = fileURLToPath(new URL("..", import.meta.url));

let report: ClassReport;

beforeAll(async () => {
  report = await checkClasses({
    base: PACKAGE,
    css: `@import "tailwindcss";
     @import "@plumage/tokens/css";
     @import "@plumage/tokens/tailwind.css";
     @import "./src/styles.css";`,
    files: sourceFiles(join(PACKAGE, "src")),
  });
});

describe("base styles", () => {
  it("never set font-size on <html>, which would redefine 1rem for every token", async () => {
    const { compile } = await import("@tailwindcss/node");
    const compiler = await compile(
      `@import "tailwindcss";\n@import "@plumage/tokens/css";\n@import "./src/styles.css";`,
      { base: PACKAGE, onDependency: () => undefined },
    );
    const css = compiler.build([]);
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
      selector: selector!.trim(),
      body: body!,
    }));
    const sizedRoots = rules.filter(
      ({ selector, body }) =>
        body.includes("font-size:") &&
        selector.split(",").some((part) => /^\s*(:root|html|\[data-brand\])\s*$/.test(part)),
    );
    expect(sizedRoots).toEqual([]);
  });
});

describe("component classes", () => {
  it("scans every component", () => {
    expect([...report.candidates.keys()].filter((f) => f.includes("components/"))).toHaveLength(26);
  });

  it("compile against the Plumage theme (no typos, no raw Tailwind scales)", () => {
    expect(report.unknown).toEqual([]);
  });

  it("use only variables inside arbitrary values", () => {
    expect(report.literals).toEqual([]);
  });
});
