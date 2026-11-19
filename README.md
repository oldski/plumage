# Plumage

Plumage is a multi-brand design system: one set of components that takes on four brands
(Finch, Sparrow, Hummingbird, and Chickadee) across two domains, finance and health, in
light and dark mode and at two densities. It is built on shadcn/ui, Radix, and Tailwind v4,
and everything that makes a screen look like a product comes from design tokens, so
switching the brand restyles the whole screen without a line of component code changing.

- **Documentation:** [plumage.oldskilabs.com](https://plumage.oldskilabs.com)
- **Example screens:** [Finance overview](https://plumage.oldskilabs.com/iframe.html?id=examples-finance-overview--default&viewMode=story)
  and [Health day](https://plumage.oldskilabs.com/iframe.html?id=examples-health-day--default&viewMode=story),
  two full screens built only from Plumage components and patterns.

## Run the Storybook

You need Node 22.12 or later and pnpm 10.

```bash
pnpm install
pnpm --filter @plumage/docs dev
```

The site opens on `http://127.0.0.1:6006`. The toolbar switches brand, mode, and density,
and "All brands and modes" renders a story in every combination at once.

Other commands, from the repository root:

```bash
pnpm build       # build every workspace
pnpm test        # unit tests (Vitest)
pnpm typecheck
pnpm lint
pnpm visual      # visual regression (see the note below)
```

## Install from the registry

Plumage is a [shadcn registry](https://ui.shadcn.com/docs/registry). Add it to your
project's `components.json`:

```json
{
  "registries": {
    "@plumage": "https://plumage.oldskilabs.com/r/{name}.json"
  }
}
```

Then add what you need:

```bash
npx shadcn add @plumage/button @plumage/combobox @plumage/plumage-provider
```

The _Installing with shadcn_ page on the documentation site covers the styles to import
and how to wrap your app.

## Repository map

| Path              | Package           | What it is                                                                                |
| ----------------- | ----------------- | ----------------------------------------------------------------------------------------- |
| `packages/tokens` | `@plumage/tokens` | Design tokens in the W3C DTCG format, built to CSS, Tailwind, TypeScript, and Figma       |
| `packages/ui`     | `@plumage/ui`     | React components and patterns, with stories and tests next to each one                    |
| `apps/docs`       | `@plumage/docs`   | The documentation site (Storybook), which also serves the shadcn registry at `/r`         |
| `tests/visual`    | `@plumage/visual` | Visual regression: every story in every brand, mode, and density, against baseline images |
| `docs/adr`        |                   | The decision records behind the system                                                    |
| `.changeset`      |                   | Pending changesets and their config, for the versions of the tokens and components        |

## Where this comes from

Plumage was built inside a private monorepo, alongside the apps that use it. This
repository is exported from there, so its history is a series of exports rather than the
day-to-day commits, and the decision records keep their original numbers, with gaps where
a record was about the apps. Each export replaces everything here except the git history,
so a file added only in this repository (a workflow, a CNAME) is removed by the next one; such
files are added to the export instead. The `.plumage-export` file at the root is written
by each export and names the commit it came from; the next export needs it, so do not edit
or delete it.

## Hosting

The documentation site is deployed by Vercel from this repository. `vercel.json` holds the
build settings: it builds `@plumage/docs` and its dependencies and serves
`apps/docs/storybook-static`. The project sets one environment variable,
`PLUMAGE_REGISTRY_ORIGIN`, to the site's address, which the registry build writes into
`/r/registry.json`.

The build command in `vercel.json` also sets `PLUMAGE_GTM_ID`, which adds a Google Tag
Manager container to the hosted site. A local build leaves it unset and loads no analytics.

## Versioning

`@plumage/tokens` and `@plumage/ui` are versioned together with
[Changesets](https://github.com/changesets/changesets). A change to either one comes with a
changeset (`pnpm changeset`): minor for something new, major for a removed or renamed token
or prop. `pnpm version-packages` applies them and writes the changelogs. The packages are
not published to npm; the registry is how other projects use them.

## Visual baselines

The images in `tests/visual/baselines` are macOS Chromium renders from the author's
machine. Font rendering differs between systems, so `pnpm visual` will report differences
anywhere else. Run `pnpm visual:update` to make baselines of your own first. The first
time, install the browser the tests use with
`pnpm --filter @plumage/visual exec playwright install chromium`.

## Fonts

The fonts are named, never bundled: they are Fontshare fonts under the ITF Free Font
License, so a product self-hosts the files it uses. The documentation site loads them from
Fontshare's CSS API, so each brand shows its real faces. The visual tests block that
request, so their baselines show whatever of these faces are installed on the machine that
made them, and the fallback stacks otherwise: every sans stack falls back to Inter and then
the system font, and the serif falls back to the system serifs.

## Licence

[MIT](LICENSE)
