# 0053. Plumage is public: a hosted docs site and an exported repository

- **Status:** Accepted
- **Date:** 2026-11-17
- **Scope:** Plumage, the repository
- **Supersedes:** ADR 0035 (Plumage stays private: no npm packages, no hosted registry)

## Context

Plumage is built in a private monorepo, beside the finance and health apps that use it
(Finch, Sparrow, Hummingbird, and Chickadee, one per brand). Its decision records live
there too, and the records about Plumage alone are copied into its public repository with
their original numbers, so the public numbering has gaps.

ADR 0035, a record that stays in the private monorepo, decided on 2026-10-30 that nothing
about Plumage would be published. In short: `@plumage/tokens` and `@plumage/ui` were
marked `"private": true` and lost their `publishConfig`, Changesets moved to
`access: "restricted"`, the shadcn registry stayed on the local Storybook at
`http://127.0.0.1:6006/r`, and the repository stayed private. Plumage existed only to
serve the apps.

That has changed. Plumage is now the subject of a portfolio case study, which argues one
claim: Plumage is a brand-agnostic design system, proven by four brands across finance and
health. A reader of the case study needs something to click through to: a demo, the
documentation, and the source. Under ADR 0035 none of these existed. The Storybook ran
only on the author's machine, and the source sat in a repository that also holds the apps,
with a history that mixes the two.

The forces:

- **The private monorepo stays private, and stays Plumage's home.** The apps keep
  consuming `@plumage/tokens` and `@plumage/ui` as workspace packages, and nothing about
  how they build changes.
- **Nothing from the finance or health side may reach the public:** no app code, no domain
  packages, no data, no secrets, and no git history from the private monorepo.
- **Plumage is already separable.** A boundary rule keeps `@plumage/*` from importing
  anything outside its own scope. Checked on 2026-11-17: `packages/tokens`, `packages/ui`,
  `apps/docs`, and `tests/visual` import only each other and third-party packages.
- **The `@plumage` scope on npm belongs to someone else**
  ([ADR 0030](0030-shadcn-registry-and-docs-pages.md)).

## Options considered

How the public repository is produced:

1. **Export from the private monorepo.** A script copies an allowlist of files into a
   standalone workspace and checks it, and the result is pushed by hand. The apps' workflow
   is untouched. The cost is one manual step per refresh, and a public history made of
   export commits.
2. **Move Plumage's home to the public repository,** pulled into the private monorepo as a
   git submodule. One source and a real history, but every Plumage change made while
   building an app would span two repositories, and all four apps would be rewired.
3. **Split out the existing history** with `git subtree split` or `git filter-repo` over
   the Plumage directories. Rejected: the commits mix Plumage and app changes, so all 123
   of them would need an audit before any could be public.

Making the whole private monorepo public was rejected too. Its history and the finance and
health fixtures would all need auditing, and the apps are not the portfolio piece.

Where the demo lives:

1. **Full-page example screens inside the Storybook.** One deploy and one address. The
   toolbar already switches brand, mode, and density, and the _All brands and modes_ view
   shows a screen in every brand at once. A reader sees the Storybook frame unless the link
   opens the story full screen.
2. **A standalone sample app.** It looks like a product, but it is a second app to build,
   host, and keep in step with Plumage. Deferred.
3. **Deploy the real apps with invented data.** Rejected. The apps are local-only by
   design: they bind to 127.0.0.1, keep their data in local SQLite files, have no sign-in,
   and hold a broker's OAuth secrets on the machine. A deployment would break each of those
   rules.

## Decision

Option 1 in both cases. Plumage is exported to a public repository, and the demo is two
example screens in its Storybook. The private monorepo stays the only place Plumage is
changed.

**What is public:**

- **The docs site,** at `https://plumage.oldskilabs.com`: the Storybook in `apps/docs`,
  built and hosted by Vercel from the public repository. It adds an _Examples_ section with
  two full screens, built only from existing Plumage components and patterns, with
  invented data and neutral copy:
  - **Finance overview** (story `examples-finance-overview--default`): headline figures
    with their changes, value over time against a benchmark, allocation by sector, and a
    table of holdings.
  - **Health day** (story `examples-health-day--default`): progress toward the day's
    targets, macros, twelve weeks of consistency, and a log of the day.

  Neither screen names a brand. The brand comes from the toolbar, like every other story,
  which is the point: no component knows which product it is in.

- **The shadcn registry,** at `/r` on that site
  (`https://plumage.oldskilabs.com/r/{name}.json`). Its address is one setting,
  `PLUMAGE_REGISTRY_ORIGIN`, read at build time by `apps/docs/scripts/build-registry.ts`
  and declared in `turbo.json`. Without it the registry points at the local Storybook,
  `http://127.0.0.1:6006`, so local development is unchanged. The base item still carries
  the built tokens ([ADR 0030](0030-shadcn-registry-and-docs-pages.md)).
- **The repository,** `oldski/plumage` on GitHub, under the MIT licence the packages
  already declare. It holds `packages/tokens`, `packages/ui`, `apps/docs`, `tests/visual`,
  `.changeset`, the root tooling they need, and the decision records about Plumage alone.

**What stays private:**

- The monorepo itself, and its history.
- The four apps, and the finance and health domain packages.
- All data: databases, backups, imported health and finance files, fixtures, and
  environment files.
- Decision records that mix Plumage with an app, and ADR 0035, which this record replaces.

**npm stays out of scope.** The `@plumage` scope is taken
([ADR 0030](0030-shadcn-registry-and-docs-pages.md)), and a portfolio piece does not need a
package. `@plumage/tokens` and `@plumage/ui` stay `"private": true`, and Changesets keeps
`access: "restricted"`; versions and changelogs still record what changed. The registry is
how other projects use Plumage.

