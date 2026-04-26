import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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
    it('uses default width for left action (88px)', () => {
      const { container } = render(
        <RevealRow left={<div>Left action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const leftElement = container.querySelector('[data-reveal-row-left]')
      expect(leftElement).toHaveStyle({ width: '88px' })
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

    it('uses default width for right action (88px)', () => {
      const { container } = render(
        <RevealRow right={<div>Right action</div>}>
          <div>Content</div>
        </RevealRow>,
      )
      const rightElement = container.querySelector('[data-reveal-row-right]')
      expect(rightElement).toHaveStyle({ width: '88px' })
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
      const { container } = render(
        <RevealRow left={<div>Left action</div>}>
          <div>Content</div>
        </RevealRow>,
      )

      const rootElement = container.firstChild as HTMLElement
      Object.defineProperty(rootElement, 'scrollLeft', {
        configurable: true,
        value: 100, // Far from closed position (88 + restEpsilon)
      })

      fireEvent.scroll(rootElement)

      // Should not throw - this tests the swipedRef.current = true branch
      expect(() => fireEvent.click(rootElement)).not.toThrow()
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

  describe('imperative API', () => {
    it('exposes close method through ref', () => {
      let handle: RevealRowHandle | null = null
      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(handle).toBeTruthy()
      expect(typeof handle?.close).toBe('function')
      expect(typeof handle?.reveal).toBe('function')
    })

    it('close method can be called without error', () => {
      let handle: RevealRowHandle | null = null
      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle?.close()).not.toThrow()
    })

    it('reveal method can reveal left position', () => {
      let handle: RevealRowHandle | null = null
      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle?.reveal(REVEAL_POSITION.left)).not.toThrow()
    })

    it('reveal method can reveal right position', () => {
      let handle: RevealRowHandle | null = null
      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          right={<div>Right action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle?.reveal(REVEAL_POSITION.right)).not.toThrow()
    })

    it('reveal method can reveal center position', () => {
      let handle: RevealRowHandle | null = null
      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle?.reveal(REVEAL_POSITION.center)).not.toThrow()
    })

    it('reveal method ignores invalid positions for mode', () => {
      let handle: RevealRowHandle | null = null
      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          mode={REVEAL_MODE.left}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle?.reveal(REVEAL_POSITION.right)).not.toThrow()
    })
  })

  describe('animation', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.spyOn(performance, 'now').mockReturnValue(0)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('uses default animation preset', () => {
      let handle: RevealRowHandle | null = null
      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle?.close()).not.toThrow()
    })

    it('accepts custom animation preset', () => {
      let handle: RevealRowHandle | null = null
      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          animationPreset={ANIMATION_PRESET.smooth}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle?.close()).not.toThrow()
    })

    it('accepts custom animation config', () => {
      let handle: RevealRowHandle | null = null
      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          animationConfig={{ duration: 500, easing: 'linear' }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle?.close()).not.toThrow()
    })

    it('handles zero duration animation', () => {
      let handle: RevealRowHandle | null = null
      const { container } = render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      const rootElement = container.firstChild as HTMLElement
      const scrollToSpy = vi.fn()
      Object.defineProperty(rootElement, 'scrollLeft', {
        configurable: true,
        set: scrollToSpy,
      })

      handle?.close(false) // No animation

      expect(scrollToSpy).toHaveBeenCalled()
    })

    it('handles animated close with preset', () => {
      let handle: RevealRowHandle | null = null
      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() => handle?.close(ANIMATION_PRESET.quick)).not.toThrow()
    })

    it('handles animated reveal with custom config', () => {
      let handle: RevealRowHandle | null = null
      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() =>
        handle?.reveal(REVEAL_POSITION.left, {
          duration: 300,
          easing: 'ease-in',
        }),
      ).not.toThrow()
    })

    it('handles cubic-bezier easing animation', () => {
      let handle: RevealRowHandle | null = null
      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() =>
        handle?.close({
          duration: 100,
          easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        }),
      ).not.toThrow()
    })

    it('handles other cubic-bezier easing animation', () => {
      let handle: RevealRowHandle | null = null
      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() =>
        handle?.close({
          duration: 100,
          easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        }),
      ).not.toThrow()
    })

    it('calls onRevealChange after animated reveal completes', () => {
      const onRevealChange = vi.fn()
      let handle: RevealRowHandle | null = null

      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          onRevealChange={onRevealChange}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      onRevealChange.mockClear()

      handle?.reveal(REVEAL_POSITION.left, { duration: 10, easing: 'linear' })

      // Fast forward time to complete animation
      vi.advanceTimersByTime(20)

      expect(onRevealChange).toHaveBeenCalledWith(REVEAL_POSITION.left)
    })

    it('calls onRevealChange after animated close completes', () => {
      const onRevealChange = vi.fn()
      let handle: RevealRowHandle | null = null

      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          onRevealChange={onRevealChange}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      onRevealChange.mockClear()

      handle?.close({ duration: 10, easing: 'linear' })

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
      expect(rootElement).toHaveStyle({ gridTemplateColumns: '88px 100%' })
    })

    it('sets correct grid template for right mode', () => {
      const { container } = render(
        <RevealRow mode={REVEAL_MODE.right} right={<div>Right action</div>}>
          <div>Content</div>
        </RevealRow>,
      )

      const rootElement = container.firstChild as HTMLElement
      expect(rootElement).toHaveStyle({ gridTemplateColumns: '100% 88px' })
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
      expect(rootElement).toHaveStyle({ gridTemplateColumns: '88px 100% 88px' })
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
      let handle: RevealRowHandle | null = null
      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() =>
        handle?.close({ duration: NaN, easing: 'linear' }),
      ).not.toThrow()

      expect(() =>
        handle?.close({ duration: -100, easing: 'linear' }),
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
      let handle: RevealRowHandle | null = null
      const { unmount } = render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      // Unmount component to test null checks
      unmount()

      expect(() => handle?.close()).not.toThrow()
      expect(() => handle?.reveal(REVEAL_POSITION.left)).not.toThrow()
    })

    it('handles animation with zero or invalid progress', () => {
      let handle: RevealRowHandle | null = null
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1000) // Very large elapsed time

      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() =>
        handle?.close({ duration: 10, easing: 'linear' }),
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

      let handle: RevealRowHandle | null = null
      render(
        <RevealRow
          ref={(ref) => {
            handle = ref
          }}
          left={<div>Left action</div>}
        >
          <div>Content</div>
        </RevealRow>,
      )

      expect(() =>
        handle?.close({ duration: 10, easing: 'ease-out' }),
      ).not.toThrow()
      vi.advanceTimersByTime(15)

      expect(() =>
        handle?.close({ duration: 10, easing: 'ease-in-out' }),
      ).not.toThrow()
      vi.advanceTimersByTime(15)

      expect(() =>
        handle?.close({ duration: 10, easing: 'linear' }),
      ).not.toThrow()
      vi.advanceTimersByTime(15)

      vi.useRealTimers()
    })
  })
})
