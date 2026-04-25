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
    el.scrollLeft = closed
  }, [wL, wR, mode])

  useImperativeHandle(
    forwardedRef,
    () => ({
      close: () => {
        scrollToClosed()
        const p = readPosition()
        if (lastEmitted.current !== p) {
          lastEmitted.current = p
          onRevealChange?.(p)
        }
      },
      reveal: (position: RevealPosition) => {
        const el = containerRef.current
        if (!el) return
        const max = getMaxScroll(el)
        if (position === REVEAL_POSITION.center) {
          el.scrollLeft = getScrollClosed(wL, wR, max, mode)
        } else if (
          position === REVEAL_POSITION.left &&
          (mode === REVEAL_MODE.left || mode === REVEAL_MODE.both)
        ) {
          el.scrollLeft = 0
        } else if (
          position === REVEAL_POSITION.right &&
          (mode === REVEAL_MODE.right || mode === REVEAL_MODE.both)
        ) {
          el.scrollLeft = max
        } else {
          return
        }
        const p = getRevealFromScroll(el.scrollLeft, max, wL, wR, mode)
        lastEmitted.current = p
        onRevealChange?.(p)
      },
    }),
    [mode, onRevealChange, readPosition, scrollToClosed, wL, wR],
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
      style={{ flexShrink: 0, alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}
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
        ...rootScrollStyle,
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
