# apps/docs

The Plumage documentation site, built with Storybook 10, and the shadcn registry it serves.

```bash
pnpm --filter @plumage/docs dev
```

- **Guides:** Principles, Installing with shadcn, Adding a brand, Accessibility, the Figma
  workflow, and Contributing (`src/*.mdx`).
- **Foundations:** the Token reference, with swatches and contrast ratios for every brand,
  mode, and density, and Typography. Both are computed from `@plumage/tokens`' build
  (`src/blocks/`).
- **Primitives and Patterns:** the stories, which live next to their components in
  `packages/ui`.

The toolbar switches brand, mode, and density, and "All brands and modes" renders a story in
every combination at once. The Accessibility panel runs axe on the whole page (overlays
included); the Interactions panel shows each story's play function, the same code CI runs.

## The registry

```bash
pnpm --filter @plumage/docs registry
```

`scripts/build-registry.ts` stages `@plumage/ui`'s source with its dependencies worked out
from the imports, and `shadcn build` writes `public/r/<item>.json`. The site serves them at
`/r` (`dev` and `build` rebuild the registry first).
The registry's address comes from the `PLUMAGE_REGISTRY_ORIGIN` environment variable, read
when the registry is built; it defaults to `http://127.0.0.1:6006`. The hosted site sets it
to `https://plumage.oldskilabs.com`. See the _Installing with shadcn_ page
and [ADR 0030](../../docs/adr/0030-shadcn-registry-and-docs-pages.md).
