import {
  REVEAL_MODE,
  REVEAL_POSITION,
  type RevealMode,
  type RevealPosition,
} from './types'

/**
 * Map horizontal scroll position to a logical "revealed" state.
 * `wL` / `wR` are the fixed action column widths; `maxScroll` is
 * `Math.max(0, scrollWidth - clientWidth)`.
 */
export function getRevealFromScroll(
  scrollLeft: number,
  maxScroll: number,
  wL: number,
  wR: number,
  mode: RevealMode,
): RevealPosition {
  if (mode === REVEAL_MODE.right) {
    if (maxScroll <= 0) return REVEAL_POSITION.center
    return scrollLeft < wR / 2 ? REVEAL_POSITION.center : REVEAL_POSITION.right
  }
  if (mode === REVEAL_MODE.left) {
    if (maxScroll <= 0) return REVEAL_POSITION.center
    return scrollLeft < wL / 2 ? REVEAL_POSITION.left : REVEAL_POSITION.center
  }
  if (maxScroll <= 0) return REVEAL_POSITION.center
  if (scrollLeft < wL / 2) return REVEAL_POSITION.left
  if (scrollLeft > maxScroll - wR / 2) return REVEAL_POSITION.right
  return REVEAL_POSITION.center
}

/** "Closed" / resting scrollLeft for a mode (main panel only). */
export function getScrollClosed(
  wL: number,
  _wR: number,
  _maxScroll: number,
  mode: RevealMode,
): number {
  if (mode === REVEAL_MODE.right) return 0
  return wL
}
