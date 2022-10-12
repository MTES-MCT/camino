import { Meta, Story } from '@storybook/vue3'
import Component from './pure-qgis-token.vue'
import { QGISToken } from 'camino-common/src/utilisateur'

const meta: Meta = {
  title: 'Components/Utilisateur/QGISToken',
  component: Component,
  argTypes: {}
}
export default meta

type Props = {
  generateTokenCall: () => Promise<QGISToken>
}

const Template: Story<Props> = (args: Props) => ({
  components: { Component },
  setup() {
    return { args }
  },
  template: '<Component v-bind="args" />'
})

export const Default = Template.bind({})
Default.args = {
  generateTokenCall: () =>
    new Promise(resolve =>
      setTimeout(() => resolve({ token: 'token123' }), 1000)
    )
}
