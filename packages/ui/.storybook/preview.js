import '../src/styles/styles.css'
import { app } from '@storybook/vue3'
import { h } from 'vue'
import { IconSprite } from '@/components/_ui/iconSprite'

app.component(
  'router-link',
  h('a', { type: 'primary', href: 'href_for_storybook_in_preview.js' })
)
export const parameters = {
  actions: { argTypesRegex: '^on.*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  }
}

export const decorators = [
  story => ({
    components: { story, IconSprite },
    template: '<div style="margin: 3em;"><IconSprite /><story /></div>'
  })
]
