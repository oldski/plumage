// Writes the shadcn registry for Plumage from @plumage/ui's source, then
// `shadcn build` turns it into public/r/*.json, which Storybook serves at /r.
//
// One item per component and pattern, one for PlumageProvider, and a base
// item, "plumage", that every other item needs: the built tokens (CSS, the
// Tailwind theme, and their small runtime), the class merger, formatting,
// chart helpers, and the motion styles. Each file keeps its place under
// components/plumage/ in the project it is added to, so the relative imports
// between Plumage files work unchanged; imports of @plumage/tokens point at
// the copied tokens instead, so the registry needs no unpublished package.
// Fonts are named by the tokens, never bundled.
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const docs = fileURLToPath(new URL("..", import.meta.url));
const src = join(docs, "../../packages/ui/src");
const tokensDist = join(docs, "../../packages/tokens/dist");
/** The staging folder shadcn builds from; mirrors the target layout under plumage/. */
const out = join(docs, ".registry");
const stage = join(out, "plumage");
const manifest = JSON.parse(readFileSync(join(src, "../package.json"), "utf8")) as {
  dependencies: Record<string, string>;
};

/** Where every Plumage file lands in the project it is added to. */
const TARGET_ROOT = "components/plumage";
const BASE = "plumage";
/** Imported by the project itself, never added as a dependency. */
const PEERS = new Set(["react", "react-dom"]);

type ItemType = "registry:ui" | "registry:component" | "registry:lib";

interface RegistryFile {
  path: string;
  type: ItemType | "registry:file";
  target: string;
}

interface RegistryItem {
  name: string;
  type: ItemType;
  title: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
}

const isSource = (name: string) =>
  /\.tsx?$/.test(name) && !/\.(stories|test)\.tsx?$/.test(name) && !name.endsWith(".d.ts");

const titleOf = (name: string) =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

/** The package an import names: "radix-ui", "@tanstack/react-table". */
function packageOf(specifier: string): string {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? `${parts[0] ?? ""}/${parts[1] ?? ""}` : (parts[0] ?? "");
}

function withVersion(name: string): string {
  const range = manifest.dependencies[name];
  if (!range) throw new Error(`${name} is imported by @plumage/ui but not in its dependencies.`);
  return `${name}@${range}`;
}

