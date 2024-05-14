import { Meta, StoryFn } from '@storybook/vue3'
import { CaminoRouterLink } from './camino-router-link'

const meta: Meta = {
  title: 'Tools/Routing',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: CaminoRouterLink,
}
export default meta

export const Default: StoryFn = () => (
  <div>
    <CaminoRouterLink title="Titre du lien" to="/about" isDisabled={false}>
      Link
    </CaminoRouterLink>
  </div>
)
