import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "test/**/*.test.{ts,tsx}"],
    testTimeout: 15000,
    // The persistent transform cache keys a file by its own contents, so the
    // import.meta.glob in test/stories.test.tsx would keep an old list of
    // story files and silently skip new ones.
    fsModuleCache: false,
  },
});