/** The first sentence or two of a story's component description: what it is for. */
function describe(folder: string, name: string): string {
  try {
    const text = readFileSync(join(folder, `${name}.stories.tsx`), "utf8");
    const match = /component:\s*`\s*\n?([^`]+?)(?:\n\n|`)/.exec(text);
    const first = match?.[1]?.replace(/\s+/g, " ").trim();
    if (first) return first;
  } catch {
    // No story; fall back below.
  }
  return `Plumage ${titleOf(name)}.`;
}

/** A path under src as it is placed in a project, under components/plumage/. */
const placed = (pathInSrc: string) => `${TARGET_ROOT}/${pathInSrc}`;

/**
 * Copies a source file into the staging folder, pointing @plumage/tokens at
 * the copied tokens, and returns its registry entry.
 */
function stageSource(file: string, type: RegistryFile["type"]): RegistryFile {
  const pathInSrc = relative(src, file);
  const tokens = relative(dirname(pathInSrc), "tokens") || ".";
  const text = readFileSync(file, "utf8").replaceAll(
    'from "@plumage/tokens"',
    `from "${tokens.startsWith(".") ? tokens : `./${tokens}`}"`,
  );
  const staged = join(stage, pathInSrc);
  mkdirSync(dirname(staged), { recursive: true });
  writeFileSync(staged, text);
  return { path: relative(out, staged), type, target: placed(pathInSrc) };
}

/** Packages and other items a set of source files imports. */
function importsOf(files: string[], self: string) {
  const dependencies = new Set<string>();
  const items = new Set<string>();
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const [, specifier = ""] of text.matchAll(/from\s+"([^"]+)"/g)) {
      if (specifier === "@plumage/tokens") {
        items.add(BASE);
      } else if (specifier.startsWith(".")) {
        const [area, name] = relative(src, join(dirname(file), specifier)).split("/");
        if (area === "lib") items.add(BASE);
        else if (area === "provider") items.add("plumage-provider");
        else if (name && name !== self) items.add(name);
      } else if (!PEERS.has(packageOf(specifier))) {
        dependencies.add(withVersion(packageOf(specifier)));
      }
    }
  }
  items.delete(self);
  return { dependencies: [...dependencies].sort(), items: [...items].sort() };
}

function item(
  name: string,
  type: ItemType,
  files: string[],
  description: string,
  title = titleOf(name),
): RegistryItem {
  const { dependencies, items } = importsOf(files, name);
  return {
    name,
    type,
    title,
    description,
    dependencies,
    // Namespaced, so a project resolves them from the Plumage registry.
    registryDependencies: items.map((other) => `@plumage/${other}`),
    files: files.map((file) => stageSource(file, type)),
  };
}

function folderItem(area: "components" | "patterns", name: string): RegistryItem {
  const folder = join(src, area, name);
  const files = readdirSync(folder)
    .filter(isSource)
    .map((file) => join(folder, file));
  return item(
    name,
    area === "components" ? "registry:ui" : "registry:component",
    files,
    describe(folder, name),
  );
}

rmSync(out, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });

// The base item: the library files, the built tokens, and the motion styles.
const libFiles = readdirSync(join(src, "lib"))
  .filter(isSource)
  .map((file) => join(src, "lib", file));
const baseItem = item(
  BASE,
  "registry:lib",
  libFiles,
  "What every Plumage item needs: the built tokens (CSS custom properties, the Tailwind theme, and their runtime), the token-aware class merger (cn), number formatting with a true minus sign, chart helpers, and the motion styles.",
  "Plumage",
);

const stageAsIs = (from: string, pathInSrc: string): RegistryFile => {
  const staged = join(stage, pathInSrc);
  mkdirSync(dirname(staged), { recursive: true });
  copyFileSync(from, staged);
  return { path: relative(out, staged), type: "registry:file", target: placed(pathInSrc) };
};
for (const file of ["index.js", "index.d.ts", "plumage.css", "tailwind.css"]) {
  baseItem.files.push(stageAsIs(join(tokensDist, file), `tokens/${file}`));
}

// The package's own stylesheet header and @source line point at the package;
// in a project, Tailwind already scans the copied components.
const styles = readFileSync(join(src, "styles.css"), "utf8");
const motion = join(stage, "plumage.css");
writeFileSync(
  motion,
  `/*
 * Plumage's motion styles, from the Plumage registry. Import them in your
 * global CSS, after Tailwind and the tokens (paths from that CSS file):
 *
 *   @import "tailwindcss";
 *   @import "./${TARGET_ROOT}/tokens/plumage.css";
 *   @import "./${TARGET_ROOT}/tokens/tailwind.css";
 *   @import "./${TARGET_ROOT}/plumage.css";
 *
 * Everything here is built from tokens, so reduced motion and each brand's
 * personality apply automatically.
 */

${styles.slice(styles.indexOf("@theme"))}`,
);
baseItem.files.push({
  path: relative(out, motion),
  type: "registry:file",
  target: placed("plumage.css"),
});

const providerFile = join(src, "provider", "plumage-provider.tsx");
const providerItem = item(
  "plumage-provider",
  "registry:component",
  [providerFile],
  describe(join(src, "provider"), "plumage-provider"),
  "PlumageProvider",
);

const folders = (area: "components" | "patterns") =>
  readdirSync(join(src, area), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => folderItem(area, entry.name));

const items = [baseItem, providerItem, ...folders("components"), ...folders("patterns")];

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "plumage",
  // The docs site serves the registry at /r. PLUMAGE_REGISTRY_ORIGIN sets the public address
  // at build time; without it the registry points at the local Storybook.
  homepage: process.env.PLUMAGE_REGISTRY_ORIGIN ?? "http://127.0.0.1:6006",
  items,
};
writeFileSync(join(out, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Plumage registry: ${String(items.length)} items staged in .registry/`);
