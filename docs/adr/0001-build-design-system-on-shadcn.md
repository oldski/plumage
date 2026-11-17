# 0001. Build Plumage on shadcn/ui, Radix, and Tailwind

- **Status:** Accepted
- **Date:** 2026-10-29
- **Scope:** Plumage

## Context

Plumage has to serve at least two products with different personalities: Finch (dense,
precise, a finance dashboard) and VibeCheck (expressive, roomier). Each product is a
theme, so nothing in the component layer may know about a specific brand.

The components must be accessible by default (keyboard support, focus management,
correct ARIA), small enough to read in one sitting, and themable through design tokens
rather than through per-component style props. The team is one person, so the system
cannot afford to reimplement focus traps, roving tab index, or positioning logic.

It is also a portfolio piece: the code should be ours to read, explain, and change.

## Options considered

1. **Packaged component library (MUI, Chakra, Mantine).** Fast to start and well
   tested, but the styling model belongs to the library. Multi-brand theming means
   fighting its theme object, and the code we would be showing is configuration, not a
   design system.
2. **Headless primitives only (Radix or React Aria) and hand-written styling.** Full
   control and strong accessibility. Every component's markup, variants, and styling
   start from zero, which is the slowest path to sixteen primitives.
3. **shadcn/ui as a starting point (Radix behavior + Tailwind styling, copied into our
   repo).** We get accessible Radix behavior plus a sensible, widely understood
   component structure, and the code lives in our package where we can refactor it.
4. **Build everything from scratch.** Maximum ownership, maximum risk; accessibility
   bugs would be ours alone.

## Decision

Use shadcn/ui as the starting point for every primitive, then refactor each component so
it references only Plumage semantic and component tokens through Tailwind utilities that
the token build generates. Radix stays the behavior layer.

Concretely:

- Components are copied in, not imported from a shadcn package, so there is no runtime
  dependency on shadcn.
- After the copy, every color, size, radius, shadow, and duration is replaced with a
  Plumage token utility (for example `bg-surface`, `text-muted`, `rounded-control`,
  `h-control-md`). Tailwind's default palette and scales are switched off in the
  generated theme, so a stray `bg-zinc-900` or `text-sm` fails to compile into anything.
- Plumage is distributed two ways: as the `@plumage/ui` workspace package for apps in
  this repo, and as a custom shadcn registry served from the docs site, so future
  projects can run `npx shadcn add <registry-url>/button` and receive Plumage versions
  of the components.

## Consequences

- **Good:** accessible behavior from Radix on day one; a component structure most React
  developers already recognize; the code is ours to refactor and document.
- **Good:** the shadcn registry format gives us a distribution channel for free, and it
  matches how shadcn users already expect to consume components.
- **Bad:** we own every line. Upstream shadcn fixes do not arrive automatically; we
  have to watch upstream and port fixes by hand.
- **Bad:** we are coupled to Tailwind v4 and Radix. Moving off either is a rewrite of
  the styling or behavior layer, not a dependency bump.
- **Follow-ups:** a lint rule (or a test) that fails when a component references a
  primitive token or a raw value; a short "porting a shadcn component" guide in the docs
  site under Contributing.

## References

- shadcn/ui: https://ui.shadcn.com
- Radix Primitives: https://www.radix-ui.com/primitives
- shadcn registry docs: https://ui.shadcn.com/docs/registry
