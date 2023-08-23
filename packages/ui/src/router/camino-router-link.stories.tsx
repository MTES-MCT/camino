import { Meta, StoryFn } from '@storybook/vue3'
import { CaminoRouterLink } from './camino-router-link'
import { vueRouter } from 'storybook-vue3-router'

const meta: Meta = {
  title: 'Tools/Routing',
  component: CaminoRouterLink,
  decorators: [vueRouter()],
}
export default meta

export const Default: StoryFn = () => (
  <div class="dsfr">
    <CaminoRouterLink title="Titre du lien" to="/about">
      Link
    </CaminoRouterLink>
  </div>
)
