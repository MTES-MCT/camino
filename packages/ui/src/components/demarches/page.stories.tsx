import { Meta, StoryFn } from '@storybook/vue3'
import { PurePage } from './page'
import { action } from '@storybook/addon-actions'
import { RouteLocationRaw } from 'vue-router'
import { ApiClient } from '@/api/api-client'
import { filtres as demarchesFiltres } from '../demarches'
import { filtres as travauxFiltres } from '../travaux'
import { demarcheSlugValidator } from 'camino-common/src/demarche'

const meta: Meta = {
  title: 'Components/Demarches/Page',
  // @ts-ignore
  component: PurePage,
}
export default meta

const getDemarchesAction = action('getDemarches')
const pushRouteAction = action('pushRoute')

const updateUrlQuery = { push: (values: RouteLocationRaw) => Promise.resolve(pushRouteAction(values)) }

const apiClient: Pick<ApiClient, 'getDemarches' | 'titresRechercherByNom' | 'getTitresByIds'> = {
  titresRechercherByNom: () => {
    return Promise.resolve({ elements: [] })
  },
  getTitresByIds: () => {
    return Promise.resolve({ elements: [] })
  },
  getDemarches: () => {
    getDemarchesAction()

    return Promise.resolve({
      total: 1200,
      elements: [...Array(10).keys()].map(value => ({
        id: `id${value}`,
        slug: demarcheSlugValidator.parse(`slug${value}`),
        typeId: value % 2 === 0 ? 'dam' : 'amo',
        statutId: value % 2 === 0 ? 'fpm' : 'des',
        titre: {
          slug: `slug-${value}`,
          titreStatutId: value % 3 === 0 ? 'ech' : 'val',
          typeId: value % 3 === 0 ? 'cxm' : 'prg',
          nom: `Nom ${value}`,
          references: [
            {
              referenceTypeId: 'rnt',
              nom: `Ref ${value}`,
            },
          ],
        },
      })),
    })
  },
}

export const Loading: StoryFn = () => (
  <PurePage
    travaux
    updateUrlQuery={updateUrlQuery}
    entreprises={[]}
    currentRoute={{ name: 'demarches', query: { titresIds: ['id1'] } }}
    apiClient={{ ...apiClient, getDemarches: () => new Promise(() => ({})), getTitresByIds: () => new Promise(() => ({})) }}
    filtres={demarchesFiltres}
  />
)

export const Travaux: StoryFn = () => (
  <PurePage travaux entreprises={[]} updateUrlQuery={updateUrlQuery} currentRoute={{ name: 'demarches', query: {} }} apiClient={apiClient} filtres={travauxFiltres} />
)

export const Demarches: StoryFn = () => (
  <PurePage travaux={false} entreprises={[]} updateUrlQuery={updateUrlQuery} currentRoute={{ name: 'demarches', query: {} }} apiClient={apiClient} filtres={demarchesFiltres} />
)

export const WithError: StoryFn = () => (
  <PurePage
    travaux
    updateUrlQuery={updateUrlQuery}
    entreprises={[]}
    currentRoute={{ name: 'demarches', query: { titresIds: ['id1'] } }}
    apiClient={{ ...apiClient, getTitresByIds: () => Promise.reject(new Error('Cassé')), getDemarches: () => Promise.reject(new Error('Cassé')) }}
    filtres={demarchesFiltres}
  />
)
