import '@testing-library/jest-dom'

// Mock requestAnimationFrame and cancelAnimationFrame for tests
if (typeof global.requestAnimationFrame === 'undefined') {
  global.requestAnimationFrame = (cb: FrameRequestCallback) => {
    return setTimeout(() => cb(performance.now()), 0) as unknown as number
  }
}

if (typeof global.cancelAnimationFrame === 'undefined') {
  global.cancelAnimationFrame = (id: number) => {
    clearTimeout(id)
  }
}

// Mock performance.now
if (typeof global.performance === 'undefined') {
  global.performance = {} as Performance
}
if (typeof global.performance.now === 'undefined') {
  global.performance.now = () => Date.now()
}
