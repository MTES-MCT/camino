import { canEditEmails, canReadActivitesTypesEmails } from './administrations.js'
import { AdministrationRole, Role, User } from '../roles.js'
import { ADMINISTRATION_IDS } from '../static/administrations.js'
import { test, expect } from 'vitest'
import { getTestUser, testBlankUser } from '../tests-utils'

test.each<[User, boolean]>([
  [{ ...testBlankUser, role: 'super' }, true],
  [
    {
      ...testBlankUser,
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    },
    true,
  ],
  [
    {
      ...testBlankUser,
      role: 'editeur',
      administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
    },
    true,
  ],
  [{ ...testBlankUser, role: 'defaut' }, false],
])("pour une préfecture, emailsLecture est '$emailsLecture' pour un utilisateur $role et pour tous ses membres", async (user, emailsLecture) => {
  expect(canReadActivitesTypesEmails(user, 'pre-01053-01')).toBe(emailsLecture)
})

test.each<['super' | AdministrationRole, boolean]>([
  ['super', true],
  ['admin', false],
  ['editeur', false],
  ['lecteur', false],
])("pour une préfecture, emailsModification est 'true' pour un utilisateur super, 'false' pour tous ses membres", async (role, emailsModification) => {
  const administrationId = ADMINISTRATION_IDS['PRÉFECTURE - AIN']
  const mockUser: User = getTestUser({ role, administrationId })
  expect(canEditEmails(mockUser, administrationId)).toEqual(emailsModification)
})

test.each<[Role, boolean]>([
  ['super', true],
  ['admin', true],
  ['editeur', true],
  ['lecteur', false],
  ['defaut', false],
])("pour une DREAL/DEAL, emailsModification est 'true' pour ses membres admins et éditeurs, pour les utilisateurs supers, 'false' pour ses autres membres", async (role, emailsModification) => {
  const administrationId = ADMINISTRATION_IDS['DRIEE - ÎLE-DE-FRANCE']
  const mockUser: User = getTestUser({ role, administrationId })
  expect(canEditEmails(mockUser, administrationId)).toEqual(emailsModification)
})

test("un admin de région peut voir les mails de la préfecture d'un département associé", async () => {
  const mockUser: User = {
    role: 'admin',
    administrationId: ADMINISTRATION_IDS['DREAL - NOUVELLE-AQUITAINE - SIÈGE DE POITIERS'],
    ...testBlankUser,
  }
  expect(canEditEmails(mockUser, ADMINISTRATION_IDS['PRÉFECTURE - DORDOGNE'])).toEqual(true)
  expect(canEditEmails(mockUser, ADMINISTRATION_IDS['PRÉFECTURE - CORSE-DU-SUD'])).toEqual(false)
})

test.each<[AdministrationRole | 'defaut', boolean]>([
  ['admin', true],
  ['editeur', true],
  ['lecteur', false],
  ['defaut', false],
])("pour un membre $role de ministère, emailsModification est '$emailsModification'", async (role, emailsModification) => {
  const administrationId = ADMINISTRATION_IDS["DAJ - MINISTÈRE DE L'ECONOMIE, DES FINANCES ET DE LA RELANCE"]
  const mockUser: User = getTestUser({ role, administrationId })
  expect(canEditEmails(mockUser, administrationId)).toEqual(emailsModification)
})
