import { AutocompleteEntreprise } from './autocomplete-entreprise'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { EtapeEntreprise } from 'camino-common/src/etape'
import { EntrepriseId, Entreprise, newEntrepriseId } from 'camino-common/src/entreprise'

const meta: Meta = {
  title: 'Components/Etape/AutoCompleteEntreprise',
  component: AutocompleteEntreprise,
  argTypes: {},
}
export default meta

type Props = {
  nonSelectableEntities?: EntrepriseId[]
  selectedEntities?: EtapeEntreprise[]
  allEntities: Entreprise[]
  placeholder: string
}

const onEntreprisesUpdate = action('onEntreprisesUpdate')
export const Default: Story = () => (
  <AutocompleteEntreprise placeholder="placeholder" allEntities={[{ id: newEntrepriseId('optionId1'), nom: 'optionNom1', etablissements: [] }]} onEntreprisesUpdate={onEntreprisesUpdate} />
)

export const WithEntitiesAlreadyPresent: Story = () => (
  <AutocompleteEntreprise
    placeholder="placeholder"
    allEntities={[
      { id: newEntrepriseId('optionId1'), nom: 'optionNom1', etablissements: [] },
      { id: newEntrepriseId('optionId2'), nom: 'optionNom2', etablissements: [] },
      { id: newEntrepriseId('optionId3'), nom: 'optionNom3', etablissements: [] },
      { id: newEntrepriseId('optionId4'), nom: 'optionNom4', etablissements: [] },
      { id: newEntrepriseId('optionId5'), nom: 'optionNom5', etablissements: [] },
      {
        id: newEntrepriseId('optionId10'),
        nom: 'optionNom10',
        etablissements: [],
      },
    ]}
    selectedEntities={[
      { id: newEntrepriseId('optionId10'), operateur: false },
      { id: newEntrepriseId('optionId2'), operateur: true },
    ]}
    nonSelectableEntities={[newEntrepriseId('optionId1')]}
    onEntreprisesUpdate={onEntreprisesUpdate}
  />
)
