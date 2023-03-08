import { test, expect } from 'vitest'
import { Role, User } from '../roles'
import { testBlankUser } from '../tests-utils'
import { canEditUtilisateur, getAssignableRoles } from './utilisateurs'

const users: Record<Role, User> = {
  super: { ...testBlankUser, role: 'super' },
  admin: { ...testBlankUser, role: 'admin', administrationId: 'aut-97300-01' },
  editeur: { ...testBlankUser, role: 'editeur', administrationId: 'aut-97300-01' },
  lecteur: { ...testBlankUser, role: 'lecteur', administrationId: 'aut-97300-01' },
  entreprise: { ...testBlankUser, role: 'entreprise', entreprises: [] },
  'bureau d’études': { ...testBlankUser, role: 'bureau d’études', entreprises: [] },
  defaut: { ...testBlankUser, role: 'defaut' }
}

test('getAssignableRoles', () => {
  expect(Object.values(users).map(user => ({ role: user?.role, assignableRoles: getAssignableRoles(user) }))).toMatchSnapshot()
})

test('canEditUtilisateur', () => {
  expect(canEditUtilisateur(users.super, { ...testBlankUser, id: 'idFake', role: 'admin', administrationId: 'aut-97300-01' })).toEqual(true)
  expect(canEditUtilisateur(users.admin, { ...testBlankUser, id: 'idFake', role: 'lecteur', administrationId: 'aut-97300-01' })).toEqual(true)
  expect(canEditUtilisateur(users.admin, { ...testBlankUser, id: 'idFake', role: 'editeur', administrationId: 'aut-97300-01' })).toEqual(true)
  expect(canEditUtilisateur(users.admin, { ...testBlankUser, id: 'idFake', role: 'admin', administrationId: 'aut-97300-01' })).toEqual(false)

  expect(canEditUtilisateur(users.defaut, { ...testBlankUser, id: 'idFake', role: 'defaut' })).toEqual(false)
  expect(canEditUtilisateur(users.admin, { ...testBlankUser, id: 'idFake', role: 'defaut' })).toEqual(false)
  expect(canEditUtilisateur(users.lecteur, { ...testBlankUser, id: 'idFake', role: 'defaut' })).toEqual(false)
  expect(canEditUtilisateur(users.editeur, { ...testBlankUser, id: 'idFake', role: 'defaut' })).toEqual(false)
  expect(canEditUtilisateur(users.entreprise, { ...testBlankUser, id: 'idFake', role: 'defaut' })).toEqual(false)
  expect(canEditUtilisateur(users['bureau d’études'], { ...testBlankUser, id: 'idFake', role: 'defaut' })).toEqual(false)
  expect(canEditUtilisateur(users.defaut, { ...testBlankUser, id: 'idFake', role: 'defaut' })).toEqual(false)
})

test('canEditUtilisateur yourself', () => {
  Object.values(users).forEach(user => expect(canEditUtilisateur(user, user)).toBe(true))
})
