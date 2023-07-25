import { action } from '@storybook/addon-actions'
import { Filters } from './filters'
import { Meta, StoryFn } from '@storybook/vue3'
import { vueRouter } from 'storybook-vue3-router'
import { allCaminoFiltres } from './camino-filtres'
import { RouteLocationRaw } from 'vue-router'

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

const metas = { entreprises: [] }
export const ClosedWithoutValue: StoryFn = () => (
  <Filters filters={['nomsAdministration']} updateUrlQuery={{ push }} route={{ query: {}, name: '/plop' }} toggle={action('toggle')} validate={action('validate')} metas={metas} />
)

export const AllFiltersClosedWithValues: StoryFn = () => (
  <Filters
    filters={allCaminoFiltres}
    updateUrlQuery={{ push }}
    route={{ query: { nomsAdministration: 'test', substancesIds: ['arge', 'auru'] }, name: '/plop' }}
    toggle={action('toggle')}
    validate={action('validate')}
    opened={false}
    metas={metas}
  />
)

export const AllFiltersOpenedWithValues: StoryFn = () => (
  <Filters
    filters={allCaminoFiltres}
    updateUrlQuery={{ push }}
    route={{ query: { nomsAdministration: 'test', substancesIds: ['arge', 'auru'] }, name: '/plop' }}
    toggle={action('toggle')}
    validate={action('validate')}
    opened={true}
    metas={metas}
  />
)

export const CustomOpenedWithValues: StoryFn = () => (
  <Filters
    filters={['nomsAdministration', 'substancesIds']}
    updateUrlQuery={{ push }}
    route={{ query: { nomsAdministration: 'test', substancesIds: ['arge', 'auru'] }, name: '/plop' }}
    toggle={action('toggle')}
    validate={action('validate')}
    opened={true}
    metas={metas}
  />
)

export const Opened: StoryFn = () => (
  <Filters filters={allCaminoFiltres} updateUrlQuery={{ push }} route={{ query: {}, name: '/plop' }} toggle={action('toggle')} validate={action('validate')} opened={true} metas={metas} />
)
