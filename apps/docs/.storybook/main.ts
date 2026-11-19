import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

// Google Tag Manager, for the public site only. PLUMAGE_GTM_ID is set by the
// public repository's Vercel build; without it (local runs, tests, the visual
// suite) nothing is added and no request leaves the page.
const gtmId = process.env.PLUMAGE_GTM_ID;
if (gtmId !== undefined && !/^GTM-[A-Z0-9]+$/.test(gtmId)) {
  throw new Error(`PLUMAGE_GTM_ID is not a container ID: ${gtmId}`);
}

/**
 * The container snippet. Storybook is two documents, the manager and the
 * preview frame inside it, so the preview loads the container only when it is
 * the top window (a full-screen iframe.html link) and a visit counts once.
 */
function gtmSnippet({ topWindowOnly }: { topWindowOnly: boolean }): string {
  const load =
    "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});" +
    "var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;" +
    "j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);" +
    `})(window,document,'script','dataLayer','${gtmId}');`;
  const body = topWindowOnly ? `if(window.self===window.top){${load}}` : load;
  return `\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}${body}</script>\n`;
}

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../../../packages/ui/src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  // public/r is the shadcn registry (pnpm registry), served at /r/<item>.json.
  staticDirs: ["../public"],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
  managerHead: (head) => (gtmId ? `${head ?? ""}${gtmSnippet({ topWindowOnly: false })}` : head),
  previewHead: (head) => (gtmId ? `${head ?? ""}${gtmSnippet({ topWindowOnly: true })}` : head),
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
