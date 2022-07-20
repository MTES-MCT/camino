import Loader from './pure-loader.vue'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'UI/Loader',
  component: Loader,
  argTypes: {}
}
export default meta

const Template: Story = () => ({
  components: { Loader },
  template: `<div>
      <Loader :data="{status: 'LOADING'}"></Loader>
      <Loader :data="{status: 'LOADED', value: 'chargé'}">Chargé</Loader>
      <Loader :data="{status: 'ERROR', message: 'Erreur'}"></Loader>
    </div>`
})

export const All = Template.bind({})
