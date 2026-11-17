// One screenshot per story, brand, mode, and density. The list of stories is
// read from the built Storybook's index.json, so a new story is covered as
// soon as it exists (and needs a baseline: run `pnpm visual:update`).
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

interface Entry {
  id: string;
  type: "story" | "docs";
}

const index = JSON.parse(
  readFileSync(new URL("../../apps/docs/storybook-static/index.json", import.meta.url), "utf8"),
) as { entries: Record<string, Entry> };

const stories = Object.values(index.entries)
  .filter((entry) => entry.type === "story")
  .map((entry) => entry.id)
  .sort();

const BRANDS = ["finch", "sparrow", "hummingbird", "chickadee"] as const;
const MODES = ["light", "dark"] as const;
const DENSITIES = ["compact", "comfortable"] as const;

/**
 * Overlay stories whose play function opens the overlay and closes it again.
 * Their screenshot is taken open, so the overlay itself is covered: the
 * trigger to press, and the role of what it opens.
 */
const OPEN_FOR_SCREENSHOT: Record<
  string,
  { name: string; role: "button" | "combobox"; opens: string }
> = {
  "primitives-dialog--default": { role: "button", name: "Rename account", opens: "dialog" },
  "primitives-sheet--right": { role: "button", name: "Display options", opens: "dialog" },
  "primitives-sheet--left": { role: "button", name: "Display options", opens: "dialog" },
  "primitives-sheet--bottom": { role: "button", name: "Display options", opens: "dialog" },
  "primitives-dropdownmenu--default": { role: "button", name: "Account", opens: "menu" },
  "primitives-select--default": { role: "combobox", name: "Model", opens: "listbox" },
  "primitives-combobox--default": { role: "combobox", name: "Category", opens: "listbox" },
  "primitives-datepicker--default": { role: "button", name: "Target date", opens: "grid" },
};

async function openOverlay(page: Page, id: string) {
  const open = OPEN_FOR_SCREENSHOT[id];
  if (!open) return;
  await page.getByRole(open.role, { name: open.name }).first().click();
  await expect(page.getByRole(open.opens as "dialog").first()).toBeVisible();
}

// Calendars and "today" would otherwise change the pictures every day.
const FIXED_NOW = new Date("2026-10-30T12:00:00");

for (const id of stories) {
  test.describe(id, () => {
    for (const brand of BRANDS) {
      for (const mode of MODES) {
        for (const density of DENSITIES) {
          const combination = `${brand}-${mode}-${density}`;
          test(combination, async ({ page }) => {
            await page.clock.setFixedTime(FIXED_NOW);
            // The docs site loads brand typefaces from Fontshare. The suite does not:
            // baselines must not need the network or move when Fontshare changes a file.
            await page.route(/^https:\/\/(api|cdn)\.fontshare\.com\//, (route) => route.abort());
            const globals = `brand:${brand};mode:${mode};density:${density}`;
            await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=${globals}`);
            // Rendered, and any play function (opening a dialog, typing) done.
            await page.waitForFunction(() => {
              const preview = (
                window as unknown as {
                  __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } };
                }
              ).__STORYBOOK_PREVIEW__;
              const phase = preview?.currentRender?.phase;
              return phase === "finished" || phase === "errored" || phase === "aborted";
            });
            await openOverlay(page, id);
            await page.evaluate(() => document.fonts.ready);
            await expect(page).toHaveScreenshot(`${id}-${combination}.png`, { fullPage: true });
          });
        }
      }
    }
  });
}
