# 0006. PlumageProvider, scopes, and portals

- **Status:** Accepted
- **Date:** 2026-10-29
- **Scope:** Plumage

## Context

Token CSS is scoped by `data-brand`, `data-theme`, and `data-density`
([ADR 0003](0003-token-architecture-and-theming.md)). Something has to set those
attributes, keep them consistent, and cope with overlays: Radix portals dialogs, menus,
and tooltips to `<body>`, which sits outside any themed `<div>`.

Three real situations need different answers: a whole app (Finch), a themed region inside
a page (an inverse section, an embed), and documentation that shows several brands side by
side.

## Decision

`PlumageProvider` has two scopes.

- **`scope="root"` (default)** writes all three attributes on `<html>` and restores the
  previous values on unmount. Everything, including portaled overlays, is themed. One per
  app.
- **`scope="local"`** renders a `<div>` carrying the attributes and publishes it as the
  portal container. Plumage overlays call `usePortalContainer()` and portal into the
  nearest local scope, so a dialog opened inside a VibeCheck preview is a VibeCheck dialog.

Other rules:

- Nested providers inherit `brand` and `mode` from their parent; `density` defaults to the
  brand's own default (Finch compact, VibeCheck comfortable), declared as brand metadata
  in the token resolver, not in component code.
- `mode="system"` follows `prefers-color-scheme` through `useSyncExternalStore`, so it
  updates live and renders "light" on the server.
- The provider is controlled: it holds no state. Apps own the user's preference (Finch will
  persist it) and pass it in. `usePlumage()` reads the active values.
- A provider with no brand, and no parent to inherit one from, throws. There is no default
  brand ([ADR 0003](0003-token-architecture-and-theming.md)).

In Storybook the decorator uses root scope on the canvas, a local scope per story on docs
pages (so Storybook's own documentation text keeps its colors in dark mode), and local
scopes for the "All brands and modes" matrix.

## Options considered

- **Always render a wrapper `<div>`.** Simpler, but every Radix portal would escape it,
  and apps would need to thread a container into every overlay.
- **Always write to `<html>`.** Breaks side-by-side previews and nested regions.
- **A stateful provider with setters (like next-themes).** Convenient, but it hides where
  the preference lives. Persistence belongs to the app.

## Consequences

- **Good:** overlays are always themed by the scope that opened them.
- **Good:** the same components power a full app, an embed, and a docs matrix.
- **Bad:** root scope applies attributes in a layout effect, so a server-rendered app
  should also render the attributes on `<html>` itself to avoid a first-paint flash.
  Finch will do this in step 5.
- **Bad:** a local scope element must not create a containing block (no `transform` or
  `filter`), or fixed-position overlays inside it will be positioned relative to it.
