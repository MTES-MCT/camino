import { Meta, StoryFn } from '@storybook/vue3'
import { QGisToken } from './qgis-token'
import { qgisTokenValidator } from 'camino-common/src/utilisateur'

const meta: Meta = {
  title: 'Components/Utilisateur/QGISToken',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: QGisToken,
  argTypes: {},
}
export default meta

export const Default: StoryFn = () => (
  <QGisToken
    apiClient={{
      getQGISToken: () => new Promise(resolve => setTimeout(() => resolve({ token: qgisTokenValidator.parse('token123'), url: 'https://google.fr' }), 1000)),
    }}
  />
)
