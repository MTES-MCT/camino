import { test, expect } from 'vitest'
import { Role, UserNotNull, toUtilisateurId } from '../roles'
import { testBlankUser } from '../tests-utils'
import { canEditPermission, getAssignableRoles } from './utilisateurs'

const users: Record<Role, UserNotNull> = {
  super: { ...testBlankUser, role: 'super' },
  admin: { ...testBlankUser, role: 'admin', administrationId: 'aut-97300-01' },
  editeur: { ...testBlankUser, role: 'editeur', administrationId: 'aut-97300-01' },
  lecteur: { ...testBlankUser, role: 'lecteur', administrationId: 'aut-97300-01' },
  entreprise: { ...testBlankUser, role: 'entreprise', entreprises: [] },
  'bureau d’études': { ...testBlankUser, role: 'bureau d’études', entreprises: [] },
  defaut: { ...testBlankUser, role: 'defaut' },
}

test('getAssignableRoles', () => {
  expect(Object.values(users).map(user => ({ role: user?.role, assignableRoles: getAssignableRoles(user) }))).toMatchSnapshot()
})

test('canEditPermission', () => {
  expect(canEditPermission(users.super, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'admin', administrationId: 'aut-97300-01' })).toEqual(true)
  expect(canEditPermission(users.admin, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'lecteur', administrationId: 'aut-97300-01' })).toEqual(true)
  expect(canEditPermission(users.admin, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'editeur', administrationId: 'aut-97300-01' })).toEqual(true)
  expect(canEditPermission(users.admin, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'defaut' })).toEqual(true)
  expect(canEditPermission(users.admin, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'admin', administrationId: 'aut-97300-01' })).toEqual(true)

  expect(canEditPermission(users.defaut, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'defaut' })).toEqual(false)
  expect(canEditPermission(users.lecteur, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'defaut' })).toEqual(false)
  expect(canEditPermission(users.editeur, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'defaut' })).toEqual(false)
  expect(canEditPermission(users.entreprise, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'defaut' })).toEqual(false)
  expect(canEditPermission(users['bureau d’études'], { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'defaut' })).toEqual(false)
  expect(canEditPermission(users.defaut, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'defaut' })).toEqual(false)
})

test('canEditPermission yourself', () => {
  Object.values(users).forEach(user => expect(canEditPermission(user, user)).toBe(false))
})
