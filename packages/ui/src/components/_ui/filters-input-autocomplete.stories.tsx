import { InputAutocomplete } from './filters-input-autocomplete'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Ui/InputAutocomplete',
  // @ts-ignore
  component: InputAutocomplete,
  argTypes: {
    rows: { name: 'array', value: 'string', required: true },
    columns: { name: 'array', value: 'string', required: true },
    initialSort: { name: 'object' },
  },
}
export default meta

export const Default: StoryFn = () => (
  <InputAutocomplete
    filter={{
      name: 'Items',
      value: [],
      elements: [
        { id: 'id1', nom: 'name1' },
        { id: 'id2', nom: 'name2' },
        { id: 'id3', nom: 'name3' },
      ],
      lazy: false,
    }}
  />
)
