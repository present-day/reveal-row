import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    watch: false,
    setupFiles: ['./test-setup.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'text-summary', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/index.ts', 'src/types.ts'],
    },
    env: {
      NODE_ENV: 'test',
    },
  },
})
