import { PureQuickAccessTitre } from './quick-access-titre'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Page/QuickAccessTitre',
  component: PureQuickAccessTitre,
  argTypes: {
    titres: { name: 'array', value: 'string', required: true },
  },
}
export default meta

const onSelectedTitre = action('onSelectedTitre')
const onSearch = action('onSearch')

export const Simple: Story = () => (
  <PureQuickAccessTitre
    titres={[
      {
        id: '1',
        nom: 'monTitre',
        typeId: 'arm',
      },
      {
        id: '1',
        nom: 'monSecondTitre',
        typeId: 'arg',
      },
    ]}
    onSearch={onSearch}
    onSelectedTitre={onSelectedTitre}
    id={'typeahead_id'}
  />
)

export const Empty: Story = () => <PureQuickAccessTitre titres={[]} onSearch={onSearch} onSelectedTitre={onSelectedTitre} id={'typeahead_id'} />
