import PureFooter from './pure-footer.vue'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Pages/Footer',
  component: PureFooter,
  argTypes: {}
}
export default meta

type Props = {
  version: string
  displayNewsletter: boolean
}

const Template: Story<Props> = (args: Props) => ({
  components: { PureFooter },
  setup() {
    return { args }
  },
  template:
    '<footer class="footer"> <div class="container"><PureFooter v-bind="args" /></div></footer>'
})

export const WithNewsletter = Template.bind({})
WithNewsletter.args = {
  version: '310c30f5b4d779cd4bc17316f4b026292bb95c10',
  displayNewsletter: true
}
export const WithoutNewsletter = Template.bind({})
WithoutNewsletter.args = {
  version: '310c30f5b4d779cd4bc17316f4b026292bb95c10',
  displayNewsletter: false
}
