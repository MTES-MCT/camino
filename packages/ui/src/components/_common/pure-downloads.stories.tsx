import { Meta, Story } from '@storybook/vue3'
import { RouteLocationNormalized } from 'vue-router'
import { PureDownloads, Props } from './pure-downloads'

const meta: Meta = {
  title: 'Components/common/Downloads',
  component: PureDownloads
}
export default meta

export const Default: Story = () => (
  <PureDownloads
    formats={['geojson', 'xlsx']}
    section=""
    route={{ query: {} } as RouteLocationNormalized}
  />
)
