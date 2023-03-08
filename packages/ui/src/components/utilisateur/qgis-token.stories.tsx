import { Meta, Story } from '@storybook/vue3'
import { QGisToken } from './qgis-token'

const meta: Meta = {
  title: 'Components/Utilisateur/QGISToken',
  component: QGisToken,
  argTypes: {},
}
export default meta

export const Default: Story = () => (
  <QGisToken
    apiClient={{
      getQGISToken: () => new Promise(resolve => setTimeout(() => resolve({ token: 'token123' }), 1000)),
    }}
  />
)
