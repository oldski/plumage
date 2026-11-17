import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/space-grotesk";
import "./preview.css";

import { brandNames, brands, modes, type Brand, type Density, type Mode } from "@plumage/tokens";
import { PlumageProvider } from "@plumage/ui";
import type { Decorator, Preview } from "@storybook/react-vite";

const title = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

interface PlumageGlobals {
  brand: Brand;
  mode: Mode;
  density: Density | "brand";
  view: "single" | "matrix";
}

/**
 * Wraps every story in a PlumageProvider driven by the toolbar.
 *
 * - Canvas: root scope, so overlays that portal to <body> are themed too.
 * - Docs pages: a local scope per story, so Storybook's own documentation
 *   text keeps its colors in dark mode.
 * - Matrix view: the story in every brand and mode side by side, each in its
 *   own local scope (overlays portal into their cell).
 */
const withPlumage: Decorator = (Story, context) => {
  const globals = context.globals as PlumageGlobals;
  const density = globals.density === "brand" ? undefined : globals.density;

  if (globals.view === "matrix") {
    return (
      <div className="grid gap-px bg-(--pl-color-border-default) sm:grid-cols-2">
        {brands.flatMap((brand) =>
          modes.map((mode) => (
            <PlumageProvider
              key={`${brand}-${mode}`}
              brand={brand}
              mode={mode}
              density={density}
              scope="local"
              className="flex flex-col gap-md p-inset-lg"
            >
              <p className="text-caption text-subtle">
                {brandNames[brand]} / {title(mode)}
              </p>
              {/* storyCanvas() in play functions targets the first copy. */}
              <div data-story-copy className="contents">
                <Story />
              </div>
            </PlumageProvider>
          )),
        )}
      </div>
    );
  }

  if (context.viewMode === "docs") {
    return (
      <PlumageProvider
        brand={globals.brand}
        mode={globals.mode}
        density={density}
        scope="local"
        className="p-inset-lg"
      >
        <Story />
      </PlumageProvider>
    );
  }

  return (
    <PlumageProvider brand={globals.brand} mode={globals.mode} density={density}>
      <Story />
    </PlumageProvider>
  );
};

const preview: Preview = {
  decorators: [withPlumage],
  globalTypes: {
    brand: {
      description: "Plumage brand",
      toolbar: {
        title: "Brand",
        icon: "paintbrush",
        items: brands.map((value) => ({ value, title: brandNames[value] })),
        dynamicTitle: true,
      },
    },
    mode: {
      description: "Light or dark mode",
      toolbar: {
        title: "Mode",
        icon: "sun",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
    density: {
      description: "Spacing and sizing scale",
      toolbar: {
        title: "Density",
        icon: "expand",
        items: [
          { value: "brand", title: "Brand default" },
          { value: "compact", title: "Compact" },
          { value: "comfortable", title: "Comfortable" },
        ],
        dynamicTitle: true,
      },
    },
    view: {
      description: "One combination, or every brand and mode at once",
      toolbar: {
        title: "View",
        icon: "grid",
        items: [
          { value: "single", title: "Single" },
          { value: "matrix", title: "All brands and modes" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { brand: "finch", mode: "light", density: "brand", view: "single" },
  parameters: {
    layout: "padded",
    backgrounds: { disable: true },
    controls: { expanded: true, sort: "requiredFirst" },
    // Check the whole document, so dialogs, menus, and toasts portaled out of
    // the story root are included.
    a11y: { context: "body" },
    options: {
      storySort: {
        order: [
          "Introduction",
          "Examples",
          ["About", "*"],
          "Guides",
          [
            "Principles",
            "Installing with shadcn",
            "Adding a brand",
            "Accessibility",
            "Figma workflow",
            "Contributing",
          ],
          "Foundations",
          ["Token reference", "Typography", "*"],
          "Primitives",
          "Patterns",
          "*",
        ],
      },
    },
  },
};

export default preview;
