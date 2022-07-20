import LoaderData from './pure-loader-data.vue'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'UI/LoaderData',
  component: LoaderData,
  argTypes: {}
}
export default meta

const Template: Story = () => ({
  components: { LoaderData },
  template: `<div>
      <LoaderData :data="{status: 'LOADING'}" #default="{item}">{{item}}</LoaderData>
      <LoaderData :data="{status: 'LOADED', value: 'chargé'}" #default="{item}">La valeur de l’item est : {{item}}</LoaderData>
      <LoaderData :data="{status: 'ERROR', message: 'Erreur'}" #default="{item}">{{item}}</LoaderData>
    </div>`
})

export const All = Template.bind({})
