import { test, expect } from 'vitest'
import { Role, UserNotNull } from '../roles'
import { testBlankUser } from '../tests-utils'
import { canReadTravaux } from './travaux'

const users: Record<Role, UserNotNull> = {
  super: { ...testBlankUser, role: 'super' },
  admin: { ...testBlankUser, role: 'admin', administrationId: 'aut-97300-01' },
  editeur: { ...testBlankUser, role: 'editeur', administrationId: 'aut-97300-01' },
  lecteur: { ...testBlankUser, role: 'lecteur', administrationId: 'aut-97300-01' },
  entreprise: { ...testBlankUser, role: 'entreprise', entreprises: [] },
  'bureau d’études': { ...testBlankUser, role: 'bureau d’études', entreprises: [] },
  defaut: { ...testBlankUser, role: 'defaut' },
}

test('canReadTravaux', () => {
  expect(Object.values(users).map(user => ({ role: user?.role, canReadTravaux: canReadTravaux(user) }))).toMatchSnapshot()
})
