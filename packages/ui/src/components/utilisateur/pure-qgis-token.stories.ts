import { Meta, Story } from '@storybook/vue3'
import { QGisToken, Props } from './pure-qgis-token'

const meta: Meta = {
  title: 'Components/Utilisateur/QGISToken',
  component: QGisToken,
  argTypes: {}
}
export default meta

const Template: Story<Props> = (args: Props) => ({
  components: { QGisToken },
  setup() {
    return { args }
  },
  template: '<QGisToken v-bind="args" />'
})

export const Default = Template.bind({})
Default.args = {
  generateTokenCall: () =>
    new Promise(resolve =>
      setTimeout(() => resolve({ token: 'token123' }), 1000)
    )
}
