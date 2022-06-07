import LoaderElement from './loader-element.vue'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'UI/LoaderElement',
  component: LoaderElement,
  argTypes: {}
}
export default meta

const Template: Story = () => ({
  components: { LoaderElement },
  template: `<div>
      <LoaderElement :data="{status: 'LOADING'}" #default="{item}">{{item}}</LoaderElement>
      <LoaderElement :data="{status: 'LOADED', value: 'chargé'}" #default="{item}">{{item}}</LoaderElement>
      <LoaderElement :data="{status: 'ERROR', message: 'Erreur'}" #default="{item}">{{item}}</LoaderElement>
    </div>`
})

export const All = Template.bind({})
