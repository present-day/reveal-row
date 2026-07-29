import '@testing-library/jest-dom/vitest'

// Mock requestAnimationFrame and cancelAnimationFrame for tests
if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
    return setTimeout(() => cb(performance.now()), 0) as unknown as number
  }
}

if (typeof globalThis.cancelAnimationFrame === 'undefined') {
  globalThis.cancelAnimationFrame = (id: number) => {
    clearTimeout(id)
  }
}

// Mock performance.now
if (typeof globalThis.performance === 'undefined') {
  globalThis.performance = {} as Performance
}
if (typeof globalThis.performance.now === 'undefined') {
  globalThis.performance.now = () => Date.now()
}
