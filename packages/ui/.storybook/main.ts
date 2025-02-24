import { dirname, join } from 'path'
import type { StorybookConfig } from '@storybook/vue3-vite'
import { rollupOptions } from '../vite-rollup'

const config: StorybookConfig = {
  stories: ['../src/components/titre.stories.tsx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [getAbsolutePath('@storybook/addon-actions'), getAbsolutePath('@storybook/addon-controls'), getAbsolutePath('@storybook/addon-interactions'),
  // TODO 2025-02-19: à partir des version 8.5.x de storybook, l'addon a11y génère plusieurs warnings en console et, surtout, fait échouer certains tests de manière aléatoire : https://github.com/storybookjs/storybook/issues/30472
  // getAbsolutePath('@storybook/addon-a11y')
  ],
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
