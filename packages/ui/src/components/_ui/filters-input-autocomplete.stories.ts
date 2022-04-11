import FiltersInputAutocomplete from './filters-input-autocomplete.vue'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Ui/FiltersInputAutoComplete',
  component: FiltersInputAutocomplete,
  argTypes: {
    rows: { name: 'array', value: 'string', required: true },
    columns: { name: 'array', value: 'string', required: true },
    initialSort: { name: 'object' }
  }
}
export default meta

type Props = {
  filter: {
    id: string
    value: string[]
    elements: { id: string; nom: string }[]
    name: string
    lazy: boolean
    type: 'autocomplete'
    search?: (input: string) => Promise<{ elements: { id: string }[] }>
    load?: (ids: string[]) => Promise<{ elements: { id: string }[] }>
  }
}

const Template: Story<Props> = (args: Props) => ({
  components: { FiltersInputAutocomplete },
  setup() {
    return { args }
  },
  template:
    '<FiltersInputAutocomplete v-bind="args" @onSelectItems="onSelectItems" />',
  methods: {
    onSelectItems: action('onSelectItems')
  }
})

export const Default = Template.bind({})
Default.args = {
  filter: {
    id: 'id',
    type: 'autocomplete',
    name: 'Items',
    value: [],
    elements: [
      { id: 'id1', nom: 'name1' },
      { id: 'id2', nom: 'name2' },
      { id: 'id3', nom: 'name3' }
    ],
    lazy: false
  }
}
