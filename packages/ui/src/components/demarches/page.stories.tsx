import { Meta, StoryFn } from '@storybook/vue3'
import { PurePage } from './page'
import { action } from '@storybook/addon-actions'
import { RouteLocationRaw } from 'vue-router'
import { ApiClient } from '@/api/api-client'
import { vueRouter } from 'storybook-vue3-router'
import { filtres as demarchesFiltres } from '../demarches'
import { filtres as travauxFiltres } from '../travaux'

const meta: Meta = {
  title: 'Components/Demarches/Page',
  // @ts-ignore
  component: PurePage,
  decorators: [vueRouter([{ name: 'demarches' }, { name: 'titre' }])],
}
export default meta

const getDemarchesAction = action('getDemarchesA')
const getEntreprisesAction = action('getEntreprises')
const pushRouteAction = action('pushRoute')

const updateUrlQuery = { push: (values: RouteLocationRaw) => Promise.resolve(pushRouteAction(values)) }

const apiClient: Pick<ApiClient, 'getDemarches' | 'titresRechercherByNom' | 'getTitresByIds' | 'getUtilisateurEntreprises'> = {
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
  getUtilisateurEntreprises: () => {
    getEntreprisesAction()

    return Promise.resolve([])
  },
}

export const Loading: StoryFn = () => (
  <PurePage
    travaux
    updateUrlQuery={updateUrlQuery}
    currentRoute={{ name: 'demarches', query: {} }}
    apiClient={{ ...apiClient, getUtilisateurEntreprises: () => new Promise(() => ({})) }}
    filtres={demarchesFiltres}
  />
)

export const Travaux: StoryFn = () => <PurePage travaux updateUrlQuery={updateUrlQuery} currentRoute={{ name: 'demarches', query: {} }} apiClient={apiClient} filtres={travauxFiltres} />

export const Demarches: StoryFn = () => <PurePage travaux={false} updateUrlQuery={updateUrlQuery} currentRoute={{ name: 'demarches', query: {} }} apiClient={apiClient} filtres={demarchesFiltres} />

export const WithError: StoryFn = () => (
  <PurePage
    travaux
    updateUrlQuery={updateUrlQuery}
    currentRoute={{ name: 'demarches', query: {} }}
    apiClient={{ ...apiClient, getUtilisateurEntreprises: () => Promise.reject(new Error('Cassé')), getDemarches: () => Promise.reject(new Error('Cassé')) }}
    filtres={demarchesFiltres}
  />
)
