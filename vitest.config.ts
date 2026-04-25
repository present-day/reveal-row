import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    watch: false,
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'text-summary', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/index.ts', 'src/types.ts'],
    },
  },
})
