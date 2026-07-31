# Multi-action sides: docs, playground demo, and verification

**Date:** 2026-07-30
**Status:** Approved (docs-only; no API changes)

## Goal

Make it obvious that `RevealRow` supports more than one action button per side
(iOS Mail-style Delete + Pin), and let people try it in the live playground.
The architecture already supports this — each side slot is a single fixed-width
column (`actionWidthLeft` / `actionWidthRight`) whose contents are any
`ReactNode` — so this is documentation, a demo, and a regression test, not a
feature build.

## The pattern being documented

```tsx
<RevealRow
  actionWidthRight={176}
  right={
    <div style={{ display: 'flex', height: '100%' }}>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={handlePin}>Pin</button>
    </div>
  }
>
  <MyRowContent />
</RevealRow>
```

Rule of thumb: the side slot is one column — lay out N buttons with flex inside
it and set `actionWidth*` to the total width (e.g. 2 × 88 = 176).

## Deliverables

1. **Unit test** (`src/RevealRow.test.tsx`): a row with two buttons in the
   `right` slot and `actionWidthRight={176}`. Assert:
   - the right column renders at 176px (`gridTemplateColumns` includes `176px`),
   - both buttons fire their `onClick` handlers (clicks inside the action
     column bypass the swipe click-guard),
   - `reveal('right')` still targets max scroll (whole column snaps into view).
2. **Playground** (`playground/src/PlaygroundApp.tsx`): new "Multiple actions"
   section placed directly after "Right mode", with rows showing Delete (red) +
   Pin (amber) side-by-side on the right at `actionWidthRight={176}`, reusing
   the existing `ActionButton` / `ItemContent` helpers and section styling.
   Deploys automatically to GitHub Pages via the existing
   `deploy-playground.yml` on push to main.
3. **README**: "Multiple actions per side" subsection immediately after
   Quick start, containing the snippet above and the one-sentence rule of
   thumb.

## Non-goals

- No new props or API sugar (an `actions` array prop was considered and
  rejected — keeps the library headless and the surface small).
- No iOS-style progressive/staggered reveal or full-swipe-to-commit gestures.

## Error handling / edge cases

- If a consumer forgets to widen `actionWidth*`, buttons compress into the
  default 88px column — the README sentence states the width rule explicitly
  to preempt this.
- No runtime validation added; consistent with the library's headless,
  zero-opinion approach.

## Testing

`bun run test` (vitest) must stay green; the new test is the acceptance
criterion for the capability claim. Manual check of the playground section via
`bun run playground`.
