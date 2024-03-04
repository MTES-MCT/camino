import { action } from '@storybook/addon-actions'
import { Meta, StoryFn } from '@storybook/vue3'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { PermissionDisplay } from './permission-edit'
import { toUtilisateurId } from 'camino-common/src/roles'
import { vueRouter } from 'storybook-vue3-router'

const meta: Meta = {
  title: 'Components/Utilisateur/Permissions',
  component: PermissionDisplay,
  decorators: [vueRouter([{ name: 'entreprise' }])],
}
export default meta

const update = action('update')
export const Default: StoryFn = () => (
  <PermissionDisplay
    user={{ ...testBlankUser, role: 'super' }}
    utilisateur={{ status: 'LOADED', value: { ...testBlankUser, id: toUtilisateurId('utilisateurIdFake'), role: 'defaut' } }}
    entreprises={[]}
    apiClient={{
      updateUtilisateur: user =>
        new Promise(resolve =>
          setTimeout(() => {
            update(user)
            resolve()
          }, 1000)
        ),
    }}
  />
)

export const Entreprise: StoryFn = () => (
  <PermissionDisplay
    user={{ ...testBlankUser, role: 'super' }}
    utilisateur={{ status: 'LOADED', value: { ...testBlankUser, id: toUtilisateurId('utilisateurIdFake'), role: 'entreprise', entreprises: [{ id: newEntrepriseId('entrepriseId1'), nom: 'nom' }] } }}
    entreprises={[{ id: newEntrepriseId('entrepriseId1'), nom: 'Nom entreprise', legal_siren: null }]}
    apiClient={{
      updateUtilisateur: user =>
        new Promise(resolve =>
          setTimeout(() => {
            update(user)
            resolve()
          }, 1000)
        ),
    }}
  />
)

export const Loading: StoryFn = () => (
  <PermissionDisplay
    user={{ ...testBlankUser, role: 'super' }}
    entreprises={[]}
    utilisateur={{ status: 'LOADING' }}
    apiClient={{
      updateUtilisateur: user =>
        new Promise(resolve =>
          setTimeout(() => {
            update(user)
            resolve()
          }, 1000)
        ),
    }}
  />
)

export const UserAdminCanEditDefautIntoLecteur: StoryFn = () => (
  <PermissionDisplay
    user={{ ...testBlankUser, role: 'admin', administrationId: 'ope-onf-973-01' }}
    utilisateur={{ status: 'LOADED', value: { ...testBlankUser, id: toUtilisateurId('utilisateurIdFake'), role: 'defaut' } }}
    entreprises={[]}
    apiClient={{
      updateUtilisateur: user =>
        new Promise(resolve =>
          setTimeout(() => {
            update(user)
            resolve()
          }, 1000)
        ),
    }}
  />
)
