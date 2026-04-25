import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const playgroundRoot = fileURLToPath(new URL('.', import.meta.url))
const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const sourceEntry = fileURLToPath(new URL('../src/index.ts', import.meta.url))

// GitHub Pages serves the site from a subpath; relative base in production
// makes chunk URLs work. Dev server keeps "/" so HMR and module resolution behave.
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : './',
  root: playgroundRoot,
  plugins: [react()],
  resolve: {
    alias: {
      '@present-day/reveal-row': sourceEntry,
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5174,
    fs: {
      allow: [playgroundRoot, packageRoot],
    },
  },
}))
