import { dirname, join } from 'path'
import type { StorybookConfig } from '@storybook/vue3-vite'
import { rollupOptions } from '../vite-rollup'
import { optimizeDeps } from 'vite'
const config: StorybookConfig = {
  stories: ['../src/components/titre.stories.tsx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [getAbsolutePath('@storybook/addon-actions'), getAbsolutePath('@storybook/addon-controls'), getAbsolutePath('@storybook/addon-interactions'), getAbsolutePath('@storybook/addon-a11y')],
  framework: '@storybook/vue3-vite',
  docs: {},
  core: { disableTelemetry: true },
  async viteFinal(config) {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve?.alias,
        'vue-router': require.resolve('./vue-router.mock.ts'),
      }
    }
    config.optimizeDeps = { ...(config.optimizeDeps || {}), exclude: [...(config.optimizeDeps?.exclude ?? []), 'react-dom'] }
    // Merge custom configuration into the default config
    const { mergeConfig } = await import('vite')
    return mergeConfig(config, {
      build: {
        rollupOptions,
      },
    })
  },
}
export default config

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')))
}
