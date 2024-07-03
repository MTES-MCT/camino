import type { StorybookConfig } from '@storybook/vue3-vite'
import { rollupOptions } from '../vite-rollup'
const config: StorybookConfig = {
  stories: ['../src/components/titre.stories.tsx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-actions', '@storybook/addon-controls', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config) {
    if (config.resolve) {
          config.resolve.alias = {
            ...config.resolve?.alias,
            'vue-router': require.resolve('./vue-router.mock.ts'),
          };
        }

    // Merge custom configuration into the default config
    const { mergeConfig } = await import('vite')
    return mergeConfig(config, {
      build: {
        rollupOptions
      },
    })
  },
}
export default config
