# Changesets

Plumage packages (`@plumage/tokens`, `@plumage/ui`) are versioned with
[Changesets](https://github.com/changesets/changesets). The packages are not published
to npm: versions and changelogs record what changed for the products built on Plumage and
for the registry.

When a change affects a package's public surface (a token added, renamed, or removed;
a component prop changed), run:

```sh
pnpm changeset
```

pick the packages and bump type, and describe the change for consumers. Token renames
and removals are breaking changes for every brand, so they are always a major bump.

`pnpm version-packages` applies pending changesets and writes the changelogs.
