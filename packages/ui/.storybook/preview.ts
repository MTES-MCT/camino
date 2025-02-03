import type { Preview, Decorator } from '@storybook/vue3'
import '../src/styles/styles.css'
import "@codegouvfr/react-dsfr/main.css";
import '@codegouvfr/react-dsfr/dsfr/core/core.module'
import '@codegouvfr/react-dsfr/dsfr/component/navigation/navigation.module'
import '@codegouvfr/react-dsfr/dsfr/component/table/table.module'

import { setup } from '@storybook/vue3'
import { h } from 'vue'

setup(app => {
  app.component('router-link', h('a', { type: 'primary', href: 'href_for_storybook_in_preview.js' }))
})

export const decorators: Decorator[] = [
  story => ({
    components: { story  },
    template: '<div>' + '<main>' + '<div><story /></div>' + '</main>' + '</div>',
  }),
]

const preview: Preview = {
  parameters: {
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
