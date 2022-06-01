const path = require('path')
const { mergeConfig } = require('vite')
const appConfig = require('../vite.config.js')
module.exports = {
  async viteFinal(config, { configType }) {
    const mergeConfigValue = mergeConfig(appConfig, config)
    // supprime le vue plugin qui vient de vite.config.js
    mergeConfigValue.plugins.shift()
    return mergeConfigValue
  },
  core: { builder: '@storybook/builder-vite' },
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
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
