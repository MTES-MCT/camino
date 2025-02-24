import { Meta, StoryFn } from '@storybook/vue3'
import { PureDownloads } from './downloads'

const meta: Meta = {
  title: 'Components/Common/Downloads',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: PureDownloads,
}
export default meta

export const Default: StoryFn = () => <PureDownloads downloadTitle="Télécharger les démarches" formats={['geojson', 'xlsx']} downloadRoute={'/demarches'} params={{}} route={{ query: {} }} id="id" />

export const OnlyOneFormat: StoryFn = () => <PureDownloads downloadTitle="Télécharger les démarches" formats={['pdf']} downloadRoute={'/demarches'} params={{}} route={{ query: {} }} id="id" />
