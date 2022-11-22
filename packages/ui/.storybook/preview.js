import '../src/styles/styles.css'
import { app } from '@storybook/vue3'
import { h } from 'vue'

app.component('router-link', h('a', { type: 'primary' }))
export const parameters = {
  actions: { argTypesRegex: '^on.*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  }
}
