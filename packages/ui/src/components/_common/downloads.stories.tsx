import { action } from '@storybook/addon-actions'
import { Meta, StoryFn } from '@storybook/vue3'
import { CaminoRestRoutes } from 'camino-common/src/rest'
import { RouteLocationNormalized } from 'vue-router'
import { PureDownloads } from './downloads'

const meta: Meta = {
  title: 'Components/common/Downloads',
  // @ts-ignore
  component: PureDownloads,
}
export default meta

export const Default: StoryFn = () => <PureDownloads formats={['geojson', 'xlsx']} downloadRoute={CaminoRestRoutes.downloadDemarches} params={{}} route={{ query: {} } as RouteLocationNormalized} />
