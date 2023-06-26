import { Meta, StoryFn } from '@storybook/vue3'
import { RouteLocationNormalized } from 'vue-router'
import { PureDownloads } from './downloads'

const meta: Meta = {
  title: 'Components/Common/Downloads',
  // @ts-ignore
  component: PureDownloads,
}
export default meta

export const Default: StoryFn = () => (
  <PureDownloads formats={['geojson', 'xlsx']} downloadRoute={'/demarches'} params={{}} route={{ query: {} } as RouteLocationNormalized} matomo={{ tracklink: () => {} }} />
)
