# 0010. Plumage additions and fixes found while building Finch

- **Status:** Accepted
- **Date:** 2026-10-29
- **Scope:** Plumage

## Context

Finch may not define its own colors or spacing. When it needs something Plumage lacks,
the gap is filled in Plumage, with stories, tests, and docs, and noted here. Building the
import page and dashboard found two missing pieces and three problems.

## Decision

**Alert** (primitive). A callout that stays on the page, for stale data, import caveats,
and failures. Tones are neutral, info, positive, warning, and negative, built on the
`feedback.*-subtle` tokens. It is not a live region unless given a role: `role="alert"`
for urgent messages, `role="status"` for polite ones, so static notices are not
re-announced. The token checks now include body and muted text on every subtle feedback
background at 4.5:1. Toasts remain for transient confirmations.

**FileDropzone** (pattern). A drop target wrapped around a real, visually hidden file
input, so it works with a keyboard and assistive tech as well as a mouse. It checks
`accept` and `maxSize` and explains rejected files in a polite live region linked to the
input. A new `focus-ring-within` utility draws the standard focus ring on a container
whose real control has focus.

**Dark warning surfaces no longer read as red.** In dark mode, Finch's `warning-subtle`
background was `#430700` and `negative-subtle` was `#470005`: at that luminance, orange's
interpolated hue (about 40) is red. Options considered:

1. Move orange's dark-end hue from 40 to 50. Also moves `orange.500` and `orange.550`,
   which are chart slot 2, and would invalidate the validated categorical palette.
2. Map warning surfaces to the gold ramp. Collides with Finch's accent, which is gold.
3. Let a ramp override the hue of individual steps. Chosen: `hueAt` in
   `ramps.config.ts` sets orange 700 to 950 back toward amber. Only those four steps
   changed (`950` is now `#381400`); every luminance target, contrast check, and the
   chart palette are unchanged.

**PlumageProvider follows the system theme from the first frame.** In `mode="system"`,
the server cannot know the color scheme, so `resolvedMode` starts as light during
hydration. The root scope's effect now reads the media query itself instead of writing
that guess to `<html>`, so a dark system never flashes light. Finch also renders the
attributes on the server and runs a one-line script before paint.

**The class guard is shared.** The test that compiles every class against the Plumage
theme moved to `@plumage/ui/testing/class-guard`. Plumage runs it on its components and
Finch runs it on `app/` and `components/`, so Finch cannot use raw Tailwind scales or
literal values either.

## Consequences

- **Good:** Finch's notices, import flow, and both themes use only Plumage.
- **Good:** the warning fix applies to any brand that maps warning to orange.
- **Bad:** `hueAt` is a hand-tuned exception in an otherwise formula-driven ramp. The
  config comment says why, and the contrast checks still cover the result.
- **Follow-ups:** add Alert and FileDropzone to the shadcn registry in step 10.

## References

- `packages/ui/src/components/alert/`, `packages/ui/src/patterns/file-dropzone/`
- `packages/tokens/scripts/ramps.config.ts` (`hueAt`)
- `packages/ui/testing/class-guard.ts`, and the class test in each app that uses it
- [ADR 0004](0004-luminance-matched-color-ramps.md), [ADR 0006](0006-plumage-provider-and-scopes.md)
