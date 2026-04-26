import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DefaultHandleIcon } from './DefaultHandleIcon'

describe('DefaultHandleIcon', () => {
  it('renders an svg element', () => {
    const { container } = render(<DefaultHandleIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg?.tagName).toBe('svg')
  })

  it('has correct attributes', () => {
    const { container } = render(<DefaultHandleIcon />)
    const svg = container.querySelector('svg')

    expect(svg).toHaveAttribute('width', '16')
    expect(svg).toHaveAttribute('height', '16')
    expect(svg).toHaveAttribute('viewBox', '0 0 16 16')
    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('contains 6 circle elements', () => {
    const { container } = render(<DefaultHandleIcon />)
    const circles = container.querySelectorAll('circle')
    expect(circles).toHaveLength(6)
  })

  it('has the correct circle positions and radius', () => {
    const { container } = render(<DefaultHandleIcon />)
    const circles = container.querySelectorAll('circle')

    const expectedPositions = [
      { cx: '6', cy: '4', r: '1.2' },
      { cx: '10', cy: '4', r: '1.2' },
      { cx: '6', cy: '8', r: '1.2' },
      { cx: '10', cy: '8', r: '1.2' },
      { cx: '6', cy: '12', r: '1.2' },
      { cx: '10', cy: '12', r: '1.2' },
    ]

    circles.forEach((circle, index) => {
      const expected = expectedPositions[index]
      expect(circle).toHaveAttribute('cx', expected.cx)
      expect(circle).toHaveAttribute('cy', expected.cy)
      expect(circle).toHaveAttribute('r', expected.r)
    })
  })

  it('includes a title element', () => {
    const { container } = render(<DefaultHandleIcon />)
    const title = container.querySelector('title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent('Drag handle')
  })
})
