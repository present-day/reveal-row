import type { StorybookConfig } from '@storybook/react-vite'
import tailwindcss from '@tailwindcss/vite'

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  viteFinal: (config) => ({
    ...config,
    // The stories are styled with Tailwind (see stories/demo.css).
    plugins: [...(config.plugins ?? []), tailwindcss()],
    // Vite's default CSS target lowers `light-dark()` into a polyfill that
    // ignores the Theme toolbar's inline `color-scheme`; keep it native.
    build: {
      ...config.build,
      cssTarget: ['chrome123', 'edge123', 'firefox120', 'safari17.5'],
    },
  }),
}

export default config
