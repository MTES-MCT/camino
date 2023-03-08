import Loader from './pure-loader.vue'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/UI/Loader',
  component: Loader,
  argTypes: {},
}
export default meta

const Template: Story = () => ({
  components: { Loader },
  template: `<div>
  <Loader :data="{status: 'LOADING'}" #default="{item}">{{item}}</Loader>
  <Loader :data="{status: 'LOADED', value: 'chargé'}" #default="{item}">La valeur de l’item est : {{item}}</Loader>
  <Loader :data="{status: 'ERROR', message: 'Erreur'}" #default="{item}">{{item}}</Loader>
</div>`,
})

export const All = Template.bind({})
