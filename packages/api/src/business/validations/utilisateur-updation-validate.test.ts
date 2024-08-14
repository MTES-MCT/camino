import { newEntrepriseId } from 'camino-common/src/entreprise'
import { Role, UserNotNull } from 'camino-common/src/roles'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { test, expect } from 'vitest'
import { utilisateurUpdationValidate } from './utilisateur-updation-validate'
import { newUtilisateurId } from '../../database/models/_format/id-create'

const users: Record<Role, UserNotNull> = {
  super: { ...testBlankUser, role: 'super' },
  admin: { ...testBlankUser, role: 'admin', administrationId: 'aut-97300-01' },
  editeur: {
    ...testBlankUser,
    role: 'editeur',
    administrationId: 'aut-97300-01',
  },
  lecteur: {
    ...testBlankUser,
    role: 'lecteur',
    administrationId: 'aut-97300-01',
  },
  entreprise: { ...testBlankUser, role: 'entreprise', entrepriseIds: [] },
  'bureau d’études': {
    ...testBlankUser,
    role: 'bureau d’études',
    entrepriseIds: [],
  },
  defaut: { ...testBlankUser, role: 'defaut' },
}

const fakeAdministrationId = 'fakeAdminId' as AdministrationId

test('utilisateurUpdationValidate privilege escalation forbidden', () => {
  expect(() => utilisateurUpdationValidate(users.defaut, { ...users.defaut, role: 'super', administrationId: null, entrepriseIds: [] }, users.defaut)).toThrowErrorMatchingInlineSnapshot(
    `[Error: droits insuffisants]`
  )
  expect(() => utilisateurUpdationValidate(users.admin, { ...users.admin, role: 'super', entrepriseIds: [], administrationId: null }, users.admin)).toThrowErrorMatchingInlineSnapshot(
    `[Error: droits insuffisants]`
  )
  expect(() => utilisateurUpdationValidate(users.lecteur, { ...users.lecteur, role: 'super', entrepriseIds: [], administrationId: null }, users.lecteur)).toThrowErrorMatchingInlineSnapshot(
    `[Error: droits insuffisants]`
  )
  expect(() => utilisateurUpdationValidate(users.editeur, { ...users.editeur, role: 'super', entrepriseIds: [], administrationId: null }, users.editeur)).toThrowErrorMatchingInlineSnapshot(
    `[Error: droits insuffisants]`
  )
  expect(() => utilisateurUpdationValidate(users.entreprise, { ...users.entreprise, role: 'super', entrepriseIds: [], administrationId: null }, users.entreprise)).toThrowErrorMatchingInlineSnapshot(
    `[Error: droits insuffisants]`
  )
  expect(() =>
    utilisateurUpdationValidate(users['bureau d’études'], { ...users['bureau d’études'], role: 'super', entrepriseIds: [], administrationId: null }, users.entreprise)
  ).toThrowErrorMatchingInlineSnapshot(`[Error: droits insuffisants]`)

  expect(() =>
    utilisateurUpdationValidate(users.editeur, { ...users.editeur, role: 'entreprise', administrationId: null, entrepriseIds: [newEntrepriseId('id')] }, users.editeur)
  ).toThrowErrorMatchingInlineSnapshot(`[Error: droits insuffisants]`)
  expect(() =>
    utilisateurUpdationValidate(users.defaut, { ...users.defaut, role: 'entreprise', administrationId: null, entrepriseIds: [newEntrepriseId('id')] }, users.defaut)
  ).toThrowErrorMatchingInlineSnapshot(`[Error: droits insuffisants]`)
})

