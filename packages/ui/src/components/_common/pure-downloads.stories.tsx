import { action } from '@storybook/addon-actions'
import { Meta, StoryFn } from '@storybook/vue3'
import { RouteLocationNormalized } from 'vue-router'
import { PureDownloads } from './pure-downloads'

const meta: Meta = {
  title: 'Components/common/Downloads',
  component: PureDownloads,
}
export default meta

const dispatch = action('dispatch')
export const Default: StoryFn = () => <PureDownloads formats={['geojson', 'xlsx']} section="" route={{ query: {} } as RouteLocationNormalized} />
