import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Checkbox } from "../src/components/checkbox/checkbox";
import { Label } from "../src/components/label/label";
import { Switch } from "../src/components/switch/switch";

// Uses the standalone user-event: Storybook's bundled copy builds events with
// Vitest's global window proxy, which jsdom rejects when a label forwards a click.
describe("Label", () => {
  it.each([
    ["checkbox", Checkbox],
    ["switch", Switch],
  ] as const)("toggles its %s when clicked", async (role, Control) => {
    render(
      <div>
        <Control id="control" />
        <Label htmlFor="control">Show cost basis</Label>
      </div>,
    );
    await userEvent.click(screen.getByText("Show cost basis"));
    expect(screen.getByRole(role, { name: "Show cost basis" })).toBeChecked();
  });
});
