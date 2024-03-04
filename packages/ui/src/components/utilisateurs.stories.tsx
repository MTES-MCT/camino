import { action } from '@storybook/addon-actions'
import { Meta, StoryFn } from '@storybook/vue3'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { PureUtilisateurs } from './utilisateurs'
import { toUtilisateurId } from 'camino-common/src/roles'
import { vueRouter } from 'storybook-vue3-router'
import { RouteLocationRaw } from 'vue-router'
import { ApiClient } from '../api/api-client'

const meta: Meta = {
  title: 'Components/Utilisateurs',
  // @ts-ignore
  component: PureUtilisateurs,
  decorators: [vueRouter([{ name: 'utilisateurs' }, { name: 'utilisateur' }])],
}
export default meta

const getUtilisateursAction = action('getUtilisateurs')

const pushRouteAction = action('pushRoute')

const updateUrlQuery = { push: (values: RouteLocationRaw) => Promise.resolve(pushRouteAction(values)) }

const entreprise = { id: newEntrepriseId('id'), nom: 'Entreprise1', legal_siren: null }
const apiClientMock: Pick<ApiClient, 'getUtilisateurs' | 'titresRechercherByNom' | 'getTitresByIds'> = {
  titresRechercherByNom: () => {
    return Promise.resolve({ elements: [] })
  },
  getTitresByIds: () => {
    return Promise.resolve({ elements: [] })
  },
  getUtilisateurs: () => {
    getUtilisateursAction()

    return Promise.resolve({
      total: 125,
      elements: [
        {
          id: toUtilisateurId('id'),
          email: 'unknown1@emailunkown.com',
          nom: 'nom1',
          prenom: 'prenom1',
          role: 'super',
        },
        {
          id: toUtilisateurId('id2'),
          email: 'unknown2@emailunkown.com',
          nom: 'nom2',
          prenom: 'prenom2',
          role: 'entreprise',
          entreprises: [entreprise],
        },
        {
          id: toUtilisateurId('id3'),
          email: 'unknown3@emailunkown.com',
          nom: 'nom3',
          prenom: 'prenom3',
          role: 'admin',
          administrationId: 'aut-mrae-guyane-01',
        },
      ],
    })
  },
}

export const Loading: StoryFn = () => (
  <PureUtilisateurs
    user={{ ...testBlankUser, role: 'super' }}
    apiClient={{
      ...apiClientMock,
      getUtilisateurs: () => new Promise(() => ({})),
    }}
    entreprises={[entreprise]}
    currentRoute={{ name: 'utilisateurs', query: {} }}
    updateUrlQuery={updateUrlQuery}
  />
)

export const NotConnected: StoryFn = () => (
  <PureUtilisateurs entreprises={[entreprise]} user={null} apiClient={apiClientMock} currentRoute={{ name: 'utilisateurs', query: {} }} updateUrlQuery={updateUrlQuery} />
)

export const Forbidden: StoryFn = () => (
  <PureUtilisateurs
    entreprises={[entreprise]}
    user={{ ...testBlankUser, role: 'defaut' }}
    apiClient={apiClientMock}
    currentRoute={{ name: 'utilisateurs', query: {} }}
    updateUrlQuery={updateUrlQuery}
  />
)

export const WithError: StoryFn = () => (
  <PureUtilisateurs
    user={{ ...testBlankUser, role: 'super' }}
    entreprises={[entreprise]}
    apiClient={{
      ...apiClientMock,
      getUtilisateurs: () => Promise.reject(new Error('Cassé')),
    }}
    currentRoute={{ name: 'utilisateurs', query: {} }}
    updateUrlQuery={updateUrlQuery}
  />
)

export const Connected: StoryFn = () => (
  <PureUtilisateurs
    entreprises={[entreprise]}
    user={{ ...testBlankUser, role: 'super' }}
    apiClient={apiClientMock}
    currentRoute={{ name: 'utilisateurs', query: {} }}
    updateUrlQuery={updateUrlQuery}
  />
)
