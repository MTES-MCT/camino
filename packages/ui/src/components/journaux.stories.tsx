import { Journal } from 'camino-common/src/journaux'
import { PureJournaux } from './journaux'
import { Meta, StoryFn } from '@storybook/vue3'
import { vueRouter } from 'storybook-vue3-router'
import { ApiClient } from '@/api/api-client'

const meta: Meta = {
  title: 'Components/Journaux',
  component: PureJournaux,
  decorators: [vueRouter([{ name: 'etape', params: { id: 'unIdDelement' } }])],
}
export default meta

const element: Journal = {
  id: 'unIdDeJournal',
  date: '1662543155251',
  differences: null,
  elementId: 'unIdDelement',
  operation: 'create',
  utilisateur: {
    nom: 'Nom de famille',
    prenom: 'Le beau prénom',
  },
  titre: {
    nom: 'Le nom du titre concerné',
  },
}

const apiClient: Pick<ApiClient, 'titresRechercherByNom' | 'getTitresByIds' | 'getJournaux'> = {
  titresRechercherByNom: () => {
    return Promise.resolve({ elements: [] })
  },
  getTitresByIds: () => {
    return Promise.resolve({ elements: [] })
  },
  getJournaux: async () => {
    return {
      elements: [element],
      intervalle: 10,
      page: 1,
      total: 1,
    }
  },
}

export const Loading: StoryFn = () => <PureJournaux apiClient={{ ...apiClient, getJournaux: () => new Promise(() => ({})) }} />
export const WithError: StoryFn = () => <PureJournaux apiClient={{ ...apiClient, getJournaux: () => Promise.reject(new Error('erreur')) }} />
export const Default: StoryFn = () => <PureJournaux apiClient={apiClient} />

export const AvecPagination: StoryFn = () => (
  <PureJournaux
    apiClient={{
      ...apiClient,
      getJournaux: async () => {
        return {
          elements: [...Array(10)].map(() => element),
          intervalle: 10,
          page: 1,
          total: 15,
        }
      },
    }}
  />
)
