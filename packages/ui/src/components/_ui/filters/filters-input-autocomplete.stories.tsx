import { action } from '@storybook/addon-actions'
import { InputAutocomplete } from './filters-input-autocomplete'
import { Meta, StoryFn } from '@storybook/vue3'
import { ApiClient } from '../../../api/api-client'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'

const meta: Meta = {
  title: 'Components/Ui/InputAutocomplete',
  // @ts-ignore
  component: InputAutocomplete,
}
export default meta

const apiClient: Pick<ApiClient, 'titresRechercherByNom' | 'getTitresByIds'> = {
  titresRechercherByNom: () => {
    return Promise.resolve({ elements: [] })
  },
  getTitresByIds: () => {
    return Promise.resolve({ elements: [] })
  },
}

export const Default: StoryFn = () => <InputAutocomplete entreprises={[]} apiClient={apiClient} filter="substancesIds" initialValue={['aloh']} onFilterAutocomplete={action('onFilterAutocomplete')} />

const entrepriseId = entrepriseIdValidator.parse('id1')
export const Entreprises: StoryFn = () => (
  <InputAutocomplete
    entreprises={[{ id: entrepriseIdValidator.parse('id1'), nom: 'Nom', legal_siren: '12' }]}
    apiClient={apiClient}
    filter="entreprisesIds"
    initialValue={[entrepriseId]}
    onFilterAutocomplete={action('onFilterAutocomplete')}
  />
)