**The export is the only path from private to public.** In the private monorepo,
`pnpm export:plumage <target-dir>` runs `scripts/export-plumage.mjs`, with its rules in
`scripts/export-plumage/checks.mjs`. The public repository is not edited directly. Each
export replaces everything in its target except `.git`, so a file the public repository
needs (a workflow, say) is added to the export's templates instead.

- **An allowlist.** The export copies files that git tracks, and only those on the list:
  - the workspaces `packages/tokens`, `packages/ui`, `apps/docs`, `tests/visual`, and
    `.changeset`;
  - six root files: `tsconfig.base.json`, `tsconfig.react.json`, `.prettierrc.json`,
    `.editorconfig`, `.nvmrc`, and `turbo.json`;
  - the decision records 0000 (the template) to 0008, 0010, 0020, 0027, 0030, 0039, 0040,
    and this one.

  The public root files are written fresh from templates: `package.json` and
  `pnpm-workspace.yaml` listing only these workspaces, an ESLint config whose boundary
  rule names only the copied workspaces (the private one names private scopes and paths),
  `.prettierignore`, `.gitignore`, a README for outside readers, and the MIT `LICENSE`.

- **A clean source.** The export refuses to run while an exported file, a template, or the
  export's own code differs from the last commit. The marker it leaves in the target,
  `.plumage-export`, names that commit.
- **A target guard.** The export refuses a target inside the private monorepo. It writes
  only to a target that is missing, empty, holds only `.git`, or carries a valid
  `.plumage-export` from an earlier export, and it prints what it removes.
- **A scan.** Every file in the target, decision records included, is checked in any case
  for the words only the private side uses: the private package scopes, the database file
  names, a broker's name, and the health export folder. Every path must be on the
  allowlist. Relative links in Markdown must resolve inside the export, and a link to a
  decision record that stayed private fails. A hit is fixed at the source, not excused,
  and a refused export empties its target, except `.git`.
- **Verification.** In the target, the export runs `pnpm install`, then typecheck, lint,
  the unit tests, and the docs build. It then scans again every file git would track
  there; the only new file it allows is the lockfile.
- **No commit, no push.** The export leaves the target for review. Committing and pushing
  are done by hand.

**Fonts.** The brand typefaces are Fontshare fonts under the ITF Free Font License, named
by the tokens and never bundled ([ADR 0020](0020-sparrow-brand-and-font-roles.md)). The
docs site, and only the docs site, now loads five of them from Fontshare's CSS API:
Switzer, Cabinet Grotesk, Satoshi, Clash Grotesk, and Gambetta. The stylesheet is linked
from `apps/docs/.storybook/preview-head.html` and does not block first paint. The licence
(version 2.0, dated 17 August 2026, read on 2026-11-17) allows this:

> In addition to direct download, Fontshare may also make the Font Software available
> through the Fontshare API. In this case, the Font Software is delivered directly from
> servers used by Indian Type Foundry to the Licensee's website, without the Licensee
> having to download or host the Font Software.

Its Section 02 forbids distributing the font files through a repository or publicly
accessible servers, so no font file enters either repository, and `@plumage/tokens` and
`@plumage/ui` do not change. The visual suite blocks requests to Fontshare
(`tests/visual/visual.spec.ts`), so a run needs no network and does not shift when
Fontshare changes a file. The baselines therefore show whatever of these faces are
installed on the machine that made them, and the fallback stacks otherwise.

## Consequences

- **Good:** the case study links to proof: a demo, the documentation, a registry that
  installs into an outside project, and the source.
- **Good:** the apps' workflow does not change. Plumage is still edited, tested, and
  consumed in one place.
- **Good:** what goes public is decided by a list in code, covered by tests, not by memory.
  A stray file or a private term stops the export before anything leaves.
- **Good:** each brand shows its real typefaces on the docs site.
- **Bad:** every refresh is a manual step: export, review, commit, push. The public
  repository lags the private one until someone does it.
- **Bad:** the public history is a series of export commits, not the day-to-day work. A
  change offered on the public repository cannot be merged there; it has to be carried into
  the private monorepo and exported, or the next export removes it.
- **Bad:** the visual baselines are macOS Chromium renders from the author's machine, and
  they depend on its installed fonts. `pnpm visual` reports differences on any other
  machine until it has baselines of its own. The public README says so.
- **Bad:** the docs site depends on Fontshare when it is viewed. If Fontshare is slow or
  down, the site shows the fallback stacks.
- **Bad:** the scan matches words, not meaning. A private detail written in other words
  would pass it, so a person still reviews the target before each push.
- **Follow-ups:**
  - Create the public repository, push the first export, host the docs site on Vercel
    with `PLUMAGE_REGISTRY_ORIGIN` set to `https://plumage.oldskilabs.com`, and point the
    address at it. Then check the live site, and a registry install from a project
    outside both repositories.
  - Revisit this if Plumage is published to npm under another scope, or if its home moves
    to the public repository (option 2), which would retire the export.

## References

- `apps/docs/src/examples.mdx`, `packages/ui/src/examples/`
- `apps/docs/.storybook/preview-head.html`, `tests/visual/visual.spec.ts`,
  `apps/docs/src/typography.mdx`
- `apps/docs/scripts/build-registry.ts`, `apps/docs/src/installing.mdx`, `turbo.json`
- In the private monorepo: `scripts/export-plumage.mjs`, `scripts/export-plumage/`, and
  ADR 0035
- [Fontshare](https://www.fontshare.com) and the ITF Free Font License
