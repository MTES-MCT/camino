import { action } from '@storybook/addon-actions'
import { Filters } from './filters'
import { Meta, StoryFn } from '@storybook/vue3'
import { allCaminoFiltres } from './camino-filtres'
import { ApiClient } from '../../../api/api-client'
import { CaminoRouter } from '@/typings/vue-router'
import { SubstanceLegaleId, SubstancesLegales } from 'camino-common/src/static/substancesLegales'
import { MapPattern } from '@/components/_map/pattern'

const meta: Meta = {
  title: 'Components/Ui/Filters/Filters',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: Filters,
}
export default meta

const pushAction = action('push')
const push: CaminoRouter['push'] = params => {
  pushAction(params)

  return Promise.resolve()
}

const apiClient: Pick<ApiClient, 'titresRechercherByNom' | 'getTitresByIds'> = {
  titresRechercherByNom: () => {
    return Promise.resolve({ elements: [] })
  },
  getTitresByIds: () => {
    return Promise.resolve({ elements: [] })
  },
}

export const WithoutValue: StoryFn = () => (
  <Filters entreprises={[]} filters={['nomsAdministration']} apiClient={apiClient} updateUrlQuery={{ push }} route={{ query: {}, name: 'dashboard', params: {} }} validate={action('validate')} />
)

const allSubstances: SubstanceLegaleId[] = SubstancesLegales.map(({ id }) => id)
export const AllFiltersWithValues: StoryFn = () => (
  <Filters
    entreprises={[]}
    filters={allCaminoFiltres}
    updateUrlQuery={{ push }}
    route={{ query: { nomsAdministration: 'test', substancesIds: allSubstances }, name: 'dashboard', params: {} }}
    validate={action('validate')}
    apiClient={apiClient}
  />
)

export const CustomWithValues: StoryFn = () => (
  <Filters
    entreprises={[]}
    filters={['nomsAdministration', 'substancesIds']}
    updateUrlQuery={{ push }}
    route={{ query: { nomsAdministration: 'test', substancesIds: ['arge', 'auru'] }, name: 'dashboard', params: {} }}
    validate={action('validate')}
    apiClient={apiClient}
  />
)

export const AllFiltersWithoutValues: StoryFn = () => (
  <>
    <MapPattern />
    <Filters entreprises={[]} filters={allCaminoFiltres} updateUrlQuery={{ push }} route={{ query: {}, name: 'dashboard', params: {} }} apiClient={apiClient} validate={action('validate')} />
  </>
)
