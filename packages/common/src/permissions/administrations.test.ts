import { canReadActivitesTypesEmails } from './administrations'
import { User } from '../roles'
import { ADMINISTRATION_IDS } from '../administrations'

test.each<[User, boolean]>([
  [{ role: 'super', administrationId: undefined }, true],
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
  [{ role: 'defaut', administrationId: undefined }, false]
])(
  "pour une préfecture, emailsLecture est '$emailsLecture' pour un utilisateur $role et pour tous ses membres",
  async (user, emailsLecture) => {
    expect(canReadActivitesTypesEmails(user, 'pre-01053-01')).toBe(
      emailsLecture
    )
  }
)
