import { vueRouter } from 'storybook-vue3-router'
import { PureActivites } from './activites'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { ApiClient } from '@/api/api-client'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { RouteLocationRaw } from 'vue-router'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { toCaminoAnnee } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Activites',
  // @ts-ignore
  component: PureActivites,
  decorators: [vueRouter([{ name: 'activites' }, { name: 'activite' }])],
}
export default meta

const getActivitesAction = action('getActivites')
const pushRouteAction = action('pushRoute')

const updateUrlQuery = { push: (values: RouteLocationRaw) => Promise.resolve(pushRouteAction(values)) }

const entreprises = [{ id: newEntrepriseId('id'), nom: 'Entreprise1', legal_siren: null }]
const apiClient: Pick<ApiClient, 'getActivites' | 'titresRechercherByNom' | 'getTitresByIds'> = {
  titresRechercherByNom: () => {
    return Promise.resolve({ elements: [] })
  },
  getTitresByIds: () => {
    return Promise.resolve({ elements: [] })
  },

  getActivites: siren => {
    getActivitesAction(siren)

    return Promise.resolve({
      total: 180,
      elements: [...Array(10).keys()].map(value => ({
        id: `activiteId${value}`,
        slug: `slug-activite-id-${value}`,
        typeId: 'grp',
        activiteStatutId: 'dep',
        periodeId: 2,
        annee: toCaminoAnnee(2023),
        titre: {
          id: 'titreId',
          nom: `Nom Du Titre ${value}`,
          titulaires: [
            {
              id: 'xx-123456789',
              nom: `Nom de l'entreprise ${value}`,
            },
          ],
          amodiataires: [],
        },
      })),
    })
  },
}

export const NotConnected: StoryFn = () => <PureActivites entreprises={entreprises} user={null} apiClient={apiClient} currentRoute={{ name: 'activites', query: {} }} updateUrlQuery={updateUrlQuery} />
export const Forbidden: StoryFn = () => (
  <PureActivites entreprises={entreprises} user={{ ...testBlankUser, role: 'defaut' }} apiClient={apiClient} currentRoute={{ name: 'activites', query: {} }} updateUrlQuery={updateUrlQuery} />
)
export const Full: StoryFn = () => (
  <PureActivites entreprises={entreprises} user={{ ...testBlankUser, role: 'super' }} apiClient={apiClient} currentRoute={{ name: 'activites', query: {} }} updateUrlQuery={updateUrlQuery} />
)
