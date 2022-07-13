import { canReadActivitesTypesEmails } from './administrations'
import {
  AdminUserNotNull,
  EntrepriseUserNotNull,
  UserDefaut,
  UserNotNull,
  UserSuper
} from '../roles'
import { ADMINISTRATION_IDS } from '../administrations'

export type TestUser =
  | Pick<UserSuper, 'role'>
  | Pick<UserDefaut, 'role'>
  | Pick<AdminUserNotNull, 'role' | 'administrationId'>
  | Pick<EntrepriseUserNotNull, 'role' | 'entreprises'>

export const testBlankUser: Omit<UserNotNull, 'role'> = {
  entreprisesCreation: false,
  utilisateursCreation: false,
  id: 'id',
  email: 'email',
  nom: 'nom',
  prenom: 'prenom'
}

test.each<[TestUser, boolean]>([
  [{ role: 'super' }, true],
  [
    {
      role: 'admin',
      administrationId:
        ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON']
    },
    true
  ],
  [
    {
      role: 'editeur',
      administrationId:
        ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON']
    },
    true
  ],
  [{ role: 'defaut' }, false]
])(
  "pour une préfecture, emailsLecture est '$emailsLecture' pour un utilisateur $role et pour tous ses membres",
  async (user, emailsLecture) => {
    expect(
      canReadActivitesTypesEmails({ ...user, ...testBlankUser }, 'pre-01053-01')
    ).toBe(emailsLecture)
  }
)
