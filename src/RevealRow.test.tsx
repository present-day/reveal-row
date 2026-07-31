import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RevealRow } from './RevealRow'
import {
  ANIMATION_PRESET,
  REVEAL_HANDLE_POSITION,
  REVEAL_MODE,
  REVEAL_POSITION,
  type RevealRowHandle,
} from './types'

describe('RevealRow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      get: function () {
        return this._scrollWidth || 300
      },
    })
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: function () {
        return this._clientWidth || 200
      },
    })
  })

  it('renders children content', () => {
    render(
      <RevealRow>
        <div>Main content</div>
      </RevealRow>,
    )
    expect(screen.getByText('Main content')).toBeInTheDocument()
  })

  it('renders with default element type (div)', () => {
    const { container } = render(
      <RevealRow>
        <div>Content</div>
      </RevealRow>,
    )
    const rootElement = container.firstChild as HTMLElement
    expect(rootElement.tagName).toBe('DIV')
  })

  it('renders with custom element type', () => {
    const { container } = render(
      <RevealRow as="section">
        <div>Content</div>
      </RevealRow>,
    )
    const rootElement = container.firstChild as HTMLElement
    expect(rootElement.tagName).toBe('SECTION')
  })

  it('applies custom className', () => {
    const { container } = render(
      <RevealRow className="custom-class">
        <div>Content</div>
      </RevealRow>,
    )
    const rootElement = container.firstChild as HTMLElement
    expect(rootElement).toHaveClass('custom-class')
  })

  it('applies custom style', () => {
    const { container } = render(
      <RevealRow style={{ backgroundColor: 'red' }}>
        <div>Content</div>
      </RevealRow>,
    )
    const rootElement = container.firstChild as HTMLElement
    expect(rootElement.style.backgroundColor).toBe('red')
  })

  describe('reveal modes', () => {
    it('automatically determines mode as left when only left prop is provided', () => {
      const { container } = render(
        <RevealRow left={<div>Left action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toHaveAttribute('data-reveal-mode', REVEAL_MODE.left)
    })

    it('automatically determines mode as right when only right prop is provided', () => {
      const { container } = render(
        <RevealRow right={<div>Right action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toHaveAttribute('data-reveal-mode', REVEAL_MODE.right)
    })

    it('automatically determines mode as both when both left and right props are provided', () => {
      const { container } = render(
        <RevealRow
          left={<div>Left action</div>}
          right={<div>Right action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )
      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toHaveAttribute('data-reveal-mode', REVEAL_MODE.both)
    })

    it('uses explicit mode prop when provided', () => {
      const { container } = render(
        <RevealRow mode={REVEAL_MODE.left} right={<div>Right action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toHaveAttribute('data-reveal-mode', REVEAL_MODE.left)
    })
  })

  describe('left and right actions', () => {
    it('renders left action in left mode', () => {
      const { container } = render(
        <RevealRow left={<div>Left action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      expect(screen.getByText('Left action')).toBeInTheDocument()
      expect(
        container.querySelector('[data-reveal-row-left]'),
      ).toBeInTheDocument()
    })

    it('does not render left action in right mode', () => {
      const { container } = render(
        <RevealRow mode={REVEAL_MODE.right} left={<div>Left action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      expect(screen.queryByText('Left action')).not.toBeInTheDocument()
      expect(
        container.querySelector('[data-reveal-row-left]'),
      ).not.toBeInTheDocument()
    })

    it('renders right action in right mode', () => {
      const { container } = render(
        <RevealRow right={<div>Right action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      expect(screen.getByText('Right action')).toBeInTheDocument()
      expect(
        container.querySelector('[data-reveal-row-right]'),
      ).toBeInTheDocument()
    })

    it('does not render right action in left mode', () => {
      const { container } = render(
        <RevealRow mode={REVEAL_MODE.left} right={<div>Right action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      expect(screen.queryByText('Right action')).not.toBeInTheDocument()
      expect(
        container.querySelector('[data-reveal-row-right]'),
      ).not.toBeInTheDocument()
    })

    it('renders both actions in both mode', () => {
      render(
        <RevealRow
          left={<div>Left action</div>}
          right={<div>Right action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )
      expect(screen.getByText('Left action')).toBeInTheDocument()
      expect(screen.getByText('Right action')).toBeInTheDocument()
    })
  })

  describe('handle', () => {
    it('shows default handle by default', () => {
      const { container } = render(
        <RevealRow left={<div>Left action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const handle = container.querySelector('[data-reveal-row-handle]')
      expect(handle).toBeInTheDocument()
      expect(handle?.querySelector('svg')).toBeInTheDocument()
    })

    it('hides handle when showHandle is false', () => {
      const { container } = render(
        <RevealRow showHandle={false} left={<div>Left action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const handle = container.querySelector('[data-reveal-row-handle]')
      expect(handle).not.toBeInTheDocument()
    })

    it('renders custom handle when provided', () => {
      render(
        <RevealRow
          handle={<div>Custom handle</div>}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )
      expect(screen.getByText('Custom handle')).toBeInTheDocument()
    })

    it('positions handle at start by default in left mode', () => {
      const { container } = render(
        <RevealRow mode={REVEAL_MODE.left} left={<div>Left action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const mainInner = container.querySelector('[data-reveal-row-main] > div')
      const firstChild = mainInner?.firstChild as HTMLElement
      expect(firstChild).toHaveAttribute('data-reveal-row-handle')
    })

    it('positions handle at end by default in right mode', () => {
      const { container } = render(
        <RevealRow mode={REVEAL_MODE.right} right={<div>Right action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const mainInner = container.querySelector('[data-reveal-row-main] > div')
      const lastChild = mainInner?.lastChild as HTMLElement
      expect(lastChild).toHaveAttribute('data-reveal-row-handle')
    })

    it('positions handle at end by default in both mode', () => {
      const { container } = render(
        <RevealRow
          mode={REVEAL_MODE.both}
          left={<div>Left action</div>}
          right={<div>Right action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )
      const mainInner = container.querySelector('[data-reveal-row-main] > div')
      const lastChild = mainInner?.lastChild as HTMLElement
      expect(lastChild).toHaveAttribute('data-reveal-row-handle')
    })

    it('uses explicit handle position when provided', () => {
      const { container } = render(
        <RevealRow
          handlePosition={REVEAL_HANDLE_POSITION.start}
          right={<div>Right action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )
      const mainInner = container.querySelector('[data-reveal-row-main] > div')
      const firstChild = mainInner?.firstChild as HTMLElement
      expect(firstChild).toHaveAttribute('data-reveal-row-handle')
    })

    it('applies handleTitle to default handle', () => {
      const { container } = render(
        <RevealRow handleTitle="Custom title" left={<div>Left action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const handle = container.querySelector('[data-reveal-row-handle]')
      expect(handle).toHaveAttribute('title', 'Custom title')
    })

    it('does not apply title when custom handle is provided', () => {
      const { container } = render(
        <RevealRow
          handle={<div>Custom handle</div>}
          handleTitle="Custom title"
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )
      const handle = container.querySelector('[data-reveal-row-handle]')
      expect(handle).not.toHaveAttribute('title')
    })

    it('includes aria label in screen reader text', () => {
      render(
        <RevealRow
          handleAriaLabel="Custom aria label"
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )
      expect(screen.getByText('Custom aria label')).toBeInTheDocument()
    })
  })

  describe('action widths', () => {
    it('auto-sizes the left column with an 88px floor by default', () => {
      const { container } = render(
        <RevealRow left={<div>Left action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toHaveStyle({
        gridTemplateColumns: 'max-content 100%',
      })
      const leftElement = container.querySelector(
        '[data-reveal-row-left]',
      ) as HTMLElement
      expect(leftElement.style.width).toBe('')
      expect(leftElement).toHaveStyle({ minWidth: '88px' })
    })

    it('uses custom width for left action', () => {
      const { container } = render(
        <RevealRow actionWidthLeft={120} left={<div>Left action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const leftElement = container.querySelector('[data-reveal-row-left]')
      expect(leftElement).toHaveStyle({ width: '120px' })
    })

    it('auto-sizes the right column with an 88px floor by default', () => {
      const { container } = render(
        <RevealRow right={<div>Right action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toHaveStyle({
        gridTemplateColumns: '100% max-content',
      })
      const rightElement = container.querySelector(
        '[data-reveal-row-right]',
      ) as HTMLElement
      expect(rightElement.style.width).toBe('')
      expect(rightElement).toHaveStyle({ minWidth: '88px' })
    })

    it('uses custom width for right action', () => {
      const { container } = render(
        <RevealRow actionWidthRight={150} right={<div>Right action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const rightElement = container.querySelector('[data-reveal-row-right]')
      expect(rightElement).toHaveStyle({ width: '150px' })
    })
  })

  describe('disabled state', () => {
    it('applies disabled scroll styles when disabled', () => {
      const { container } = render(
        <RevealRow disabled left={<div>Left action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toHaveStyle({
        overflowX: 'hidden',
        touchAction: 'pan-y',
      })
    })

    it('applies normal scroll styles when not disabled', () => {
      const { container } = render(
        <RevealRow left={<div>Left action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toHaveStyle({
        overflowX: 'auto',
        touchAction: 'pan-x pan-y',
      })
    })
  })

  describe('classNames prop', () => {
    const classNames = {
      root: 'custom-root',
      main: 'custom-main',
      mainInner: 'custom-main-inner',
      left: 'custom-left',
      right: 'custom-right',
      handleContainer: 'custom-handle-container',
      handleIcon: 'custom-handle-icon',
    }

    it('applies custom classNames', () => {
      const { container } = render(
        <RevealRow
          classNames={classNames}
          left={<div>Left action</div>}
          right={<div>Right action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(container.firstChild).toHaveClass('custom-root')
      expect(container.querySelector('[data-reveal-row-main]')).toHaveClass(
        'custom-main',
      )
      expect(
        container.querySelector('[data-reveal-row-main] > div'),
      ).toHaveClass('custom-main-inner')
      expect(container.querySelector('[data-reveal-row-left]')).toHaveClass(
        'custom-left',
      )
      expect(container.querySelector('[data-reveal-row-right]')).toHaveClass(
        'custom-right',
      )
      expect(container.querySelector('[data-reveal-row-handle]')).toHaveClass(
        'custom-handle-container',
      )
    })

    it('applies handleIcon className to default handle icon', () => {
      const { container } = render(
        <RevealRow classNames={classNames} left={<div>Left action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const handleIcon = container.querySelector(
        '[data-reveal-row-handle] > span[aria-hidden]',
      )
      expect(handleIcon).toHaveClass('custom-handle-icon')
    })
  })

  describe('scroll behavior', () => {
    it('calls onScroll when provided', () => {
      const onScroll = vi.fn()
      const { container } = render(
        <RevealRow onScroll={onScroll} left={<div>Left action</div>}>
          <div>Content</div>
        </RevealRow>,
      )

      const rootElement = container.firstChild as HTMLElement
      fireEvent.scroll(rootElement)

      expect(onScroll).toHaveBeenCalled()
    })

    it('calls onRevealChange when scroll position changes', async () => {
      const onRevealChange = vi.fn()
      const { container } = render(
        <RevealRow
          onRevealChange={onRevealChange}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      const rootElement = container.firstChild as HTMLElement
      Object.defineProperty(rootElement, 'scrollLeft', {
        configurable: true,
        value: 50,
      })

      fireEvent.scroll(rootElement)

      // Wait for debounce timeout
      await waitFor(
        () => {
          expect(onRevealChange).toHaveBeenCalledWith(REVEAL_POSITION.center)
        },
        { timeout: 200 },
      )
    })

    it('clears existing debounce timer on subsequent scrolls', async () => {
      const onRevealChange = vi.fn()
      const { container } = render(
        <RevealRow
          onRevealChange={onRevealChange}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      const rootElement = container.firstChild as HTMLElement
      Object.defineProperty(rootElement, 'scrollLeft', {
        configurable: true,
        value: 50,
      })

      // First scroll
      fireEvent.scroll(rootElement)

      // Second scroll before debounce timeout - should clear the first timer
      fireEvent.scroll(rootElement)

      // Wait for debounce timeout
      await waitFor(
        () => {
          expect(onRevealChange).toHaveBeenCalledWith(REVEAL_POSITION.center)
        },
        { timeout: 200 },
      )

      // Should only be called once, not twice
      expect(onRevealChange).toHaveBeenCalledTimes(1)
    })

    it('sets swiped state when scrolled away from closed position', () => {
      const onClick = vi.fn()
      const { container } = render(
        <button type="button" onClick={onClick}>
          <RevealRow left={<div>Left action</div>}>
            <div>Content</div>
          </RevealRow>
        </button>,
      )

      const rootElement = container.querySelector(
        '[data-reveal-mode]',
      ) as HTMLElement
      Object.defineProperty(rootElement, 'scrollLeft', {
        configurable: true,
        value: 100, // Far from closed position (88 + restEpsilon)
      })

      fireEvent.scroll(rootElement)

      // Click should be suppressed while swipedRef is true
      fireEvent.click(rootElement, { bubbles: true })
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('click behavior', () => {
    it('prevents click propagation after swipe', async () => {
      const onClick = vi.fn()
      const { container } = render(
        <button type="button" onClick={onClick}>
          <RevealRow left={<div>Left action</div>}>
            <div>Content</div>
          </RevealRow>
        </button>,
      )

      const rootElement = container.querySelector(
        '[data-reveal-mode]',
      ) as HTMLElement

      // Simulate swipe by setting scrollLeft away from resting position
      Object.defineProperty(rootElement, 'scrollLeft', { value: 50 })
      fireEvent.scroll(rootElement)

      // Click after swipe
      fireEvent.click(rootElement, { bubbles: true })

      expect(onClick).not.toHaveBeenCalled()
    })

    it('allows clicks on action elements', () => {
      const onLeftClick = vi.fn()
      render(
        <RevealRow
          left={
            <button type="button" onClick={onLeftClick}>
              Left action
            </button>
          }
        >
          <div>Content</div>
        </RevealRow>,
      )

      const button = screen.getByText('Left action')
      fireEvent.click(button)

      expect(onLeftClick).toHaveBeenCalled()
    })
  })

  describe('multiple actions per side', () => {
    it('renders a widened column with two buttons side by side', () => {
      const { container } = render(
        <RevealRow
          actionWidthRight={176}
          right={
            <div style={{ display: 'flex', height: '100%' }}>
              <button type="button">Delete</button>
              <button type="button">Pin</button>
            </div>
          }
        >
          <div>Content</div>
        </RevealRow>,
      )

      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toHaveStyle({ gridTemplateColumns: '100% 176px' })
      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.getByText('Pin')).toBeInTheDocument()
    })

    it('delivers clicks to every action button, even after a swipe', () => {
      const onDelete = vi.fn()
      const onPin = vi.fn()
      const { container } = render(
        <RevealRow
          actionWidthRight={176}
          right={
            <div style={{ display: 'flex', height: '100%' }}>
              <button type="button" onClick={onDelete}>
                Delete
              </button>
              <button type="button" onClick={onPin}>
                Pin
              </button>
            </div>
          }
        >
          <div>Content</div>
        </RevealRow>,
      )

      const rootElement = container.querySelector(
        '[data-reveal-mode]',
      ) as HTMLElement
      Object.defineProperty(rootElement, 'scrollLeft', { value: 100 })
      fireEvent.scroll(rootElement)

      fireEvent.click(screen.getByText('Delete'))
      fireEvent.click(screen.getByText('Pin'))

      expect(onDelete).toHaveBeenCalledTimes(1)
      expect(onPin).toHaveBeenCalledTimes(1)
    })

    it('reveal("right") snaps the full multi-button column into view', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      const { container } = render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          actionWidthRight={176}
          right={
            <div style={{ display: 'flex', height: '100%' }}>
              <button type="button">Delete</button>
              <button type="button">Pin</button>
            </div>
          }
        >
          <div>Content</div>
        </RevealRow>,
      )

      const rootElement = container.firstChild as HTMLElement
      let scrollLeft = 0
      Object.defineProperty(rootElement, 'scrollLeft', {
        configurable: true,
        get: () => scrollLeft,
        set: (v: number) => {
          scrollLeft = v
        },
      })

      handle.current?.reveal(REVEAL_POSITION.right, false)

      // maxScroll = scrollWidth (300) - clientWidth (200)
      expect(scrollLeft).toBe(100)
    })
  })

  describe('focus-driven reveal', () => {
    function renderFocusRow() {
      const utils = render(
        <RevealRow
          animationPreset={ANIMATION_PRESET.none}
          right={<button type="button">Delete</button>}
        >
          <div>Content</div>
        </RevealRow>,
      )
      const rootElement = utils.container.firstChild as HTMLElement
      let scrollLeft = 0
      Object.defineProperty(rootElement, 'scrollLeft', {
        configurable: true,
        get: () => scrollLeft,
        set: (v: number) => {
          scrollLeft = v
        },
      })
      return { ...utils, rootElement, getScrollLeft: () => scrollLeft }
    }

    it('snaps the action column into view when an action receives focus', () => {
      const { getScrollLeft } = renderFocusRow()

      fireEvent.focus(screen.getByText('Delete'))

      // maxScroll = scrollWidth (300) - clientWidth (200)
      expect(getScrollLeft()).toBe(100)
    })

    it('closes a focus-initiated reveal when focus leaves the row', () => {
      const { getScrollLeft } = renderFocusRow()
      const button = screen.getByText('Delete')

      fireEvent.focus(button)
      expect(getScrollLeft()).toBe(100)

      fireEvent.blur(button, { relatedTarget: document.body })
      expect(getScrollLeft()).toBe(0)
    })

    it('does not close a swipe-opened row on focus loss', () => {
      const { rootElement, getScrollLeft } = renderFocusRow()

      rootElement.scrollLeft = 100
      fireEvent.scroll(rootElement)

      fireEvent.blur(rootElement, { relatedTarget: document.body })
      expect(getScrollLeft()).toBe(100)
    })

    it('keeps a focus-initiated reveal open while focus moves within the row', () => {
      const { rootElement, getScrollLeft } = renderFocusRow()
      const button = screen.getByText('Delete')

      fireEvent.focus(button)
      fireEvent.blur(button, { relatedTarget: rootElement })
      expect(getScrollLeft()).toBe(100)
    })
  })

  describe('reduced motion', () => {
    it('makes preset animations instant under prefers-reduced-motion', () => {
      const originalMatchMedia = window.matchMedia
      window.matchMedia = vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as typeof window.matchMedia

      try {
        const handle: { current: RevealRowHandle | null } = { current: null }
        const { container } = render(
          <RevealRow
            ref={(ref) => {
              handle.current = ref
            }}
            right={<button type="button">Delete</button>}
          >
            <div>Content</div>
          </RevealRow>,
        )
        const rootElement = container.firstChild as HTMLElement
        let scrollLeft = 0
        Object.defineProperty(rootElement, 'scrollLeft', {
          configurable: true,
          get: () => scrollLeft,
          set: (v: number) => {
            scrollLeft = v
          },
        })

        // 'smooth' is normally a 400ms raf animation; reduced motion makes it
        // land synchronously.
        handle.current?.reveal(REVEAL_POSITION.right, ANIMATION_PRESET.smooth)
        expect(scrollLeft).toBe(100)
      } finally {
        window.matchMedia = originalMatchMedia
      }
    })
  })

  describe('animation robustness', () => {
    it('completes animated scrolls even when rAF never fires (hidden page)', () => {
      vi.useFakeTimers()
      const rafSpy = vi
        .spyOn(window, 'requestAnimationFrame')
        .mockReturnValue(1)
      try {
        const handle: { current: RevealRowHandle | null } = { current: null }
        const { container } = render(
          <RevealRow
            ref={(ref) => {
              handle.current = ref
            }}
            right={<button type="button">Delete</button>}
          >
            <div>Content</div>
          </RevealRow>,
        )
        const rootElement = container.firstChild as HTMLElement
        let scrollLeft = 0
        Object.defineProperty(rootElement, 'scrollLeft', {
          configurable: true,
          get: () => scrollLeft,
          set: (v: number) => {
            scrollLeft = v
          },
        })

        handle.current?.reveal(REVEAL_POSITION.right, ANIMATION_PRESET.smooth)
        // rAF is dead; the finalize timer (duration + 100ms) must land the
        // scroll and restore snap.
        vi.advanceTimersByTime(600)
        expect(scrollLeft).toBe(100)
        expect(rootElement.style.scrollSnapType).toBe('x mandatory')
      } finally {
        rafSpy.mockRestore()
        vi.useRealTimers()
      }
    })
  })

  describe('single-axis overflow', () => {
    it('pins overflow-y to hidden so rows only scroll horizontally', () => {
      const { container } = render(
        <RevealRow right={<div>Right action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toHaveStyle({
        overflowX: 'auto',
        overflowY: 'hidden',
      })
    })
  })

  describe('data-reveal-position', () => {
    it('starts at center and reflects the settled position', async () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      const { container } = render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          animationPreset={ANIMATION_PRESET.none}
          right={<button type="button">Delete</button>}
        >
          <div>Content</div>
        </RevealRow>,
      )
      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toHaveAttribute('data-reveal-position', 'center')

      handle.current?.reveal(REVEAL_POSITION.right)

      await waitFor(() =>
        expect(rootElement).toHaveAttribute('data-reveal-position', 'right'),
      )
    })
  })

  describe('imperative API', () => {
    it('exposes close method through ref', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(handle).toBeTruthy()
      expect(typeof handle.current?.close).toBe('function')
      expect(typeof handle.current?.reveal).toBe('function')
    })

    it('close method can be called without error', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle.current?.close()).not.toThrow()
    })

    it('reveal method can reveal left position', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle.current?.reveal(REVEAL_POSITION.left)).not.toThrow()
    })

    it('reveal method can reveal right position', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          right={<div>Right action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle.current?.reveal(REVEAL_POSITION.right)).not.toThrow()
    })

    it('reveal method can reveal center position', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle.current?.reveal(REVEAL_POSITION.center)).not.toThrow()
    })

    it('reveal method ignores invalid positions for mode', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          mode={REVEAL_MODE.left}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle.current?.reveal(REVEAL_POSITION.right)).not.toThrow()
    })
  })

  describe('animation', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.spyOn(performance, 'now').mockReturnValue(0)
    })

    afterEach(() => {
      vi.useRealTimers()
      vi.restoreAllMocks()
    })

    it('uses default animation preset', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle.current?.close()).not.toThrow()
    })

    it('accepts custom animation preset', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          animationPreset={ANIMATION_PRESET.smooth}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle.current?.close()).not.toThrow()
    })

    it('accepts custom animation config', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          animationConfig={{ duration: 500, easing: 'linear' }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle.current?.close()).not.toThrow()
    })

    it('handles zero duration animation', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      const { container } = render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      const rootElement = container.firstChild as HTMLElement
      const scrollToSpy = vi.fn()
      let scrollLeftValue = 0
      Object.defineProperty(rootElement, 'scrollLeft', {
        configurable: true,
        get: () => scrollLeftValue,
        set: (value: number) => {
          scrollLeftValue = value
          scrollToSpy(value)
        },
      })

      handle.current?.close(false) // No animation

      expect(scrollToSpy).toHaveBeenCalled()
    })

    it('handles animated close with preset', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle.current?.close(ANIMATION_PRESET.quick)).not.toThrow()
    })

    it('handles animated reveal with custom config', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() =>
        handle.current?.reveal(REVEAL_POSITION.left, {
          duration: 300,
          easing: 'ease-in',
        }),
      ).not.toThrow()
    })

    it('handles cubic-bezier easing animation', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() =>
        handle.current?.close({
          duration: 100,
          easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        }),
      ).not.toThrow()
    })

    it('handles other cubic-bezier easing animation', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() =>
        handle.current?.close({
          duration: 100,
          easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        }),
      ).not.toThrow()
    })

    it('calls onRevealChange after animated reveal completes', () => {
      const onRevealChange = vi.fn()
      const handle: { current: RevealRowHandle | null } = { current: null }

      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          onRevealChange={onRevealChange}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      onRevealChange.mockClear()

      handle.current?.reveal(REVEAL_POSITION.left, {
        duration: 10,
        easing: 'linear',
      })

      // Fast forward time to complete animation
      vi.advanceTimersByTime(20)

      expect(onRevealChange).toHaveBeenCalledWith(REVEAL_POSITION.left)
    })

    it('calls onRevealChange after animated close completes', () => {
      const onRevealChange = vi.fn()
      const handle: { current: RevealRowHandle | null } = { current: null }

      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          onRevealChange={onRevealChange}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      onRevealChange.mockClear()

      handle.current?.close({ duration: 10, easing: 'linear' })

      // Fast forward time to complete animation
      vi.advanceTimersByTime(20)

      expect(onRevealChange).toHaveBeenCalled()
    })
  })

  describe('grid layout', () => {
    it('sets correct grid template for left mode', () => {
      const { container } = render(
        <RevealRow mode={REVEAL_MODE.left} left={<div>Left action</div>}>
          <div>Content</div>
        </RevealRow>,
      )

      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toHaveStyle({
        gridTemplateColumns: 'max-content 100%',
      })
    })

    it('sets correct grid template for right mode', () => {
      const { container } = render(
        <RevealRow mode={REVEAL_MODE.right} right={<div>Right action</div>}>
          <div>Content</div>
        </RevealRow>,
      )

      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toHaveStyle({
        gridTemplateColumns: '100% max-content',
      })
    })

    it('sets correct grid template for both mode', () => {
      const { container } = render(
        <RevealRow
          mode={REVEAL_MODE.both}
          left={<div>Left action</div>}
          right={<div>Right action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toHaveStyle({
        gridTemplateColumns: 'max-content 100% max-content',
      })
    })

    it('uses custom action widths in grid template', () => {
      const { container } = render(
        <RevealRow
          mode={REVEAL_MODE.both}
          actionWidthLeft={100}
          actionWidthRight={120}
          left={<div>Left action</div>}
          right={<div>Right action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toHaveStyle({
        gridTemplateColumns: '100px 100% 120px',
      })
    })
  })

  describe('effects', () => {
    it('resets when disabled and resetWhenDisabled is true', () => {
      const onRevealChange = vi.fn()
      const { rerender } = render(
        <RevealRow
          onRevealChange={onRevealChange}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      onRevealChange.mockClear()

      rerender(
        <RevealRow
          disabled
          resetWhenDisabled
          onRevealChange={onRevealChange}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(onRevealChange).toHaveBeenCalled()
    })

    it('does not reset when disabled and resetWhenDisabled is false', () => {
      const onRevealChange = vi.fn()
      const { rerender } = render(
        <RevealRow
          onRevealChange={onRevealChange}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      onRevealChange.mockClear()

      rerender(
        <RevealRow
          disabled
          resetWhenDisabled={false}
          onRevealChange={onRevealChange}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(onRevealChange).not.toHaveBeenCalled()
    })

    it('resets when isActive becomes true', () => {
      const onRevealChange = vi.fn()
      const { rerender } = render(
        <RevealRow
          onRevealChange={onRevealChange}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      onRevealChange.mockClear()

      rerender(
        <RevealRow
          isActive
          onRevealChange={onRevealChange}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(onRevealChange).toHaveBeenCalled()
    })
  })

  describe('utility functions and edge cases', () => {
    it('handles invalid duration in animation config', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() =>
        handle.current?.close({ duration: NaN, easing: 'linear' }),
      ).not.toThrow()

      expect(() =>
        handle.current?.close({ duration: -100, easing: 'linear' }),
      ).not.toThrow()
    })

    it('handles component unmount cleanup', () => {
      const { unmount } = render(
        <RevealRow left={<div>Left action</div>}>
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => unmount()).not.toThrow()
    })

    it('handles missing container ref in callbacks', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      const { unmount } = render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      // Unmount component to test null checks
      unmount()

      expect(() => handle.current?.close()).not.toThrow()
      expect(() => handle.current?.reveal(REVEAL_POSITION.left)).not.toThrow()
    })

    it('handles animation with zero or invalid progress', () => {
      const handle: { current: RevealRowHandle | null } = { current: null }
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1000) // Very large elapsed time

      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() =>
        handle.current?.close({ duration: 10, easing: 'linear' }),
      ).not.toThrow()
    })

    it('handles layout effect for right mode', () => {
      const { container } = render(
        <RevealRow mode={REVEAL_MODE.right} right={<div>Right action</div>}>
          <div>Content</div>
        </RevealRow>,
      )

      // Should not set scrollLeft for right mode
      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toBeInTheDocument()
    })

    it('handles action clicks without click prevention', () => {
      const onLeftClick = vi.fn()
      const onRightClick = vi.fn()
      render(
        <RevealRow
          left={
            <button type="button" onClick={onLeftClick}>
              Left
            </button>
          }
          right={
            <button type="button" onClick={onRightClick}>
              Right
            </button>
          }
        >
          <div>Content</div>
        </RevealRow>,
      )

      fireEvent.click(screen.getByText('Left'))
      fireEvent.click(screen.getByText('Right'))

      expect(onLeftClick).toHaveBeenCalled()
      expect(onRightClick).toHaveBeenCalled()
    })

    it('handles cx function with undefined values', () => {
      render(
        <RevealRow
          className={undefined}
          classNames={{ root: undefined }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(screen.getByText('Left action')).toBeInTheDocument()
    })

    it('handles animation with different easing types', () => {
      vi.useFakeTimers()

      const handle: { current: RevealRowHandle | null } = { current: null }
      render(
        <RevealRow
          ref={(ref) => {
            handle.current = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() =>
        handle.current?.close({ duration: 10, easing: 'ease-out' }),
      ).not.toThrow()
      vi.advanceTimersByTime(15)

      expect(() =>
        handle.current?.close({ duration: 10, easing: 'ease-in-out' }),
      ).not.toThrow()
      vi.advanceTimersByTime(15)

      expect(() =>
        handle.current?.close({ duration: 10, easing: 'linear' }),
      ).not.toThrow()
      vi.advanceTimersByTime(15)

      vi.useRealTimers()
    })
  })
})
