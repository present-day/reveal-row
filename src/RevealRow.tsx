'use client'

import type { CSSProperties, ForwardedRef, MouseEvent, UIEvent } from 'react'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react'

import { DefaultHandleIcon } from './DefaultHandleIcon'
import { getRevealFromScroll, getScrollClosed } from './getRevealFromScroll'
import {
  ANIMATION_PRESET,
  ANIMATION_PRESETS,
  type AnimationConfig,
  type AnimationPreset,
  REVEAL_HANDLE_POSITION,
  REVEAL_MODE,
  REVEAL_POSITION,
  type RevealHandlePosition,
  type RevealMode,
  type RevealPosition,
  type RevealRowClassNames,
  type RevealRowHandle,
  type RevealRowProps,
} from './types'

function cx(...parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

function getMaxScroll(el: HTMLDivElement) {
  return Math.max(0, el.scrollWidth - el.clientWidth)
}

function resolveMode(
  left: RevealRowProps['left'],
  right: RevealRowProps['right'],
  mode: RevealMode | undefined,
): RevealMode {
  if (mode) return mode
  if (left != null && right != null) return REVEAL_MODE.both
  if (left != null) return REVEAL_MODE.left
  return REVEAL_MODE.right
}

function resolveAnimationConfig(
  animated: boolean | AnimationPreset | AnimationConfig | undefined,
  defaultPreset: AnimationPreset,
  customConfig?: AnimationConfig,
): AnimationConfig {
  if (animated === false) {
    return ANIMATION_PRESETS[ANIMATION_PRESET.none]
  }
  if (animated === true || animated === undefined) {
    return customConfig || ANIMATION_PRESETS[defaultPreset]
  }
  if (typeof animated === 'string') {
    return ANIMATION_PRESETS[animated]
  }
  return animated
}

const SCROLL_REVEAL_DEBOUNCE_MS = 64
const restEpsilon = 2

const rootScrollStyle: CSSProperties = {
  display: 'grid',
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  scrollbarWidth: 'none',
  WebkitOverflowScrolling: 'touch',
  overscrollBehaviorX: 'contain',
  touchAction: 'pan-x pan-y',
}

const rootScrollStyleDisabled: CSSProperties = {
  ...rootScrollStyle,
  overflowX: 'hidden',
  touchAction: 'pan-y',
}

const snapStart: CSSProperties = { scrollSnapAlign: 'start' }
const snapEnd: CSSProperties = { scrollSnapAlign: 'end' }

type InnerProps = RevealRowProps & {
  forwardedRef: ForwardedRef<RevealRowHandle>
}

function RevealRowInner({
  children,
  left,
  right,
  mode: modeProp,
  actionWidthLeft: wLIn,
  actionWidthRight: wRIn,
  classNames = {} as RevealRowClassNames,
  showHandle = true,
  handle: handleOverride,
  handlePosition: handlePositionProp,
  handleTitle = 'Drag horizontally to show actions',
  handleAriaLabel = 'Drag horizontally to show actions',
  onRevealChange,
  onScroll: onScrollProp,
  resetWhenDisabled = true,
  disabled = false,
  isActive = false,
  className,
  style,
  animationPreset = ANIMATION_PRESET.quick,
  animationConfig,
  forwardedRef,
}: InnerProps) {
  const mode = resolveMode(left, right, modeProp)
  const hasL = mode === REVEAL_MODE.left || mode === REVEAL_MODE.both
  const hasR = mode === REVEAL_MODE.right || mode === REVEAL_MODE.both
  const wL = hasL ? (wLIn ?? 88) : 0
  const wR = hasR ? (wRIn ?? 88) : 0

  const handlePosition: RevealHandlePosition =
    handlePositionProp ??
    (mode === REVEAL_MODE.left
      ? REVEAL_HANDLE_POSITION.start
      : REVEAL_HANDLE_POSITION.end)

  const containerRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const lastEmitted = useRef<RevealPosition | null>(null)
  const swipedRef = useRef(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasAppliedInitialScroll = useRef(false)
  const isAnimatingRef = useRef(false)
  const rafIdRef = useRef<number | null>(null)
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const readPosition = useCallback((): RevealPosition => {
    const el = containerRef.current
    if (!el) return REVEAL_POSITION.center
    return getRevealFromScroll(el.scrollLeft, getMaxScroll(el), wL, wR, mode)
  }, [wL, wR, mode])

  const emitReveal = useCallback(
    (position: RevealPosition) => {
      if (lastEmitted.current === position) return
      lastEmitted.current = position
      onRevealChange?.(position)
    },
    [onRevealChange],
  )

  const scrollToClosed = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const m = getMaxScroll(el)
    const closed = getScrollClosed(wL, wR, m, mode)

    // For immediate scroll, we can use the default behavior
    // CSS scroll snap will handle the final positioning
    el.scrollLeft = closed
  }, [wL, wR, mode])

  const scrollToPosition = useCallback(
    (targetScrollLeft: number, animationOptions: AnimationConfig) => {
      const el = containerRef.current
      if (!el) return

      const { duration, easing } = animationOptions

      // Clamp and normalize duration
      const clampedDuration =
        Number.isFinite(duration) && duration > 0 ? duration : 0

      if (clampedDuration === 0) {
        el.scrollLeft = targetScrollLeft
        return
      }

      // Cancel any existing animation
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      if (settleTimerRef.current !== null) {
        clearTimeout(settleTimerRef.current)
        settleTimerRef.current = null
      }

      // Disable scroll snap during animation
      isAnimatingRef.current = true
      const originalScrollSnapType = el.style.scrollSnapType
      el.style.scrollSnapType = 'none'

      const startScrollLeft = el.scrollLeft
      const distance = targetScrollLeft - startScrollLeft
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / clampedDuration, 1)

        let easedProgress = progress
        if (easing === 'ease-out') {
          easedProgress = 1 - (1 - progress) ** 2
        } else if (easing === 'ease-in-out') {
          easedProgress =
            progress < 0.5
              ? 2 * progress * progress
              : 1 - (-2 * progress + 2) ** 2 / 2
        } else if (easing.startsWith('cubic-bezier')) {
          // For the bounce effect, we'll use a simplified approximation
          easedProgress = progress * progress * (3 - 2 * progress)
          if (easing.includes('-0.55')) {
            // Bounce effect approximation
            easedProgress =
              progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - (-2 * progress + 2) ** 3 / 2
            // Add overshoot for bounce
            if (progress > 0.7 && progress < 1) {
              easedProgress +=
                Math.sin((progress - 0.7) * Math.PI * 10) * 0.1 * (1 - progress)
            }
          }
        }

        el.scrollLeft = startScrollLeft + distance * easedProgress

        if (progress < 1) {
          rafIdRef.current = requestAnimationFrame(animate)
        } else {
          el.scrollLeft = targetScrollLeft
          // Re-enable scroll snap after animation completes
          el.style.scrollSnapType = originalScrollSnapType || 'x mandatory'
          isAnimatingRef.current = false
          rafIdRef.current = null
        }
      }

      rafIdRef.current = requestAnimationFrame(animate)
    },
    [],
  )

  useImperativeHandle(
    forwardedRef,
    () => ({
      close: (animated?: boolean | AnimationPreset | AnimationConfig) => {
        const el = containerRef.current
        if (!el) return

        const m = getMaxScroll(el)
        const closed = getScrollClosed(wL, wR, m, mode)
        const animConfig = resolveAnimationConfig(
          animated,
          animationPreset,
          animationConfig,
        )

        scrollToPosition(closed, animConfig)

        // Update position after animation or immediately if no animation
        const delay = animConfig.duration > 0 ? animConfig.duration : 0
        if (settleTimerRef.current !== null) {
          clearTimeout(settleTimerRef.current)
        }
        settleTimerRef.current = setTimeout(() => {
          const p = readPosition()
          if (lastEmitted.current !== p) {
            lastEmitted.current = p
            onRevealChange?.(p)
          }
          settleTimerRef.current = null
        }, delay)
      },
      reveal: (
        position: RevealPosition,
        animated?: boolean | AnimationPreset | AnimationConfig,
      ) => {
        const el = containerRef.current
        if (!el) return
        const max = getMaxScroll(el)

        let targetScroll: number
        if (position === REVEAL_POSITION.center) {
          targetScroll = getScrollClosed(wL, wR, max, mode)
        } else if (
          position === REVEAL_POSITION.left &&
          (mode === REVEAL_MODE.left || mode === REVEAL_MODE.both)
        ) {
          targetScroll = 0
        } else if (
          position === REVEAL_POSITION.right &&
          (mode === REVEAL_MODE.right || mode === REVEAL_MODE.both)
        ) {
          targetScroll = max
        } else {
          return
        }

        const animConfig = resolveAnimationConfig(
          animated,
          animationPreset,
          animationConfig,
        )
        scrollToPosition(targetScroll, animConfig)

        // Update position after animation or immediately if no animation
        const delay = animConfig.duration > 0 ? animConfig.duration : 0
        if (settleTimerRef.current !== null) {
          clearTimeout(settleTimerRef.current)
        }
        settleTimerRef.current = setTimeout(() => {
          const p = getRevealFromScroll(targetScroll, max, wL, wR, mode)
          lastEmitted.current = p
          onRevealChange?.(p)
          settleTimerRef.current = null
        }, delay)
      },
    }),
    [
      mode,
      onRevealChange,
      readPosition,
      scrollToPosition,
      wL,
      wR,
      animationPreset,
      animationConfig,
    ],
  )

  useLayoutEffect(() => {
    if (mode === REVEAL_MODE.right) {
      return
    }
    const el = containerRef.current
    if (!el) return
    if (!hasAppliedInitialScroll.current) {
      el.scrollLeft = wL
      hasAppliedInitialScroll.current = true
    }
  }, [mode, wL])

  useEffect(() => {
    if (disabled && resetWhenDisabled) {
      hasAppliedInitialScroll.current = true
      scrollToClosed()
      emitReveal(readPosition())
    }
  }, [disabled, emitReveal, readPosition, resetWhenDisabled, scrollToClosed])

  useEffect(() => {
    if (isActive) {
      hasAppliedInitialScroll.current = true
      scrollToClosed()
      emitReveal(readPosition())
    }
  }, [emitReveal, isActive, readPosition, scrollToClosed])

  useEffect(
    () => () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
      if (settleTimerRef.current !== null) {
        clearTimeout(settleTimerRef.current)
      }
    },
    [],
  )

  const handleScroll = useCallback(
    (e: UIEvent<HTMLDivElement>) => {
      onScrollProp?.(e)
      const el = containerRef.current
      if (!el) return
      const m = getMaxScroll(el)
      const pos = getRevealFromScroll(el.scrollLeft, m, wL, wR, mode)
      const closed = getScrollClosed(wL, wR, m, mode)
      if (Math.abs(el.scrollLeft - closed) > restEpsilon) {
        swipedRef.current = true
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      debounceTimer.current = setTimeout(() => {
        debounceTimer.current = null
        emitReveal(pos)
      }, SCROLL_REVEAL_DEBOUNCE_MS)
    },
    [emitReveal, mode, onScrollProp, wL, wR],
  )

  const onClickCapture = useCallback((e: MouseEvent) => {
    const t = e.target as Node | null
    if (t) {
      if (leftRef.current?.contains(t) || rightRef.current?.contains(t)) {
        return
      }
    }
    if (swipedRef.current) {
      e.preventDefault()
      e.stopPropagation()
      swipedRef.current = false
    }
  }, [])

  // `100%` for the main track (not `1fr`) so total row width > viewport: otherwise both
  // columns can shrink to fit with no overflow and the action stays visible.
  const gridTemplateColumns =
    mode === REVEAL_MODE.right
      ? `100% ${wR}px`
      : mode === REVEAL_MODE.left
        ? `${wL}px 100%`
        : `${wL}px 100% ${wR}px`

  const handleContent = showHandle ? (
    handleOverride !== undefined ? (
      handleOverride
    ) : (
      <>
        <span
          className="sr-only"
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            border: 0,
          }}
        >
          {handleAriaLabel}
        </span>
        <span className={classNames.handleIcon} aria-hidden>
          <DefaultHandleIcon />
        </span>
      </>
    )
  ) : null

  const handleStrip = showHandle ? (
    <div
      role="presentation"
      className={classNames.handleContainer}
      data-reveal-row-handle
      style={{
        flexShrink: 0,
        alignSelf: 'stretch',
        display: 'flex',
        alignItems: 'center',
      }}
      title={handleOverride === undefined ? handleTitle : undefined}
    >
      {handleContent}
    </div>
  ) : null

  const mainColumn = (
    <div
      className={classNames.main}
      data-reveal-row-main
      style={{
        ...snapStart,
        minWidth: 0,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        className={classNames.mainInner}
        style={{
          display: 'flex',
          minWidth: 0,
          width: '100%',
          alignItems: 'flex-start',
        }}
      >
        {handlePosition === REVEAL_HANDLE_POSITION.start && handleStrip}
        <div style={{ minWidth: 0, flex: 1, flexBasis: 0 }}>{children}</div>
        {handlePosition === REVEAL_HANDLE_POSITION.end && handleStrip}
      </div>
    </div>
  )

  return (
    <div
      ref={containerRef}
      data-reveal-mode={mode}
      className={cx(classNames.root, className)}
      onScroll={handleScroll}
      onClickCapture={onClickCapture}
      style={{
        ...(disabled ? rootScrollStyleDisabled : rootScrollStyle),
        ...style,
        gridTemplateColumns,
      }}
    >
      {hasL ? (
        <div
          ref={leftRef}
          className={classNames.left}
          data-reveal-row-left
          style={{ ...snapStart, minWidth: 0, width: wL }}
        >
          {left}
        </div>
      ) : null}
      {mainColumn}
      {hasR ? (
        <div
          ref={rightRef}
          className={classNames.right}
          data-reveal-row-right
          style={{ ...snapEnd, minWidth: 0, width: wR }}
        >
          {right}
        </div>
      ) : null}
    </div>
  )
}

export const RevealRow = forwardRef<RevealRowHandle, RevealRowProps>(
  function RevealRow(props, ref) {
    return <RevealRowInner {...props} forwardedRef={ref} />
  },
)
