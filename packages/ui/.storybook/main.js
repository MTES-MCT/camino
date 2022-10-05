const path = require('path')
const { mergeConfig } = require('vite')
const appConfig = require('../vite.config.js')
module.exports = {
  async viteFinal(config, { configType }) {
    //https://github.com/storybookjs/storybook/issues/10887#issuecomment-901109891
    config.resolve.dedupe = ['@storybook/client-api']

    const mergeConfigValue = mergeConfig(appConfig, config)
    // supprime le vue plugin qui vient de vite.config.js
    mergeConfigValue.plugins.shift()
    return mergeConfigValue
  },
  core: { builder: '@storybook/builder-vite' },
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  staticDirs: ['../src/public'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-controls',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss')
        }
      }
    }
  ],
  framework: '@storybook/vue3'
}
