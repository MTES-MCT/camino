import SimpleTypeahead from './simple-typeahead.vue'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'UI/SimpleTypeahead',
  component: SimpleTypeahead,
  argTypes: {}
}
export default meta

type Props = {
  id?: string
  items: unknown[]
  placeholder: string
  minInputLength: number
}

const Template: Story<Props> = (args: Props) => ({
  components: { SimpleTypeahead },
  setup() {
    return { args }
  },
  template: `<SimpleTypeahead v-bind="args" @onInput='onInput' @selectItem='selectItem'>
  <template #default="{item}" >
      {{ item.titre }}
  </template>
  </SimpleTypeahead>`,
  methods: {
    selectItem: action('selectItem'),
    onInput: action('onInput')
  }
})

export const Simple = Template.bind({})
Simple.args = {
  items: [{ titre: 'titreItem' }],
  placeholder: 'placeholder',
  minInputLength: 3
}
export const Multiple = Template.bind({})
Multiple.args = {
  items: [
    { titre: 'titreItem1' },
    { titre: 'titreItem2' },
    { titre: 'titreItem3' },
    { titre: 'titreItem4' },
    { titre: 'titreItem5' },
    { titre: 'titreItem6' },
    { titre: 'titreItem7' },
    { titre: 'titreItem8' },
    { titre: 'titreItem9' },
    { titre: 'titreItem10' },
    { titre: 'titreItem11' },
    { titre: 'titreItem12' },
    { titre: 'titreItem13' },
    { titre: 'titreItem14' },
    { titre: 'titreItem15' }
  ],
  placeholder: 'placeholder',
  minInputLength: 3
}
