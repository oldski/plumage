// @vitest-environment node
import { describe, expect, it } from "vitest";
import { cn } from "../src/lib/cn";

describe("cn", () => {
  it("keeps a text color and a text size together", () => {
    expect(cn("text-muted", "text-body")).toBe("text-muted text-body");
  });

  it("lets a later Plumage utility win in the same group", () => {
    expect(cn("text-muted", "text-default")).toBe("text-default");
    expect(cn("h-control-md", "h-control-sm")).toBe("h-control-sm");
    expect(cn("rounded-control", "rounded-pill")).toBe("rounded-pill");
    expect(cn("bg-surface", "bg-raised")).toBe("bg-raised");
    expect(cn("px-control-md", "px-control-sm")).toBe("px-control-sm");
    expect(cn("shadow-raised", "shadow-modal")).toBe("shadow-modal");
  });

  it("does not confuse spacing names across properties", () => {
    expect(cn("p-card", "px-control-md")).toBe("p-card px-control-md");
  });
});
