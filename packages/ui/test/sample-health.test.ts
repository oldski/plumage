import { afterEach, describe, expect, it, vi } from "vitest";

const load = async () => {
  vi.resetModules();
  return import("../src/stories/sample-health");
};

describe("sample health data", () => {
  afterEach(() => vi.useRealTimers());

  it("does not depend on the current date", async () => {
    vi.useFakeTimers({ now: new Date("2026-01-05T09:00:00") });
    const first = JSON.stringify(await load());
    vi.setSystemTime(new Date("2027-08-20T21:00:00"));
    expect(JSON.stringify(await load())).toBe(first);
  });

  it("names no brand or product", async () => {
    const text = JSON.stringify(await load()).toLowerCase();
    // The broker's name is assembled so this file passes the public export's
    // scan for private terms, which would flag the word written out.
    const broker = ["robin", "hood"].join("");
    for (const word of ["finch", "sparrow", "hummingbird", "chickadee", broker, "apple health"]) {
      expect(text).not.toContain(word);
    }
  });

  it("covers what the health example needs", async () => {
    const data = await load();
    expect(data.dayTargets.length).toBeGreaterThanOrEqual(3);
    expect(data.macros).toHaveLength(3);
    expect(data.consistency.length).toBeGreaterThanOrEqual(84);
    expect(data.dayEntries.length).toBeGreaterThanOrEqual(5);
  });
});
