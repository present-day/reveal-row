import type { CSSProperties, ReactNode, UIEvent } from 'react'

export const REVEAL_MODE = {
  left: 'left',
  right: 'right',
  both: 'both',
} as const

export type RevealMode = (typeof REVEAL_MODE)[keyof typeof REVEAL_MODE]

export const REVEAL_POSITION = {
  left: 'left',
  center: 'center',
  right: 'right',
} as const

export type RevealPosition =
  (typeof REVEAL_POSITION)[keyof typeof REVEAL_POSITION]

export const REVEAL_HANDLE_POSITION = {
  start: 'start',
  end: 'end',
} as const

export type RevealHandlePosition =
  (typeof REVEAL_HANDLE_POSITION)[keyof typeof REVEAL_HANDLE_POSITION]

export type RevealRowClassNames = {
  root?: string
  main?: string
  mainInner?: string
  left?: string
  right?: string
  handleContainer?: string
  handleIcon?: string
}

export type RevealRowHandle = {
  close: () => void
  reveal: (position: RevealPosition) => void
}

export type RevealRowProps = {
  /** Primary row content (e.g. title, subtitle). */
  children: ReactNode
  /** Optional leading action column (e.g. delete). Omitted in `right` mode. */
  left?: ReactNode
  /**
   * Trailing action column (e.g. add). Omitted in `left` mode.
   */
  right?: ReactNode
  /**
   * If both `left` and `right` are set, defaults to `both`. If only one side,
   * mode is derived unless overridden.
   */
  mode?: RevealMode
  actionWidthLeft?: number
  actionWidthRight?: number
  classNames?: RevealRowClassNames
  /** @default true */
  showHandle?: boolean
  /** Replaces the built-in drag affordance. */
  handle?: ReactNode
  /**
   * Where the handle sits in the main row. Default: `start` in `left` mode,
   * `end` otherwise.
   */
  handlePosition?: RevealHandlePosition
  handleTitle?: string
  /** Shown in screen-reader text when using the default drag handle. */
  handleAriaLabel?: string
  /** Fires when the settled position changes. */
  onRevealChange?: (position: RevealPosition) => void
  onScroll?: (event: UIEvent<HTMLDivElement>) => void
  /** Resets to closed; default true. */
  resetWhenDisabled?: boolean
  disabled?: boolean
  /**
   * When true, snaps back to the closed position (e.g. row became active/selected
   * elsewhere in the list).
   */
  isActive?: boolean
  className?: string
  style?: CSSProperties
}
