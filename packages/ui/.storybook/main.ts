import type { StorybookConfig } from '@storybook/vue3-vite'
import { mergeConfig } from 'vite'
import appConfig from '../vite.config'
const config: StorybookConfig = {
  stories: ['../src/components/titre.stories.tsx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-actions', '@storybook/addon-controls'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config) {
    // Merge custom configuration into the default config
    return mergeConfig(config, {
      build: {
        rollupOptions: appConfig.build?.rollupOptions,
      },
    })
  },
}
export default config
