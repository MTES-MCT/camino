import type { Preview, Decorator } from '@storybook/vue3'
import '../src/styles/styles.css'
import '../src/styles/dsfr/dsfr.css'
import '@gouvfr/dsfr/dist/core/core.module'
import '@gouvfr/dsfr/dist/component/navigation/navigation.module'

import { setup } from '@storybook/vue3'
import { h } from 'vue'
import { allRoutes } from '../src/utils/storybook-test-utils'
import { vueRouter } from 'storybook-vue3-router'

setup(app => {
  app.component('router-link', h('a', { type: 'primary', href: 'href_for_storybook_in_preview.js' }))
})

export const decorators: Decorator[] = [
  story => ({
    components: { story  },
    template: '<div>' + '<main>' + '<div><story /></div>' + '</main>' + '</div>',
  }),
  vueRouter(allRoutes),
]

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: decorators,
}

export default preview
