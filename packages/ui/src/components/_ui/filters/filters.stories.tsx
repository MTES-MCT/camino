import { action } from '@storybook/addon-actions'
import { Filters } from './filters'
import { Meta, StoryFn } from '@storybook/vue3'
import { vueRouter } from 'storybook-vue3-router'
import { allCaminoFiltres } from './camino-filtres'
import { RouteLocationRaw } from 'vue-router'
import { ApiClient } from '../../../api/api-client'

const meta: Meta = {
  title: 'Components/Ui/Filters/Filters',
  // @ts-ignore
  component: Filters,
  decorators: [vueRouter([{ name: '/plop' }])],
}
export default meta

const pushAction = action('push')
const push = (params: RouteLocationRaw) => {
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

export const Loading: StoryFn = () => (
  <Filters
    filters={['titresIds']}
    entreprises={[]}
    apiClient={{ ...apiClient, getTitresByIds: () => new Promise(() => ({})) }}
    updateUrlQuery={{ push }}
    route={{ query: { titresIds: ['toto'] }, name: '/plop' }}
    toggle={action('toggle')}
    validate={action('validate')}
  />
)

export const ClosedWithoutValue: StoryFn = () => (
  <Filters
    entreprises={[]}
    filters={['nomsAdministration']}
    apiClient={apiClient}
    updateUrlQuery={{ push }}
    route={{ query: {}, name: '/plop' }}
    toggle={action('toggle')}
    validate={action('validate')}
  />
)

export const AllFiltersClosedWithValues: StoryFn = () => (
  <Filters
    entreprises={[]}
    filters={allCaminoFiltres}
    updateUrlQuery={{ push }}
    route={{ query: { nomsAdministration: 'test', substancesIds: ['arge', 'auru'] }, name: '/plop' }}
    toggle={action('toggle')}
    validate={action('validate')}
    opened={false}
    apiClient={apiClient}
  />
)

export const AllFiltersOpenedWithValues: StoryFn = () => (
  <Filters
    entreprises={[]}
    filters={allCaminoFiltres}
    updateUrlQuery={{ push }}
    route={{ query: { nomsAdministration: 'test', substancesIds: ['arge', 'auru'] }, name: '/plop' }}
    toggle={action('toggle')}
    validate={action('validate')}
    opened={true}
    apiClient={apiClient}
  />
)

export const CustomOpenedWithValues: StoryFn = () => (
  <Filters
    entreprises={[]}
    filters={['nomsAdministration', 'substancesIds']}
    updateUrlQuery={{ push }}
    route={{ query: { nomsAdministration: 'test', substancesIds: ['arge', 'auru'] }, name: '/plop' }}
    toggle={action('toggle')}
    validate={action('validate')}
    opened={true}
    apiClient={apiClient}
  />
)

export const Opened: StoryFn = () => (
  <Filters
    entreprises={[]}
    filters={allCaminoFiltres}
    updateUrlQuery={{ push }}
    route={{ query: {}, name: '/plop' }}
    apiClient={apiClient}
    toggle={action('toggle')}
    validate={action('validate')}
    opened={true}
  />
)
