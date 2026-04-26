import { describe, expect, it } from 'vitest'

import { getRevealFromScroll, getScrollClosed } from './getRevealFromScroll'
import { REVEAL_MODE, REVEAL_POSITION } from './types'

describe('getRevealFromScroll', () => {
  it('right: center near 0, right after half width', () => {
    const wR = 88
    const max = 80
    expect(getRevealFromScroll(0, max, 0, wR, REVEAL_MODE.right)).toBe(
      REVEAL_POSITION.center,
    )
    expect(getRevealFromScroll(44, max, 0, wR, REVEAL_MODE.right)).toBe(
      REVEAL_POSITION.right,
    )
  })

  it('left: left at 0, center after half', () => {
    const wL = 88
    const max = 80
    expect(getRevealFromScroll(0, max, wL, 0, REVEAL_MODE.left)).toBe(
      REVEAL_POSITION.left,
    )
    expect(getRevealFromScroll(44, max, wL, 0, REVEAL_MODE.left)).toBe(
      REVEAL_POSITION.center,
    )
  })

  it('both: left, center, right', () => {
    const wL = 50
    const wR = 50
    const max = 200
    expect(getRevealFromScroll(0, max, wL, wR, REVEAL_MODE.both)).toBe(
      REVEAL_POSITION.left,
    )
    expect(getRevealFromScroll(100, max, wL, wR, REVEAL_MODE.both)).toBe(
      REVEAL_POSITION.center,
    )
    expect(getRevealFromScroll(200, max, wL, wR, REVEAL_MODE.both)).toBe(
      REVEAL_POSITION.right,
    )
  })

  it('right: returns center when maxScroll is 0', () => {
    expect(getRevealFromScroll(0, 0, 0, 88, REVEAL_MODE.right)).toBe(
      REVEAL_POSITION.center,
    )
  })

  it('left: returns center when maxScroll is 0', () => {
    expect(getRevealFromScroll(0, 0, 88, 0, REVEAL_MODE.left)).toBe(
      REVEAL_POSITION.center,
    )
  })

  it('both: returns center when maxScroll is 0', () => {
    expect(getRevealFromScroll(0, 0, 50, 50, REVEAL_MODE.both)).toBe(
      REVEAL_POSITION.center,
    )
  })
})

describe('getScrollClosed', () => {
  it('returns 0 for right mode', () => {
    expect(getScrollClosed(88, 50, 200, REVEAL_MODE.right)).toBe(0)
  })

  it('returns wL for left mode', () => {
    expect(getScrollClosed(88, 50, 200, REVEAL_MODE.left)).toBe(88)
  })

  it('returns wL for both mode', () => {
    expect(getScrollClosed(88, 50, 200, REVEAL_MODE.both)).toBe(88)
  })
})
