// Reads the DTCG resolver and every file it references, and records which
// layer each token is declared in. The CSS permutations, the Tailwind theme,
// the TypeScript exports, the Figma collections, and the checks all derive
// from this one map, so adding a token never means editing a list by hand.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SRC_DIR = fileURLToPath(new URL("../src/", import.meta.url));
export const RESOLVER_PATH = resolve(SRC_DIR, "plumage.resolver.json");

export type Modifier = "brand" | "mode" | "density";
export type Layer = "primitive" | Modifier | "component";
export const MODIFIERS: readonly Modifier[] = ["brand", "mode", "density"];

/** HTML attribute that scopes each modifier. */
export const ATTRIBUTE: Record<Modifier, string> = {
  brand: "data-brand",
  mode: "data-theme",
  density: "data-density",
};

/** Figma variable collection for each layer. Components join the collection of what they alias. */
export const FIGMA_COLLECTION: Record<Exclude<Layer, "component">, string> = {
  primitive: "Primitives",
  brand: "Brand",
  mode: "Mode",
  density: "Density",
};

interface RawToken {
  $value: unknown;
  $type?: string;
  $description?: string;
}

interface Resolver {
  sets: Record<string, { sources: { $ref: string }[] }>;
  modifiers: Record<
    Modifier,
    {
      contexts: Record<string, { $ref: string }[]>;
      default?: string;
      $extensions?: {
        "dev.plumage"?: {
          brands?: Record<string, { displayName?: string; defaultDensity?: string }>;
        };
      };
    }
  >;
}

export interface SourceToken {
  id: string;
  layer: Layer;
  /** Raw `$value` per context ("." for sets), straight from the source JSON. */
  raw: Record<string, unknown>;
  description?: string;
}

export interface SourceMap {
  tokens: Map<string, SourceToken>;
  idsByLayer: Record<Layer, string[]>;
  contexts: Record<Modifier, string[]>;
  defaults: Record<Modifier, string>;
  /** Per-brand metadata, from $extensions["dev.plumage"].brands on the brand modifier. */
  brandDefaults: Record<string, { density: string }>;
  brandNames: Record<string, string>;
}

function walk(
  node: Record<string, unknown>,
  path: string[],
  visit: (id: string, t: RawToken) => void,
) {
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$") || child === null || typeof child !== "object") continue;
    const next = [...path, key];
    if ("$value" in child) visit(next.join("."), child);
    else walk(child as Record<string, unknown>, next, visit);
  }
}

function readTokens(ref: string): [string, RawToken][] {
  const file = resolve(dirname(RESOLVER_PATH), ref);
  const json = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
  const out: [string, RawToken][] = [];
  walk(json, [], (id, t) => out.push([id, t]));
  return out;
}

export function loadSource(): SourceMap {
  const resolver = JSON.parse(readFileSync(RESOLVER_PATH, "utf8")) as Resolver;
  const tokens = new Map<string, SourceToken>();
  const idsByLayer: Record<Layer, string[]> = {
    primitive: [],
    brand: [],
    mode: [],
    density: [],
    component: [],
  };

  const add = (layer: Layer, context: string, id: string, t: RawToken) => {
    const existing = tokens.get(id);
    if (existing && existing.layer !== layer) {
      throw new Error(`Token ${id} is declared in both ${existing.layer} and ${layer}`);
    }
    const token = existing ?? { id, layer, raw: {}, description: t.$description };
    token.raw[context] = t.$value;
    if (!existing) {
      tokens.set(id, token);
      idsByLayer[layer].push(id);
    }
  };

  for (const [setName, layer] of [
    ["primitives", "primitive"],
    ["components", "component"],
  ] as const) {
    for (const { $ref } of resolver.sets[setName]?.sources ?? []) {
      for (const [id, t] of readTokens($ref)) add(layer, ".", id, t);
    }
  }

  const contexts = {} as Record<Modifier, string[]>;
  const defaults = {} as Record<Modifier, string>;
  for (const modifier of MODIFIERS) {
    const def = resolver.modifiers[modifier];
    contexts[modifier] = Object.keys(def.contexts);
    defaults[modifier] = def.default ?? contexts[modifier][0]!;
    const perContext = new Map<string, Set<string>>();
    for (const [context, refs] of Object.entries(def.contexts)) {
      const ids = new Set<string>();
      for (const { $ref } of refs) {
        for (const [id, t] of readTokens($ref)) {
          add(modifier, context, id, t);
          ids.add(id);
        }
      }
      perContext.set(context, ids);
    }
    // Every context of a modifier must declare the same tokens, or a scope
    // could silently inherit a value from an outer scope.
    const [first, ...rest] = [...perContext.entries()];
    for (const [context, ids] of rest) {
      const missing = [...first![1]].filter((id) => !ids.has(id));
      const extra = [...ids].filter((id) => !first![1].has(id));
      if (missing.length || extra.length) {
        throw new Error(
          `${modifier}/${context} does not match ${modifier}/${first![0]}. ` +
            `Missing: ${missing.join(", ") || "none"}. Extra: ${extra.join(", ") || "none"}.`,
        );
      }
    }
  }

  const declared = resolver.modifiers.brand.$extensions?.["dev.plumage"]?.brands ?? {};
  const brandNames = Object.fromEntries(
    contexts.brand.map((brand) => [brand, declared[brand]?.displayName ?? brand]),
  );
  const brandDefaults = Object.fromEntries(
    contexts.brand.map((brand) => {
      const density = declared[brand]?.defaultDensity ?? defaults.density;
      if (!contexts.density.includes(density)) {
        throw new Error(`Brand ${brand} declares unknown default density "${density}"`);
      }
      return [brand, { density }];
    }),
  );

  return { tokens, idsByLayer, contexts, defaults, brandDefaults, brandNames };
}

/** Is the token part of the public surface (semantic or component tier)? */
export function isPublic(token: SourceToken): boolean {
  return token.layer !== "primitive" && !token.id.startsWith("brand.");
}

export function tierOf(
  token: SourceToken,
): "primitive" | "brand-palette" | "semantic" | "component" {
  if (token.layer === "primitive") return "primitive";
  if (token.layer === "component") return "component";
  return token.id.startsWith("brand.") ? "brand-palette" : "semantic";
}

/** Alias target of a raw value like "{color.gold.300}", or undefined. */
export function aliasTarget(raw: unknown): string | undefined {
  return typeof raw === "string" && /^\{[^}]+\}$/.test(raw) ? raw.slice(1, -1) : undefined;
}
