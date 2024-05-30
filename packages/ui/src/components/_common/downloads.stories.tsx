import { Meta, StoryFn } from '@storybook/vue3'
import { PureDownloads } from './downloads'

const meta: Meta = {
  title: 'Components/Common/Downloads',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: PureDownloads,
}
export default meta

export const Default: StoryFn = () => <PureDownloads formats={['geojson', 'xlsx']} downloadRoute={'/demarches'} params={{}} route={{ query: {} }} id="id" />

export const OnlyOneFormat: StoryFn = () => <PureDownloads formats={['pdf']} downloadRoute={'/demarches'} params={{}} route={{ query: {} }} id="id" />

export const WithOverridenTitle: StoryFn = () => (
  <PureDownloads formats={['pdf']} downloadRoute={'/demarches'} params={{}} route={{ query: {} }} id="id" downloadTitle="Surchage du titre du bouton de téléchargement" />
)
