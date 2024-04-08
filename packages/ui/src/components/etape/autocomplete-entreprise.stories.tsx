import { AutocompleteEntreprise } from './autocomplete-entreprise'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { newEntrepriseId } from 'camino-common/src/entreprise'

const meta: Meta = {
  title: 'Components/Etape/AutoCompleteEntreprise',
  component: AutocompleteEntreprise,
  argTypes: {},
}
export default meta

const onEntreprisesUpdate = action('onEntreprisesUpdate')
export const Default: StoryFn = () => (
  <AutocompleteEntreprise name="titulaires" allEntities={[{ id: newEntrepriseId('optionId1'), nom: 'optionNom1', legal_siren: null }]} onEntreprisesUpdate={onEntreprisesUpdate} />
)

export const WithEntitiesAlreadyPresent: StoryFn = () => (
  <AutocompleteEntreprise
    name="amodiataires"
    allEntities={[
      { id: newEntrepriseId('optionId1'), nom: 'optionNom1', legal_siren: null },
      { id: newEntrepriseId('optionId2'), nom: 'optionNom2', legal_siren: null },
      { id: newEntrepriseId('optionId3'), nom: 'optionNom3', legal_siren: null },
      { id: newEntrepriseId('optionId4'), nom: 'optionNom4', legal_siren: null },
      { id: newEntrepriseId('optionId5'), nom: 'optionNom5', legal_siren: null },
      { id: newEntrepriseId('optionId10'), nom: 'optionNom10', legal_siren: null },
    ]}
    selectedEntities={[
      { id: newEntrepriseId('optionId10'), operateur: false },
      { id: newEntrepriseId('optionId2'), operateur: true },
    ]}
    nonSelectableEntities={[newEntrepriseId('optionId1')]}
    onEntreprisesUpdate={onEntreprisesUpdate}
  />
)
