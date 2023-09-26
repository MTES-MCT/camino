import { DisplayTitre, PureQuickAccessTitre } from './quick-access-titre'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Page/QuickAccessTitre',
  component: PureQuickAccessTitre,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const onSelectedTitre = action('onSelectedTitre')
const onSearch = action('onSearch')

export const Simple: StoryFn = () => (
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

export const Empty: StoryFn = () => <PureQuickAccessTitre titres={[]} onSearch={onSearch} onSelectedTitre={onSelectedTitre} id={'typeahead_id'} />
export const DisplayTitreSeul: StoryFn = () => (
  <DisplayTitre
    titre={{
      nom: 'monTitre',
      typeId: 'arm',
    }}
  />
)
