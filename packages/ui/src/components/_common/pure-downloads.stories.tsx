import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue3'
import { RouteLocationNormalized } from 'vue-router'
import { Store } from 'vuex'
import { PureDownloads, Props } from './pure-downloads'

const meta: Meta = {
  title: 'Components/common/Downloads',
  component: PureDownloads
}
export default meta

const dispatch = action('dispatch')
export const Default: Story = () => (
  <PureDownloads
    formats={['geojson', 'xlsx']}
    section=""
    route={{ query: {} } as RouteLocationNormalized}
  />
)
