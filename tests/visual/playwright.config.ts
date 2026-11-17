// Visual regression for Plumage: every story in the built Storybook, in every
// brand, mode, and density, compared with the committed baselines in
// baselines/. `pnpm visual` builds Storybook first; `pnpm visual:update`
// rewrites the baselines after an intended change. Baselines are macOS
// Chromium renders, so run it there.
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const here = fileURLToPath(new URL(".", import.meta.url));
const PORT = 6106;

export default defineConfig({
  testDir: ".",
  testMatch: "visual.spec.ts",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 6,
  forbidOnly: Boolean(process.env.CI),
  reporter: [["list"]],
  outputDir: join(here, ".tmp/results"),
  snapshotPathTemplate: "{testDir}/baselines/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      // Antialiasing can differ by a few pixels between runs on one machine.
      maxDiffPixelRatio: 0.002,
    },
  },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://127.0.0.1:${String(PORT)}`,
    viewport: { width: 800, height: 600 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    colorScheme: "light",
  },
  webServer: {
    command: "node serve.mjs",
    url: `http://127.0.0.1:${String(PORT)}`,
    cwd: here,
    reuseExistingServer: !process.env.CI,
  },
});
