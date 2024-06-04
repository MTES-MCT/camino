import { AutocompleteEntreprises } from './autocomplete-entreprises'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { newEntrepriseId } from 'camino-common/src/entreprise'

const meta: Meta = {
  title: 'Components/Etape/AutoCompleteEntreprises',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: AutocompleteEntreprises,
}
export default meta

const onEntreprisesUpdate = action('onEntreprisesUpdate')
export const Default: StoryFn = () => (
  <AutocompleteEntreprises name="titulaires" allEntities={[{ id: newEntrepriseId('optionId1'), nom: 'optionNom1', legal_siren: null }]} onEntreprisesUpdate={onEntreprisesUpdate} />
)

export const WithEntitiesAlreadyPresent: StoryFn = () => (
  <AutocompleteEntreprises
    name="amodiataires"
    allEntities={[
      { id: newEntrepriseId('optionId1'), nom: 'optionNom1', legal_siren: null },
      { id: newEntrepriseId('optionId2'), nom: 'optionNom2', legal_siren: null },
      { id: newEntrepriseId('optionId3'), nom: 'optionNom3', legal_siren: null },
      { id: newEntrepriseId('optionId4'), nom: 'optionNom4', legal_siren: null },
      { id: newEntrepriseId('optionId5'), nom: 'optionNom5', legal_siren: null },
      { id: newEntrepriseId('optionId10'), nom: 'optionNom10', legal_siren: null },
    ]}
    selectedEntities={[newEntrepriseId('optionId10'), newEntrepriseId('optionId2')]}
    nonSelectableEntities={[newEntrepriseId('optionId1')]}
    onEntreprisesUpdate={onEntreprisesUpdate}
  />
)
