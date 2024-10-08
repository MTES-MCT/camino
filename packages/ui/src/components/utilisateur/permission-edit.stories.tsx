import { action } from '@storybook/addon-actions'
import { Meta, StoryFn } from '@storybook/vue3'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { PermissionDisplay } from './permission-edit'
import { toUtilisateurId } from 'camino-common/src/roles'

const meta: Meta = {
  title: 'Components/Utilisateur/Permissions',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: PermissionDisplay,
}
export default meta

const update = action('update')
export const Default: StoryFn = () => (
  <PermissionDisplay
    user={{ ...testBlankUser, role: 'super' }}
    utilisateur={{ ...testBlankUser, id: toUtilisateurId('utilisateurIdFake'), role: 'defaut' }}
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
export const Administration: StoryFn = () => (
  <PermissionDisplay
    user={{ ...testBlankUser, role: 'super' }}
    utilisateur={{ ...testBlankUser, id: toUtilisateurId('utilisateurIdFake'), role: 'admin', administrationId: 'dea-guyane-01' }}
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
export const Entreprise: StoryFn = () => (
  <PermissionDisplay
    user={{ ...testBlankUser, role: 'super' }}
    utilisateur={{
      ...testBlankUser,
      id: toUtilisateurId('utilisateurIdFake'),
      role: 'entreprise',
      entrepriseIds: [newEntrepriseId('entrepriseId1'), newEntrepriseId('entrepriseId2')],
    }}
    entreprises={[
      { id: newEntrepriseId('entrepriseId1'), nom: 'Nom entreprise1', legal_siren: null },
      { id: newEntrepriseId('entrepriseId2'), nom: 'Nom entreprise2', legal_siren: 'FR2320-92' },
    ]}
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
    utilisateur={{ ...testBlankUser, id: toUtilisateurId('utilisateurIdFake'), role: 'defaut' }}
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
