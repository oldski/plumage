import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../../../packages/ui/src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  // public/r is the shadcn registry (pnpm registry), served at /r/<item>.json.
  staticDirs: ["../public"],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      // Prop tables come from the component package's own TypeScript program.
      tsconfigPath: fileURLToPath(new URL("../../../packages/ui/tsconfig.json", import.meta.url)),
      // Globs resolve from this app's root, so point them at the UI package.
      include: ["../../packages/ui/src/**/*.tsx"],
      exclude: ["**/*.stories.tsx", "**/*.test.tsx"],
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      // Show Plumage and Radix props; hide the hundreds of inherited DOM attributes.
      propFilter: (prop) =>
        !prop.parent ||
        !prop.parent.fileName.includes("node_modules") ||
        prop.parent.fileName.includes("@radix-ui"),
    },
  },
  async viteFinal(viteConfig) {
    const [{ default: tailwindcss }, { mergeConfig }] = await Promise.all([
      import("@tailwindcss/vite"),
      import("vite"),
    ]);
    return mergeConfig(viteConfig, { plugins: [tailwindcss()] });
  },
};

export default config;
