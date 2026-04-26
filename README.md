# `@present-day/reveal-row`

Horizontally scrollable row that reveals one or two action columns — **right**, **left**, or **both** sides. Three snap positions: left · center · right. Styling is entirely via `classNames` props (no bundled CSS). Scroll physics use inline `style` on the scroll track so the component works with zero external CSS.

<img width="295" height="640" alt="Simulator Screen Recording - iPhone 15 - 2026-04-25 at 22 26 41" src="https://github.com/user-attachments/assets/932021d4-5224-479f-9df9-c7045bf12afb" style="float:right" />


## Install

```bash
npm i @present-day/reveal-row
```

Peer dependencies: `react`, `react-dom` (v18 or v19).

## Basic usage

```tsx
import { RevealRow } from '@present-day/reveal-row'

// Right mode — swipe left to reveal
<RevealRow right={<button onClick={handleDelete}>Delete</button>}>
  <MyRowContent />
</RevealRow>

// Left mode — swipe right to reveal
<RevealRow left={<button onClick={handlePin}>Pin</button>}>
  <MyRowContent />
</RevealRow>

// Both modes — swipe either direction
<RevealRow
  left={<button onClick={handlePin}>Pin</button>}
  right={<button onClick={handleDelete}>Delete</button>}
>
  <MyRowContent />
</RevealRow>
```

## Modes

| `mode`  | Slots used           | Resting ("closed") scroll                   |
| ------- | -------------------- | ------------------------------------------- |
| `right` | `right` only         | `scrollLeft = 0` (left edge)                |
| `left`  | `left` only          | `scrollLeft = wL` (after leading column)    |
| `both`  | `left` and `right`   | `scrollLeft = wL` (main fills viewport)     |

Omit `mode` and it's inferred: both slots → `both`, only `left` → `left`, otherwise `right`.

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `children` | `ReactNode` | — | Primary row content |
| `left` | `ReactNode` | — | Leading action column |
| `right` | `ReactNode` | — | Trailing action column |
| `mode` | `'left' \| 'right' \| 'both'` | inferred | Override mode detection |
| `actionWidthLeft` | `number` | `88` | Width (px) of the left column |
| `actionWidthRight` | `number` | `88` | Width (px) of the right column |
| `classNames` | `RevealRowClassNames` | `{}` | Class names for each sub-element |
| `showHandle` | `boolean` | `true` | Render the default 6-dot drag affordance |
| `handle` | `ReactNode` | — | Replace the default handle with custom content |
| `handlePosition` | `'start' \| 'end'` | `'start'` in left mode, `'end'` otherwise | Where the handle strip sits in the row |
| `handleTitle` | `string` | `'Drag horizontally…'` | Tooltip on the default handle |
| `handleAriaLabel` | `string` | `'Drag horizontally…'` | Screen-reader text on the default handle |
| `onRevealChange` | `(pos: RevealPosition) => void` | — | Fires when the settled position changes (debounced) |
| `onScroll` | `UIEventHandler` | — | Raw scroll events |
| `disabled` | `boolean` | `false` | Disables swiping |
| `resetWhenDisabled` | `boolean` | `true` | Snap closed when `disabled` becomes true |
| `isActive` | `boolean` | `false` | Snap closed (e.g. another row was selected) |
| `className` | `string` | — | Added to the root scroll element |
| `style` | `CSSProperties` | — | Added to the root scroll element |

## Ref API

```tsx
const ref = useRef<RevealRowHandle>(null)

<RevealRow ref={ref} right={<DeleteButton />}>
  <MyRowContent />
</RevealRow>

// Programmatic control
ref.current?.close()                    // snap to center
ref.current?.reveal('left')            // snap to left action
ref.current?.reveal('right')           // snap to right action
ref.current?.reveal('center')          // alias for close
```

## classNames

All sub-elements accept class names for styling:

```tsx
<RevealRow
  classNames={{
    root: 'my-row',          // scroll container
    main: 'my-row__main',    // main content track
    mainInner: '',           // flex wrapper inside main
    left: 'my-row__left',   // left action column
    right: 'my-row__right', // right action column
    handleContainer: '',    // outer handle strip
    handleIcon: '',         // icon wrapper inside handle
  }}
>
```

## Integration notes

**Nested vertical scroll** — the root uses `touch-action: pan-x pan-y` so a parent list can still scroll vertically.

**Overscroll / browser back gestures** — if horizontal swipes compete with iOS back or macOS trackpad history navigation, set `overscroll-behavior-x: none` on a suitable ancestor (e.g. a full-screen container).

**Preventing row activation on swipe** — the component guards against triggering a click after a horizontal drag. If you wrap the row in a command palette item or similar, keep the built-in `onClickCapture` behaviour intact, or replicate it.

## Publishing

Run `bun run build` to produce `dist/`. The `exports` field in `package.json` points to `dist/index.{js,mjs,d.ts}`. Push a tag to trigger the GitHub Actions publish workflow (OIDC trusted publishing — no npm token needed in secrets).
