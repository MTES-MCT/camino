import { test, expect } from 'vitest'
import { Role, UserNotNull, toUtilisateurId } from '../roles'
import { testBlankUser } from '../tests-utils'
import { canCreateEntreprise, canDeleteUtilisateur, canEditPermission, canReadUtilisateur, getAssignableRoles } from './utilisateurs'
import { entrepriseIdValidator } from '../entreprise'

const users: Record<Role, UserNotNull> = {
  super: { ...testBlankUser, role: 'super' },
  admin: { ...testBlankUser, role: 'admin', administrationId: 'aut-97300-01' },
  editeur: { ...testBlankUser, role: 'editeur', administrationId: 'aut-97300-01' },
  lecteur: { ...testBlankUser, role: 'lecteur', administrationId: 'aut-97300-01' },
  entreprise: { ...testBlankUser, role: 'entreprise', entrepriseIds: [] },
  "bureau d'études": { ...testBlankUser, role: "bureau d'études", entrepriseIds: [] },
  defaut: { ...testBlankUser, role: 'defaut' },
}

test('getAssignableRoles', () => {
  expect(Object.values(users).map(user => ({ role: user.role, assignableRoles: getAssignableRoles(user) }))).toMatchSnapshot()
})

test('canEditPermission', () => {
  expect(canEditPermission(users.super, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'admin', administrationId: 'aut-97300-01' })).toEqual(true)
  expect(canEditPermission(users.admin, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'lecteur', administrationId: 'aut-97300-01' })).toEqual(true)
  expect(canEditPermission(users.admin, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'editeur', administrationId: 'aut-97300-01' })).toEqual(true)
  expect(canEditPermission(users.admin, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'defaut' })).toEqual(true)
  expect(canEditPermission(users.admin, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'admin', administrationId: 'aut-97300-01' })).toEqual(true)
  expect(canEditPermission(users.admin, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'admin', administrationId: 'dea-guadeloupe-01' })).toEqual(false)

  expect(canEditPermission(users.defaut, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'defaut' })).toEqual(false)
  expect(canEditPermission(users.lecteur, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'defaut' })).toEqual(false)
  expect(canEditPermission(users.editeur, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'defaut' })).toEqual(false)
  expect(canEditPermission(users.entreprise, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'defaut' })).toEqual(false)
  expect(canEditPermission(users["bureau d'études"], { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'defaut' })).toEqual(false)
  expect(canEditPermission(users.defaut, { ...testBlankUser, id: toUtilisateurId('idFake'), role: 'defaut' })).toEqual(false)
})

test('canEditPermission yourself', () => {
  Object.values(users).forEach(user => expect(canEditPermission(user, user)).toBe(false))
})

test('canReadUtilisateur', () => {
  expect(canReadUtilisateur({ ...testBlankUser, id: toUtilisateurId('autreId'), role: 'lecteur', administrationId: 'aut-97300-01' }, { ...testBlankUser, role: 'defaut' })).toBe(false)
  expect(canReadUtilisateur({ ...testBlankUser, role: 'lecteur', administrationId: 'aut-97300-01' }, { ...testBlankUser, role: 'defaut' })).toBe(true)
  expect(
    canReadUtilisateur({ ...testBlankUser, id: toUtilisateurId('autreId'), role: 'lecteur', administrationId: 'aut-97300-01' }, { ...testBlankUser, role: 'admin', administrationId: 'aut-97300-01' })
  ).toBe(true)

  const entrepriseId = entrepriseIdValidator.parse('entrepriseId')
  expect(canReadUtilisateur({ ...testBlankUser, id: toUtilisateurId('autreId'), role: 'entreprise', entrepriseIds: [entrepriseId] }, { ...testBlankUser, role: 'defaut' })).toBe(false)
  expect(
    canReadUtilisateur({ ...testBlankUser, id: toUtilisateurId('autreId'), role: 'entreprise', entrepriseIds: [entrepriseId] }, { ...testBlankUser, role: 'entreprise', entrepriseIds: [entrepriseId] })
  ).toBe(true)
  expect(
    canReadUtilisateur(
      { ...testBlankUser, id: toUtilisateurId('autreId'), role: "bureau d'études", entrepriseIds: [entrepriseId] },
      { ...testBlankUser, role: 'entreprise', entrepriseIds: [entrepriseId] }
    )
  ).toBe(true)
  expect(canReadUtilisateur({ ...testBlankUser, id: toUtilisateurId('autreId'), role: 'defaut' }, { ...testBlankUser, role: 'entreprise', entrepriseIds: [entrepriseId] })).toBe(false)
})

test('canDeleteUtilisateur', () => {
  expect(canDeleteUtilisateur(users.defaut, users.defaut.id)).toBe(true)
  expect(canDeleteUtilisateur({ ...users.super, id: toUtilisateurId('superUserId') }, users.defaut.id)).toBe(true)

  expect(canDeleteUtilisateur({ ...users.admin, id: toUtilisateurId('adminUserId') }, users.defaut.id)).toBe(false)
})

test('canCreateEntreprise', () => {
  expect(Object.values(users).map(user => ({ role: user.role, canCreateEntreprise: canCreateEntreprise(user) }))).toMatchInlineSnapshot(`
    [
      {
        "canCreateEntreprise": true,
        "role": "super",
      },
      {
        "canCreateEntreprise": true,
        "role": "admin",
      },
      {
        "canCreateEntreprise": true,
        "role": "editeur",
      },
      {
        "canCreateEntreprise": false,
        "role": "lecteur",
      },
      {
        "canCreateEntreprise": false,
        "role": "entreprise",
      },
      {
        "canCreateEntreprise": false,
        "role": "bureau d'études",
      },
      {
        "canCreateEntreprise": false,
        "role": "defaut",
      },
    ]
  `)
})
