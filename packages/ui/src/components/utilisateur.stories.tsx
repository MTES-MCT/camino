import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue3'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { PureUtilisateur } from './utilisateur'
import { UtilisateurApiClient } from './utilisateur/utilisateur-api-client'

const meta: Meta = {
  title: 'Components/Utilisateur',
  component: PureUtilisateur,
  argTypes: {}
}
export default meta

const logout = action('logout')
const deleteUtilisateur = action('deleteUtilisateur')
const updateUtilisateur = action('updateUtilisateur')
const passwordUpdate = action('passwordUpdate')

const editNewsletter = action('editNewsletter')

const apiClientMock: UtilisateurApiClient = {
  getUtilisateur: () =>
    Promise.resolve({
      id: 'id',
      email: 'email@gmail.com',
      nom: 'nom',
      prenom: 'prenom',
      role: 'super'
    }),
  getUtilisateurNewsletter: () => Promise.resolve(true),
  removeUtilisateur: () => Promise.resolve(),
  updateUtilisateur: () => Promise.resolve(),
  updateUtilisateurNewsletter: (...values) => {
    editNewsletter(values)
    return Promise.resolve()
  },
  getEntreprises: () =>
    Promise.resolve([
      { id: newEntrepriseId('id'), nom: 'Entreprise1', etablissements: [] }
    ]),
  getQGISToken: () =>
    new Promise(resolve =>
      setTimeout(() => resolve({ token: 'token123' }), 1000)
    )
}

export const MySelf: Story = () => (
  <PureUtilisateur
    user={{ ...testBlankUser, id: 'id', role: 'super' }}
    logout={logout}
    utilisateurId="id"
    deleteUtilisateur={deleteUtilisateur}
    updateUtilisateur={params => {
      updateUtilisateur(params)
      return Promise.resolve()
    }}
    passwordUpdate={passwordUpdate}
    apiClient={apiClientMock}
  />
)

export const Loading: Story = () => (
  <PureUtilisateur
    user={{ ...testBlankUser, id: 'id', role: 'super' }}
    logout={logout}
    utilisateurId="id"
    deleteUtilisateur={deleteUtilisateur}
    updateUtilisateur={params => {
      updateUtilisateur(params)
      return Promise.resolve()
    }}
    passwordUpdate={passwordUpdate}
    apiClient={{
      ...apiClientMock,
      getUtilisateur: () => new Promise(() => ({}))
    }}
  />
)

export const error: Story = () => (
  <PureUtilisateur
    user={{ ...testBlankUser, id: 'anotherId', role: 'super' }}
    logout={logout}
    utilisateurId="id"
    deleteUtilisateur={deleteUtilisateur}
    updateUtilisateur={params => {
      updateUtilisateur(params)
      return Promise.resolve()
    }}
    passwordUpdate={passwordUpdate}
    apiClient={{
      ...apiClientMock,
      getUtilisateurNewsletter: () => Promise.reject(new Error('Cassé')),
      getUtilisateur: () => Promise.reject(new Error('Cassé'))
    }}
  />
)

export const AnotherUser: Story = () => (
  <PureUtilisateur
    user={{ ...testBlankUser, id: 'anotherId', role: 'super' }}
    logout={logout}
    utilisateurId="id"
    deleteUtilisateur={deleteUtilisateur}
    updateUtilisateur={params => {
      updateUtilisateur(params)
      return Promise.resolve()
    }}
    passwordUpdate={passwordUpdate}
    apiClient={apiClientMock}
  />
)
