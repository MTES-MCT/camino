import { InputAutocomplete } from './filters-input-autocomplete'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Ui/InputAutocomplete',
  component: InputAutocomplete,
  argTypes: {
    rows: { name: 'array', value: 'string', required: true },
    columns: { name: 'array', value: 'string', required: true },
    initialSort: { name: 'object' }
  }
}
export default meta

const onSelectItems = action('onSelectItems')
export const Default: Story = () => (
  <InputAutocomplete
    filter={{
      id: 'id',
      name: 'Items',
      value: [],
      elements: [
        { id: 'id1', nom: 'name1' },
        { id: 'id2', nom: 'name2' },
        { id: 'id3', nom: 'name3' }
      ],
      lazy: false
    }}
    onSelectItems={onSelectItems}
  />
)
