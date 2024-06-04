import { AutocompleteEntrepriseSingle } from './autocomplete-entreprise-single'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { entrepriseIdValidator, newEntrepriseId } from 'camino-common/src/entreprise'

const meta: Meta = {
  title: 'Components/Etape/AutoCompleteEntrepriseSingle',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: AutocompleteEntrepriseSingle,
}
export default meta

const onUpdate = action('onEntreprisesUpdate')
export const Default: StoryFn = () => <AutocompleteEntrepriseSingle items={[{ id: newEntrepriseId('optionId1'), nom: 'optionNom1', legal_siren: null }]} onUpdate={onUpdate} />

export const WithInitialValue: StoryFn = () => (
  <AutocompleteEntrepriseSingle
    initialValue={entrepriseIdValidator.parse('optionId2')}
    items={[
      { id: newEntrepriseId('optionId1'), nom: 'optionNom1', legal_siren: null },
      { id: newEntrepriseId('optionId2'), nom: 'optionNom2', legal_siren: null },
      { id: newEntrepriseId('optionId3'), nom: 'optionNom3', legal_siren: null },
    ]}
    onUpdate={onUpdate}
  />
)
