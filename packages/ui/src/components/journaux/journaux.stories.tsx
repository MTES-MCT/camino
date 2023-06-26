import { Journal } from 'camino-common/src/journaux'
import { Journaux } from './journaux'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Journaux/Journaux',
  component: Journaux,
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

export const Loading: StoryFn = () => <Journaux titreId={null} apiClient={{ getJournaux: () => new Promise(() => ({})) }} />
export const WithError: StoryFn = () => <Journaux titreId={null} apiClient={{ getJournaux: () => Promise.reject(new Error('erreur')) }} />
export const Default: StoryFn = () => (
  <Journaux
    titreId={null}
    apiClient={{
      getJournaux: async () => {
        return {
          elements: [element],
          intervalle: 10,
          page: 1,
          total: 1,
        }
      },
    }}
  />
)

export const AvecPagination: StoryFn = () => (
  <Journaux
    titreId={null}
    apiClient={{
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
