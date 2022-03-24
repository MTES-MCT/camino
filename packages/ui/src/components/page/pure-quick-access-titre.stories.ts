import PureQuickAccessTitre from './pure-quick-access-titre.vue'
import { Meta, Story } from '@storybook/vue3'
import {Titre} from "./pure-quick-access-titres.type";
import {action} from "@storybook/addon-actions";

const meta: Meta = {
  title: 'Pages/PureQuickAccessTitre',
  component: PureQuickAccessTitre,
  argTypes: {
    titres: { name: 'array', value: 'string', required: true },
  }
}
export default meta

type Props = {
  titres: Titre[]
}

const Template: Story<Props> = (args: Props) => ({
  components: { PureQuickAccessTitre },
  setup() {
    return { args }
  },
  template: '<PureQuickAccessTitre v-bind="args" @onSearch="onSearch" @onSelectedTitre="onSelectedTitre"/>',
  methods: {
    onSelectedTitre: action('onSelectedTitre'),
    onSearch: action('onSearch')
  }
})

export const Simple = Template.bind({})
Simple.args = {
  titres: [
    {id: '1', nom: 'monTitre', domaine: { id:"m"}, type: {type:{id: 'ar'}}},
    {id: '1', nom: 'monSecondTitre', domaine: { id:"g"}, type: {type:{id: 'ar'}}}
  ]
}
export const Empty = Template.bind({})
Empty.args = {
  titres: []
}
