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

export const ANIMATION_PRESET = {
  none: 'none',
  quick: 'quick',
  smooth: 'smooth',
  bounce: 'bounce',
} as const

export type AnimationPreset =
  (typeof ANIMATION_PRESET)[keyof typeof ANIMATION_PRESET]

export type AnimationConfig = {
  duration: number
  easing: string
}

export const ANIMATION_PRESETS: Record<AnimationPreset, AnimationConfig> = {
  [ANIMATION_PRESET.none]: { duration: 0, easing: 'linear' },
  [ANIMATION_PRESET.quick]: { duration: 200, easing: 'ease-out' },
  [ANIMATION_PRESET.smooth]: { duration: 400, easing: 'ease-in-out' },
  [ANIMATION_PRESET.bounce]: {
    duration: 600,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
}

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
  close: (animated?: boolean | AnimationPreset | AnimationConfig) => void
  reveal: (
    position: RevealPosition,
    animated?: boolean | AnimationPreset | AnimationConfig,
  ) => void
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
  /**
   * Default animation preset for close/reveal animations when action buttons are clicked.
   * @default 'quick'
   */
  animationPreset?: AnimationPreset
  /**
   * Custom animation configuration overriding the preset.
   */
  animationConfig?: AnimationConfig
}
