import type { Decorator, Preview } from '@storybook/react-vite'

import '../stories/demo.css'
import './preview.css'

type Theme = 'light' | 'dark' | 'system'

/**
 * Sets `color-scheme` the same way a host app would. `data-theme` drives the
 * stories' Tailwind `dark:` variant (see stories/demo.css).
 */
const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme ?? 'system') as Theme
  return (
    <div
      className="sb-surface"
      data-theme={theme}
      style={{ colorScheme: theme === 'system' ? 'light dark' : theme }}
    >
      <Story />
    </div>
  )
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Color scheme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'system', title: 'System', icon: 'browser' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'system' },
  decorators: [withTheme],
  parameters: { layout: 'fullscreen' },
}

export default preview
