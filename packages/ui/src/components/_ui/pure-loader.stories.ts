import { LoadingElement } from './pure-loader'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'UI/LoadingElement',
  component: LoadingElement,
  argTypes: {}
}
export default meta

const Template: Story = () => ({
  components: { LoadingElement },
  template: `<div>
  <LoadingElement :data="{status: 'LOADING'}" #default="{item}">{{item}}</LoadingElement>
  <LoadingElement :data="{status: 'LOADED', value: 'chargé'}" #default="{item}">La valeur de l’item est : {{item}}</LoadingElement>
  <LoadingElement :data="{status: 'ERROR', message: 'Erreur'}" #default="{item}">{{item}}</LoadingElement>
</div>`
})

export const All = Template.bind({})
