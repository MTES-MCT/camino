import { action } from '@storybook/addon-actions'
import { Meta, StoryFn } from '@storybook/vue3'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { PureUtilisateur, Props } from './utilisateur'
import { toUtilisateurId } from 'camino-common/src/roles'

const meta: Meta = {
  title: 'Components/Utilisateur',
  component: PureUtilisateur,
  argTypes: {},
}
export default meta

const deleteUtilisateur = action('deleteUtilisateur')
const updateUtilisateur = action('updateUtilisateur')
const passwordUpdate = action('passwordUpdate')

const editNewsletter = action('editNewsletter')

const apiClientMock: Props['apiClient'] = {
  getUtilisateur: () =>
    Promise.resolve({
      id: toUtilisateurId('id'),
      email: 'email@gmail.com',
      nom: 'nom',
      prenom: 'prenom',
      role: 'super',
    }),
  getUtilisateurNewsletter: () => Promise.resolve(true),
  removeUtilisateur: params => {
    deleteUtilisateur(params)

    return Promise.resolve()
  },
  updateUtilisateur: params => {
    updateUtilisateur(params)

    return Promise.resolve()
  },
  updateUtilisateurNewsletter: (...values) => {
    editNewsletter(values)

    return Promise.resolve()
  },
  getUtilisateurEntreprises: () => Promise.resolve([{ id: newEntrepriseId('id'), nom: 'Entreprise1', legal_siren: null }]),
  getQGISToken: () => new Promise(resolve => setTimeout(() => resolve({ token: 'token123', url: 'https://google.fr' }), 1000)),
}

export const MySelf: StoryFn = () => (
  <PureUtilisateur user={{ ...testBlankUser, id: toUtilisateurId('id'), role: 'super' }} utilisateurId="id" passwordUpdate={passwordUpdate} apiClient={apiClientMock} />
)

export const Loading: StoryFn = () => (
  <PureUtilisateur
    user={{ ...testBlankUser, id: toUtilisateurId('id'), role: 'super' }}
    utilisateurId="id"
    passwordUpdate={passwordUpdate}
    apiClient={{
      ...apiClientMock,
      getUtilisateur: () => new Promise(() => ({})),
    }}
  />
)

export const error: StoryFn = () => (
  <PureUtilisateur
    user={{ ...testBlankUser, id: toUtilisateurId('anotherId'), role: 'super' }}
    utilisateurId="id"
    passwordUpdate={passwordUpdate}
    apiClient={{
      ...apiClientMock,
      getUtilisateurNewsletter: () => Promise.reject(new Error('Cassé')),
      getUtilisateur: () => Promise.reject(new Error('Cassé')),
    }}
  />
)

export const AnotherUser: StoryFn = () => (
  <PureUtilisateur user={{ ...testBlankUser, id: toUtilisateurId('anotherId'), role: 'super' }} utilisateurId="id" passwordUpdate={passwordUpdate} apiClient={apiClientMock} />
)
