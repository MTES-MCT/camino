const path = require('path')
const { mergeConfig } = require('vite')
const appConfig = require('../vite.config.js')
module.exports = {
  async viteFinal(config, { configType }) {
    const mergeConfigValue = mergeConfig(config, appConfig)
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
