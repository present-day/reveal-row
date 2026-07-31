# Multi-action sides: auto-width, keyboard accessibility, focus states

**Date:** 2026-07-30
**Status:** Approved (v2 — expanded from docs-only to feature work)

## Goal

Make multi-button action sides (iOS Mail-style Delete + Pin) first-class:
no width math for consumers, correct keyboard behavior, visible un-clipped
focus rings, and reduced-motion support. Zero breaking changes.

## 1. Auto-width action columns

`actionWidthLeft` / `actionWidthRight` become optional in behavior (they were
already optional in types, defaulting to 88):

- **Number provided** → fixed `${n}px` grid track, exactly today's behavior.
- **Omitted** → grid track `minmax(88px, max-content)`: the column sizes to
  its content, with an 88px floor so existing stretchy content (`w-full`
  buttons) still gets the familiar 88px column. Not a breaking change.
- Effective width for scroll math is read live: `prop ?? (column.offsetWidth
  || 88)`. No ResizeObserver, no state — reads happen inside scroll/click/
  imperative handlers that already read layout (`scrollWidth`/`clientWidth`),
  so this adds no new reflow cost. The `|| 88` fallback also keeps JSDOM
  (offsetWidth 0) behaving like the default.

## 2. Focus-driven reveal (keyboard accessibility)

Problem: action buttons are tabbable while visually hidden off-scrollport;
native browser scroll-into-view yanks the row to un-snapped positions and
rows feel "stuck open" when focus moves on.

- `focusin` inside a side column → programmatic `reveal(side)` (clean snap),
  and mark the reveal as focus-initiated.
- `focusout` past the row root → if the reveal was focus-initiated, snap
  closed. Focus moving from row A's button to row B's button closes A and
  opens B — per-row self-closing, no cross-row coordinator, stays headless.
- Swipe-opened rows are NOT auto-closed on focus loss (gated by the
  focus-initiated flag); list-level coordination remains the `isActive`
  pattern.

## 3. Reduced motion

`resolveAnimationConfig` honors `prefers-reduced-motion: reduce` by dropping
duration to 0, unless the caller passed an explicit `AnimationConfig` object
(prop or per-call argument) — an explicit config is an intentional override.
Guarded for environments without `matchMedia`.

## 4. Focus-ring clipping

The root is a scroll container; CSS clips anything drawn outside the
scrollport (outlines included, vertically too). No library code can un-clip a
child's focus ring, so the pattern is inset rings:

- Playground `ActionButton` gains a `focus-visible` inset ring demonstrating
  the pattern.
- README "Integration notes" gains a "Focus styles" note: use
  `outline-offset: -2px` / Tailwind `ring-inset` on action buttons, with the
  one-line reason.

## 5. Observability

Root element carries `data-reveal-position="left|center|right"` (state-backed,
updated on settle) so consumers can style open/closed states in CSS and target
them in tests.

## Deliverables

- `src/RevealRow.tsx`: auto-width tracks, live width reads, focus handlers,
  reduced motion, `data-reveal-position`.
- `src/RevealRow.test.tsx`: auto track template assertions (update existing
  default-width expectations to `minmax(88px, max-content)`), focus-reveal,
  focus-out close gating (focus-initiated closes; swipe-opened does not),
  reduced-motion, multi-button regression tests (already landed).
- Playground: "Multiple actions" section drops the width prop (buttons carry
  their own widths inside a flex container); `ActionButton` gets inset
  focus-visible ring.
- README: simplify multi-action section (no math), add keyboard/reduced-motion
  notes and the focus-styles integration note.

## Non-goals

- No `actions` array sugar prop; no progressive/staggered iOS reveal; no
  cross-row context provider.

## Testing

`bun run lint`, `bun run type-check`, `bun run test`, `bun run
playground:build` all green. Manual keyboard pass in the playground (Tab
through rows: reveal on focus, close on focus-out, visible inset rings).