test('utilisateurUpdationValidate incorrect users throw error', () => {
  expect(() =>
    utilisateurUpdationValidate(users.super, { id: newUtilisateurId('utilisateurId'), role: 'super', administrationId: null, entrepriseIds: [] }, undefined)
  ).toThrowErrorMatchingInlineSnapshot(`[Error: l'utilisateur n'existe pas]`)

  expect(() =>
    utilisateurUpdationValidate(users.super, { id: newUtilisateurId('utilisateurId'), role: 'super', entrepriseIds: [newEntrepriseId('entrepriseId')], administrationId: null }, undefined)
  ).toThrowErrorMatchingInlineSnapshot(`[Error: utilisateur incorrect]`)
  expect(() =>
    utilisateurUpdationValidate(users.super, { id: newUtilisateurId('utilisateurId'), role: 'super', administrationId: 'aut-97300-01', entrepriseIds: [] }, undefined)
  ).toThrowErrorMatchingInlineSnapshot(`[Error: utilisateur incorrect]`)

  expect(() =>
    utilisateurUpdationValidate(users.super, { id: newUtilisateurId('utilisateurId'), role: 'defaut', administrationId: null, entrepriseIds: [] }, undefined)
  ).toThrowErrorMatchingInlineSnapshot(`[Error: l'utilisateur n'existe pas]`)
  expect(() =>
    utilisateurUpdationValidate(users.super, { id: newUtilisateurId('utilisateurId'), role: 'defaut', entrepriseIds: [newEntrepriseId('entrepriseId')], administrationId: null }, undefined)
  ).toThrowErrorMatchingInlineSnapshot(`[Error: utilisateur incorrect]`)
  expect(() =>
    utilisateurUpdationValidate(users.super, { id: newUtilisateurId('utilisateurId'), role: 'defaut', administrationId: 'aut-97300-01', entrepriseIds: [] }, undefined)
  ).toThrowErrorMatchingInlineSnapshot(`[Error: utilisateur incorrect]`)

  expect(() =>
    utilisateurUpdationValidate(users.super, { id: newUtilisateurId('utilisateurId'), role: 'admin', administrationId: null, entrepriseIds: [] }, undefined)
  ).toThrowErrorMatchingInlineSnapshot(`[Error: utilisateur incorrect]`)
  expect(() =>
    utilisateurUpdationValidate(users.super, { id: newUtilisateurId('utilisateurId'), role: 'admin', entrepriseIds: [newEntrepriseId('entrepriseId')], administrationId: null }, undefined)
  ).toThrowErrorMatchingInlineSnapshot(`[Error: utilisateur incorrect]`)
  expect(() =>
    utilisateurUpdationValidate(users.super, { id: newUtilisateurId('utilisateurId'), role: 'admin', administrationId: fakeAdministrationId, entrepriseIds: [] }, undefined)
  ).toThrowErrorMatchingInlineSnapshot(`[Error: utilisateur incorrect]`)

  expect(() =>
    utilisateurUpdationValidate(users.super, { id: newUtilisateurId('utilisateurId'), role: 'entreprise', administrationId: null, entrepriseIds: [] }, undefined)
  ).toThrowErrorMatchingInlineSnapshot(`[Error: utilisateur incorrect]`)
  expect(() =>
    utilisateurUpdationValidate(users.super, { id: newUtilisateurId('utilisateurId'), role: 'entreprise', administrationId: null, entrepriseIds: [] }, undefined)
  ).toThrowErrorMatchingInlineSnapshot(`[Error: utilisateur incorrect]`)
  expect(() =>
    utilisateurUpdationValidate(
      users.super,
      { id: newUtilisateurId('utilisateurId'), role: 'entreprise', administrationId: fakeAdministrationId, entrepriseIds: [newEntrepriseId('entrepriseId')] },
      undefined
    )
  ).toThrowErrorMatchingInlineSnapshot(`[Error: utilisateur incorrect]`)

  expect(() =>
    utilisateurUpdationValidate(users.super, { id: newUtilisateurId('utilisateurId'), role: 'super', entrepriseIds: [], administrationId: null }, undefined)
  ).toThrowErrorMatchingInlineSnapshot(`[Error: l'utilisateur n'existe pas]`)

  expect(() =>
    utilisateurUpdationValidate(
      users.admin,
      { id: newUtilisateurId('utilisateurId'), role: 'editeur', administrationId: 'aut-97300-01', entrepriseIds: [] },
      { ...testBlankUser, id: newUtilisateurId('fakeId'), role: 'admin', administrationId: 'aut-97300-01' }
    )
  ).not.toThrowError()
  expect(() =>
    utilisateurUpdationValidate(
      users.admin,
      { id: newUtilisateurId('utilisateurId'), role: 'admin', administrationId: 'aut-97300-01', entrepriseIds: [] },
      { ...testBlankUser, id: newUtilisateurId('fakeId'), role: 'editeur', administrationId: 'aut-97300-01' }
    )
  ).not.toThrowError()
  expect(() =>
    utilisateurUpdationValidate(
      users.admin,
      { id: newUtilisateurId('utilisateurId'), role: 'editeur', administrationId: 'aut-mrae-guyane-01', entrepriseIds: [] },
      { ...testBlankUser, id: newUtilisateurId('fakeId'), role: 'editeur', administrationId: 'aut-97300-01' }
    )
  ).toThrowErrorMatchingInlineSnapshot(`[Error: droits insuffisants]`)
  expect(() =>
    utilisateurUpdationValidate(
      users.admin,
      { id: newUtilisateurId('utilisateurId'), role: 'editeur', administrationId: 'aut-97300-01', entrepriseIds: [] },
      { ...testBlankUser, id: newUtilisateurId('fakeId'), role: 'editeur', administrationId: 'aut-mrae-guyane-01' }
    )
  ).toThrowErrorMatchingInlineSnapshot(`[Error: droits insuffisants]`)

  expect(() => utilisateurUpdationValidate(users.editeur, { ...users.editeur, administrationId: 'dea-reunion-01', entrepriseIds: [] }, { ...users.editeur })).toThrowErrorMatchingInlineSnapshot(
    `[Error: droits insuffisants]`
  )
  expect(() => utilisateurUpdationValidate(users.lecteur, { ...users.lecteur, administrationId: 'dea-reunion-01', entrepriseIds: [] }, { ...users.lecteur })).toThrowErrorMatchingInlineSnapshot(
    `[Error: droits insuffisants]`
  )

  expect(() =>
    utilisateurUpdationValidate(users.entreprise, { ...users.entreprise, administrationId: null, entrepriseIds: [newEntrepriseId('newEntreprise')] }, { ...users.entreprise })
  ).toThrowErrorMatchingInlineSnapshot(`[Error: droits insuffisants]`)
  expect(() =>
    utilisateurUpdationValidate(users['bureau d’études'], { ...users['bureau d’études'], administrationId: null, entrepriseIds: [newEntrepriseId('newEntreprise')] }, { ...users['bureau d’études'] })
  ).toThrowErrorMatchingInlineSnapshot(`[Error: droits insuffisants]`)
})
