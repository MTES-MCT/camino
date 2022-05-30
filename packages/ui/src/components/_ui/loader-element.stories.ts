import LoaderElement from './loader-element.vue'
import { Meta, Story } from '@storybook/vue3'
import { AsyncData } from '@/api/client-rest'

const meta: Meta = {
  title: 'UI/LoaderElement',
  component: LoaderElement,
  argTypes: {}
}
export default meta

type Props = {
  data: AsyncData<any>
}

const Template: Story<Props> = (args: Props) => ({
  components: { LoaderElement },
  setup() {
    return { args }
  },
  template:
    '<LoaderElement v-bind="args" #default="{item}">{{item}}</LoaderElement>'
})

export const Loading = Template.bind({})
Loading.args = {
  data: { status: 'LOADING' }
}

export const Loaded = Template.bind({})
Loaded.args = {
  data: { status: 'LOADED', value: "C'est chargé" }
}
export const Error = Template.bind({})
Error.args = {
  data: { status: 'ERROR', message: 'Something wrong happened' }
}
