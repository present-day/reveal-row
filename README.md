# RevealRow

**Buttery swipe-to-reveal actions for React lists — powered by native scroll physics, not JavaScript animation.**

[![npm version](https://img.shields.io/npm/v/@present-day/reveal-row?color=cb3837&logo=npm)](https://www.npmjs.com/package/@present-day/reveal-row)
[![CI](https://github.com/present-day/reveal-row/actions/workflows/ci.yml/badge.svg)](https://github.com/present-day/reveal-row/actions/workflows/ci.yml)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@present-day/reveal-row?label=gzip)](https://bundlephobia.com/package/@present-day/reveal-row)
[![types](https://img.shields.io/npm/types/@present-day/reveal-row)](https://www.npmjs.com/package/@present-day/reveal-row)
[![license](https://img.shields.io/npm/l/@present-day/reveal-row)](./LICENSE)

The swipe-to-delete pattern everyone knows from iOS Mail — as a headless React component. Swipe (or drag, or scroll) a row horizontally to reveal action buttons on the **right**, the **left**, or **both** sides, with three crisp snap positions: left · center · right.

**[▶ Try the live playground](https://present-day.github.io/reveal-row/)**

<img width="295" height="640" alt="RevealRow demo — swiping a list row to reveal actions" src="https://github.com/user-attachments/assets/932021d4-5224-479f-9df9-c7045bf12afb" />

## Why RevealRow?

- 🍦 **Native scroll physics** — momentum, rubber-banding, and snap come from the browser's own scroll engine (CSS scroll-snap), not a JS animation loop. It feels right because it *is* the real thing.
- 🎨 **Headless & unstyled** — no bundled CSS. Every sub-element takes your class names, so it drops into Tailwind, CSS Modules, or plain CSS without a fight.
- 📱 **Touch, trackpad, and mouse** — one component, every input. Works inside vertically scrolling lists without gesture conflicts.
- 🪶 **Tiny & dependency-free** — just `react` and `react-dom` as peers. Tree-shakeable, `sideEffects: false`, ESM + CJS + types.
- ♿ **Accessible by default** — keyboard-friendly drag handle with configurable ARIA labels, and a click-guard so a swipe never fires an accidental row activation.
- 🎛️ **Fully controllable** — imperative ref API (`reveal('left')`, `close()`), settled-position callbacks, and a `disabled`/`isActive` protocol for coordinating whole lists.

## Install

```bash
bun add @present-day/reveal-row
# or
npm i @present-day/reveal-row
```

Peer dependencies: `react`, `react-dom` (v18 or v19).

## Quick start

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

## Multiple actions per side

A side slot is a single column of any content — to show several buttons (iOS Mail-style Delete + Pin), lay them out with flex inside the slot and set `actionWidthLeft`/`actionWidthRight` to the **total** width of the group:

```tsx
<RevealRow
  actionWidthRight={176} // 2 buttons × 88px
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

**[▶ See it live in the playground](https://present-day.github.io/reveal-row/)** under "Multiple actions".

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

## Styling with classNames

All sub-elements accept class names, so styling is entirely yours:

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

## Publishing (maintainers)

Run `bun run build` to produce `dist/`. The `exports` field in `package.json` points to `dist/index.{js,mjs,d.ts}`. Push a tag to trigger the GitHub Actions publish workflow (OIDC trusted publishing — no npm token needed in secrets).

## License

[MIT](./LICENSE) © [Present Day](https://presentday.io)
