import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue3'
import { newEntrepriseId } from 'camino-common/src/entreprise'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { Utilisateur } from '../../api/api-client'
import { EditPopup } from './edit-popup'

const meta: Meta = {
  title: 'Components/Utilisateur/EditPopup',
  component: EditPopup,
  argTypes: {}
}
export default meta

const editUser = action('editUser')
const close = action('close')

export const SuperEditDefaut: Story = () => (
  <EditPopup
    user={{ ...testBlankUser, role: 'super' }}
    utilisateur={{ id: 'id', email: 'email@gmail.fr', role: 'defaut' }}
    getEntreprises={() =>
      Promise.resolve([
        { id: newEntrepriseId('id'), nom: 'Entreprise1', etablissements: [] }
      ])
    }
    update={user => {
      editUser(user)
      return Promise.resolve()
    }}
    close={close}
  />
)

const utilisateurAdmin: Utilisateur = {
  id: 'id',
  nom: '',
  prenom: '',
  email: 'email@gmail.fr',
  role: 'lecteur',
  telephoneFixe: '0102030405',
  telephoneMobile: '0601020304',
  administrationId: 'aut-97300-01'
}

export const SuperEditLecteur: Story = () => (
  <EditPopup
    user={{ ...testBlankUser, role: 'super' }}
    utilisateur={utilisateurAdmin}
    getEntreprises={() =>
      Promise.resolve([
        { id: newEntrepriseId('id'), nom: 'Entreprise1', etablissements: [] }
      ])
    }
    update={user => {
      editUser(user)
      return Promise.resolve()
    }}
    close={close}
  />
)

export const SuperEditEntreprise: Story = () => (
  <EditPopup
    user={{ ...testBlankUser, role: 'super' }}
    utilisateur={{
      id: 'id',
      email: 'email@gmail.fr',
      role: 'entreprise',
      entreprises: [
        { id: newEntrepriseId('id'), nom: 'Entreprise1', etablissements: [] }
      ]
    }}
    getEntreprises={() =>
      Promise.resolve([
        { id: newEntrepriseId('id'), nom: 'Entreprise1', etablissements: [] }
      ])
    }
    update={user => {
      editUser(user)
      return Promise.resolve()
    }}
    close={close}
  />
)

export const AdminEditLecteur: Story = () => (
  <EditPopup
    user={{ ...testBlankUser, role: 'admin', administrationId: 'aut-97300-01' }}
    utilisateur={utilisateurAdmin}
    getEntreprises={() =>
      Promise.resolve([
        { id: newEntrepriseId('id'), nom: 'Entreprise1', etablissements: [] }
      ])
    }
    update={user => {
      editUser(user)
      return Promise.resolve()
    }}
    close={close}
  />
)
