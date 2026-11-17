# 0007. Testing strategy: stories as tests, axe everywhere

- **Status:** Accepted
- **Date:** 2026-10-29
- **Scope:** Plumage

## Context

The brief asks for Vitest and Testing Library behavior tests, axe on every component, and
Storybook interaction tests and the a11y addon. Writing the same behavior twice, once as a
story and once as a test, invites drift.

## Decision

**Stories are the behavior tests.** Interactive stories have play functions that drive
the component the way a person would, mostly by keyboard: open a menu with Enter, jump
with typeahead, close with Escape and check focus returns. Storybook shows them in the
Interactions panel. `test/stories.test.tsx` runs every story in Vitest with portable
stories: Testing Library renders it, the play function runs, then axe checks the result.
Adding a story adds a test.

**Accessibility is checked at three levels.**

| Level               | Where                                    | What it catches                                                         |
| ------------------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| Tokens              | `pnpm --filter @plumage/tokens check`    | Contrast of every text, UI, and chart pairing, for every brand and mode |
| Components, CI      | Vitest, jsdom, axe WCAG 2.x A and AA     | Roles, names, ARIA, labels, focus order                                 |
| Components, browser | Storybook a11y panel (`context: "body"`) | All of the above plus real color contrast, including portaled overlays  |

jsdom does no CSS cascade, so axe's color-contrast rule is off in CI; contrast is covered
by the token checks. During step 3, we ran axe with contrast on in a real browser against
13 stories in all four brand and mode combinations (52 renders): no violations.

**Direct tests** cover what stories cannot: `PlumageProvider` (scopes, inheritance,
cleanup, portal targeting), `cn` merging, label-to-control forwarding, and the
token-only class guard.

**Not yet: Storybook's Vitest addon in browser mode.** It would run play functions in real
Chromium in CI. The installed Playwright build needs a newer Chromium than the one cached
on this machine, so we deferred a roughly 150MB browser download. The portable-stories
setup above means enabling it later changes configuration, not tests.

## Pitfalls found and how they are handled

- **Vitest 5's persistent transform cache** keyed `test/stories.test.tsx` by its own
  contents, so its `import.meta.glob` kept an old list of story files and silently skipped
  new ones. `fsModuleCache` is off for this package.
- **`Story.run()` leaves React roots mounted**, which let late timers (toast dismissal)
  commit into later tests. Testing Library now renders each story so its cleanup unmounts
  it, and `fn()` spies are cleared before each story, as Storybook does.
- **Storybook's bundled user-event** builds events with Vitest's global window proxy, which
  jsdom rejects when a label forwards a click to its control. That one behavior is tested
  with the standalone user-event in `test/label.test.tsx`. jsdom is pinned to 27, where
  the standalone package handles it.
- **The matrix view renders each story four times**, so play functions query through
  `storyCanvas()`, which targets the first copy, and stories pair labels with `useId()`
  rather than fixed ids, exactly as apps should.
- **Real browsers caught what jsdom could not.** `pointer-events: none` on disabled buttons,
  toasts that fade in from opacity 0, and Radix focusing the menu container rather than its
  first item when it does not detect keyboard use. Those play functions now assert the
  behavior that holds in both environments.

## Consequences

- **Good:** one source of truth for behavior, visible to designers in Storybook and
  enforced in CI.
- **Bad:** jsdom is not a browser. Layout, focus events, animation, and contrast are only
  verified in Storybook until browser-mode tests are enabled.
- **Follow-up:** enable `@storybook/addon-vitest` with Playwright when a matching Chromium
  is available, with `a11y.test: "error"` so contrast regressions fail CI too.
