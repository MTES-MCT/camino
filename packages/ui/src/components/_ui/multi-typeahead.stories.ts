import MultiTypeahead from './multi-typeahead.vue'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'UI/MultiTypeahead',
  component: MultiTypeahead,
  argTypes: {}
}
export default meta

type Item = { id: string; titre: string }
type Props = {
  id?: string
  items: Item[]
  placeholder: string
  minInputLength: number
  itemChipLabel: (item: Item) => string
  itemKey: (item: Item) => string
}

const Template: Story<Props> = (args: Props) => ({
  components: { MultiTypeahead },
  setup() {
    return { args }
  },
  template: `<MultiTypeahead v-bind="args" @onInput='onInput' @selectItems='selectItems'>
  <template #default="{item}" >
      {{ item.titre }}
  </template>
  </MultiTypeahead>`,
  methods: {
    selectItems: action('selectItems'),
    onInput: action('onInput')
  }
})

export const Multi = Template.bind({})
Multi.args = {
  id: 'multi',
  items: [{ id: 'id1', titre: 'titreItem' }],
  placeholder: 'placeholder',
  minInputLength: 3,
  itemChipLabel: item => item.titre,
  itemKey: item => item.id
}
export const Multiple = Template.bind({})
Multiple.args = {
  id: 'multiple',
  items: [
    { id: 'idTitreItem1', titre: 'titreItem1' },
    { id: 'idTitreItem2', titre: 'titreItem2' },
    { id: 'idTitreItem3', titre: 'titreItem3' },
    { id: 'idTitreItem4', titre: 'titreItem4' },
    { id: 'idTitreItem5', titre: 'titreItem5' },
    { id: 'idTitreItem6', titre: 'titreItem6' },
    { id: 'idTitreItem7', titre: 'titreItem7' },
    { id: 'idTitreItem8', titre: 'titreItem8' },
    { id: 'idTitreItem9', titre: 'titreItem9' },
    { id: 'idTitreItem10', titre: 'titreItem10' },
    { id: 'idTitreItem11', titre: 'titreItem11' },
    { id: 'idTitreItem12', titre: 'titreItem12' },
    { id: 'idTitreItem13', titre: 'titreItem13' },
    { id: 'idTitreItem14', titre: 'titreItem14' },
    { id: 'idTitreItem15', titre: 'titreItem15' }
  ],
  placeholder: 'placeholder',
  minInputLength: 3,
  itemChipLabel: item => item.titre,
  itemKey: item => item.id
}
