# 0030. The shadcn registry, and the docs site pages

- **Status:** Accepted
- **Date:** 2026-10-30
- **Scope:** Plumage, apps/docs

## Context

The spec puts a shadcn registry in `apps/docs`, beside Storybook. It also asks for these
docs pages:

- Introduction
- Principles
- Token reference, "rendered from the token build, including color swatches with
  contrast ratios"
- Typography
- Theming guide
- Accessibility standards
- Figma workflow
- Contributing

Only Introduction and the theming guide ("Adding a brand") existed.

Components in `@plumage/ui` import each other relatively (`../../lib/cn`,
`../popover/popover`), and three files import `@plumage/tokens`. Checking npm while
building this showed the `@plumage` scope already belongs to someone else: it holds
`@plumage/fastconfig`. So `@plumage/tokens` cannot be published under that name unless
the scope is ours.

## Options considered

1. **Items depend on the npm package `@plumage/tokens`.** This is the usual shape, but the
   package is unpublished and its scope is taken, so adding any item would fail to
   install.
2. **The registry carries the built tokens.** A base item ships the generated CSS, the
   Tailwind theme, and the small runtime (`index.js` with its types). The three imports of
   `@plumage/tokens` are rewritten to that copy. Nothing unpublished is needed.

## Decision

Option 2.

**The registry** is generated from `@plumage/ui`'s source by
`apps/docs/scripts/build-registry.ts`, then built by the shadcn CLI (`shadcn build`, pinned
at 4.23.0) into `public/r/<item>.json`. Storybook serves `public/` (`staticDirs`), so the
docs site carries the registry at `/r`. `pnpm --filter @plumage/docs registry` builds it,
and `dev` and `build` run it first. The staged sources and the output are generated, so
they are ignored by git and ESLint.

- **39 items:**
  - one per component (`registry:ui`) and pattern (`registry:component`)
  - `plumage-provider`
  - the base, `plumage`: `cn`, `format`, the chart helpers, the tokens, and the motion
    styles
- **Dependencies are worked out from the imports.**
  - npm packages get the version ranges in `@plumage/ui`'s `package.json`.
  - Other Plumage items are listed as namespaced registry dependencies (`@plumage/popover`),
    so a project resolves them from this registry, not from shadcn's.
- **Every file has an explicit target under `components/plumage/`**, mirroring
  `packages/ui/src`. The relative imports between Plumage files therefore work unchanged,
  and nothing depends on shadcn's alias rewriting.
- **The motion stylesheet** drops the package's `@source` line. A project's Tailwind
  already scans the copied files.
- **No font files.** Tokens name the families. The Fontshare rule (ADR 0020) holds for the
  registry too.
- **Tested end to end.**
  - In a fresh Vite and React project with `components.json` pointing `@plumage` at a local
    copy, `shadcn add @plumage/combobox @plumage/chart @plumage/date-picker
@plumage/plumage-provider` installed 16 files and their npm dependencies.
  - That project typechecked and built.
  - In the browser, it rendered Sparrow's dark theme with a working Combobox and no console
    errors.

**The docs pages** are MDX in `apps/docs/src`, sorted under Guides and Foundations:

- **Guides:**
  - Principles
  - Installing with shadcn
  - Adding a brand
  - Accessibility (WCAG 2.2 AA, with what is checked where)
  - Figma workflow (the four collections, import order, and changes flowing from code)
  - Contributing
- **Foundations:**
  - **Token reference:** every semantic and component token, resolved from
    `@plumage/tokens`' `values`.
  - **Typography:** font roles and the type scale.

The reference blocks live in `src/blocks/`. Each has its own brand, mode, and density
pickers and its own `PlumageProvider` scope, so the block restyles itself.

- **Colors show a swatch and a contrast ratio.** A background is measured with the text
  meant for it, and a foreground on the surface.
- **Translucent tints are measured as drawn.** Browser testing caught a hover tint
  measured as solid black (1.27:1); tints are now composited over the surface first.
- **Exempt colors say why.** That covers the dialog scrim and disabled colors.
- **The numbers match the token check's report** (15.37:1 for text on Finch's light
  canvas).

**Two build fixes:**

- **Stale Figma files.** The tokens build now clears `dist` first, because a removed
  brand's Figma file had stayed in `dist/figma`.
- **Build order.** The tokens package's tests, typecheck, and lint read its own `dist`, so
  Turbo now runs them after its build (`@plumage/tokens#test` and so on). Without that,
  the clean step raced them.

## Consequences

- **Good:** any React and Tailwind v4 project can add Plumage with the stock shadcn CLI
  today, and the code it gets is the code that is tested here.
- **Good:** the token reference can't drift from the tokens, because it is computed from the
  build.
- **Bad:** a project's copy of the tokens is a snapshot. Updating it means adding
  `@plumage/plumage` again.
- **Bad:** the registry is served from wherever the docs site is hosted. Locally that is
  `http://127.0.0.1:6006`, and `homepage` says so until the site has a public address.
- **Bad:** files land under `components/plumage/`, not shadcn's usual `components/ui/`. This
  keeps the imports intact, at the cost of a less familiar layout.
- **Follow-ups:**
  - Choose a scope for publishing the packages to npm: the `@plumage` one is taken.
  - Host the docs site, and set the registry's `homepage`.
  - Confirm the Figma import against a real file.

## References

- `apps/docs/scripts/build-registry.ts`, `apps/docs/package.json` (`registry`),
  `apps/docs/.storybook/main.ts` (`staticDirs`)
- `apps/docs/src/*.mdx`, `apps/docs/src/blocks/`
- `packages/tokens/package.json` (`build`), `turbo.json`
