import { action } from '@storybook/addon-actions'
import { InputAutocomplete } from './filters-input-autocomplete'
import { Meta, StoryFn } from '@storybook/vue3'
import { ApiClient } from '../../../api/api-client'

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

const apiClient: Pick<ApiClient, 'titresRechercherByNom' | 'getTitresByIds' | 'getUtilisateurEntreprises'> = {
  titresRechercherByNom: () => {
    return Promise.resolve({ elements: [] })
  },
  getTitresByIds: () => {
    return Promise.resolve({ elements: [] })
  },
  getUtilisateurEntreprises: () => {
    return Promise.resolve([])
  },
}

export const Default: StoryFn = () => <InputAutocomplete apiClient={apiClient} filter="substancesIds" initialValue={['aloh']} onFilterAutocomplete={action('onFilterAutocomplete')} />
