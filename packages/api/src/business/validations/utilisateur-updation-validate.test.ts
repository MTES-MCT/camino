import { newEntrepriseId } from 'camino-common/src/entreprise'
import { Role, UserNotNull } from 'camino-common/src/roles'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { test, expect } from 'vitest'
import { utilisateurUpdationValidate } from './utilisateur-updation-validate'

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
  entreprise: { ...testBlankUser, role: 'entreprise', entreprises: [] },
  'bureau d’études': {
    ...testBlankUser,
    role: 'bureau d’études',
    entreprises: [],
  },
  defaut: { ...testBlankUser, role: 'defaut' },
}

const fakeAdministrationId = 'fakeAdminId' as AdministrationId

test('utilisateurUpdationValidate privilege escalation forbidden', () => {
  expect(() => utilisateurUpdationValidate(users.defaut, { ...users.defaut, role: 'super', administrationId: null, entreprises: [] }, users.defaut)).toThrowErrorMatchingInlineSnapshot(
    '"droits insuffisants"'
  )
  expect(() => utilisateurUpdationValidate(users.admin, { ...users.admin, role: 'super', entreprises: [], administrationId: null }, users.admin)).toThrowErrorMatchingInlineSnapshot(
    '"droits insuffisants"'
  )
  expect(() => utilisateurUpdationValidate(users.lecteur, { ...users.lecteur, role: 'super', entreprises: [], administrationId: null }, users.lecteur)).toThrowErrorMatchingInlineSnapshot(
    '"droits insuffisants"'
  )
  expect(() => utilisateurUpdationValidate(users.editeur, { ...users.editeur, role: 'super', entreprises: [], administrationId: null }, users.editeur)).toThrowErrorMatchingInlineSnapshot(
    '"droits insuffisants"'
  )
  expect(() => utilisateurUpdationValidate(users.entreprise, { ...users.entreprise, role: 'super', entreprises: [], administrationId: null }, users.entreprise)).toThrowErrorMatchingInlineSnapshot(
    '"droits insuffisants"'
  )
  expect(() =>
    utilisateurUpdationValidate(users['bureau d’études'], { ...users['bureau d’études'], role: 'super', entreprises: [], administrationId: null }, users.entreprise)
  ).toThrowErrorMatchingInlineSnapshot('"droits insuffisants"')

  expect(() =>
    utilisateurUpdationValidate(users.editeur, { ...users.editeur, role: 'entreprise', administrationId: null, entreprises: [newEntrepriseId('id')] }, users.editeur)
  ).toThrowErrorMatchingInlineSnapshot('"droits insuffisants"')
  expect(() =>
    utilisateurUpdationValidate(users.defaut, { ...users.defaut, role: 'entreprise', administrationId: null, entreprises: [newEntrepriseId('id')] }, users.defaut)
  ).toThrowErrorMatchingInlineSnapshot('"droits insuffisants"')
})

test.only('utilisateurUpdationValidate incorrect users throw error', () => {
  expect(() => utilisateurUpdationValidate(users.super, { id: 'utilisateurId', role: 'super', administrationId: null, entreprises: [] }, undefined)).toThrowErrorMatchingInlineSnapshot(
    '"l\'utilisateur n\'existe pas"'
  )

  expect(() =>
    utilisateurUpdationValidate(users.super, { id: 'utilisateurId', role: 'super', entreprises: [newEntrepriseId('entrepriseId')], administrationId: null }, undefined)
  ).toThrowErrorMatchingInlineSnapshot('"utilisateur incorrect"')
  expect(() => utilisateurUpdationValidate(users.super, { id: 'utilisateurId', role: 'super', administrationId: 'aut-97300-01', entreprises: [] }, undefined)).toThrowErrorMatchingInlineSnapshot(
    '"utilisateur incorrect"'
  )

  expect(() => utilisateurUpdationValidate(users.super, { id: 'utilisateurId', role: 'defaut', administrationId: null, entreprises: [] }, undefined)).toThrowErrorMatchingInlineSnapshot(
    '"l\'utilisateur n\'existe pas"'
  )
  expect(() =>
    utilisateurUpdationValidate(users.super, { id: 'utilisateurId', role: 'defaut', entreprises: [newEntrepriseId('entrepriseId')], administrationId: null }, undefined)
  ).toThrowErrorMatchingInlineSnapshot('"utilisateur incorrect"')
  expect(() => utilisateurUpdationValidate(users.super, { id: 'utilisateurId', role: 'defaut', administrationId: 'aut-97300-01', entreprises: [] }, undefined)).toThrowErrorMatchingInlineSnapshot(
    '"utilisateur incorrect"'
  )

  expect(() => utilisateurUpdationValidate(users.super, { id: 'utilisateurId', role: 'admin', administrationId: null, entreprises: [] }, undefined)).toThrowErrorMatchingInlineSnapshot(
    '"utilisateur incorrect"'
  )
  expect(() =>
    utilisateurUpdationValidate(users.super, { id: 'utilisateurId', role: 'admin', entreprises: [newEntrepriseId('entrepriseId')], administrationId: null }, undefined)
  ).toThrowErrorMatchingInlineSnapshot('"utilisateur incorrect"')
  expect(() => utilisateurUpdationValidate(users.super, { id: 'utilisateurId', role: 'admin', administrationId: fakeAdministrationId, entreprises: [] }, undefined)).toThrowErrorMatchingInlineSnapshot(
    '"utilisateur incorrect"'
  )

  expect(() => utilisateurUpdationValidate(users.super, { id: 'utilisateurId', role: 'entreprise', administrationId: null, entreprises: [] }, undefined)).toThrowErrorMatchingInlineSnapshot(
    '"utilisateur incorrect"'
  )
  expect(() => utilisateurUpdationValidate(users.super, { id: 'utilisateurId', role: 'entreprise', administrationId: null, entreprises: [] }, undefined)).toThrowErrorMatchingInlineSnapshot(
    '"utilisateur incorrect"'
  )
  expect(() =>
    utilisateurUpdationValidate(users.super, { id: 'utilisateurId', role: 'entreprise', administrationId: fakeAdministrationId, entreprises: [newEntrepriseId('entrepriseId')] }, undefined)
  ).toThrowErrorMatchingInlineSnapshot('"utilisateur incorrect"')

  expect(() => utilisateurUpdationValidate(users.super, { id: 'utilisateurId', role: 'super', entreprises: [], administrationId: null }, undefined)).toThrowErrorMatchingInlineSnapshot(
    '"l\'utilisateur n\'existe pas"'
  )

  expect(() =>
    utilisateurUpdationValidate(
      users.admin,
      { id: 'utilisateurId', role: 'editeur', administrationId: 'aut-97300-01', entreprises: [] },
      { ...testBlankUser, id: 'fakeId', role: 'admin', administrationId: 'aut-97300-01' }
    )
  ).toThrowErrorMatchingInlineSnapshot('"droits insuffisants"')
  expect(() =>
    utilisateurUpdationValidate(
      users.admin,
      { id: 'utilisateurId', role: 'admin', administrationId: 'aut-97300-01', entreprises: [] },
      { ...testBlankUser, id: 'fakeId', role: 'editeur', administrationId: 'aut-97300-01' }
    )
  ).toThrowErrorMatchingInlineSnapshot('"droits insuffisants"')
  expect(() =>
    utilisateurUpdationValidate(
      users.admin,
      { id: 'utilisateurId', role: 'editeur', administrationId: 'aut-mrae-guyane-01', entreprises: [] },
      { ...testBlankUser, id: 'fakeId', role: 'editeur', administrationId: 'aut-97300-01' }
    )
  ).toThrowErrorMatchingInlineSnapshot('"droits insuffisants"')
  expect(() =>
    utilisateurUpdationValidate(
      users.admin,
      { id: 'utilisateurId', role: 'editeur', administrationId: 'aut-97300-01', entreprises: [] },
      { ...testBlankUser, id: 'fakeId', role: 'editeur', administrationId: 'aut-mrae-guyane-01' }
    )
  ).toThrowErrorMatchingInlineSnapshot('"droits insuffisants"')

  expect(() => utilisateurUpdationValidate(users.editeur, { ...users.editeur, administrationId: 'dea-reunion-01', entreprises: [] }, { ...users.editeur })).toThrowErrorMatchingInlineSnapshot(
    '"droits insuffisants"'
  )
  expect(() => utilisateurUpdationValidate(users.lecteur, { ...users.lecteur, administrationId: 'dea-reunion-01', entreprises: [] }, { ...users.lecteur })).toThrowErrorMatchingInlineSnapshot(
    '"droits insuffisants"'
  )

  expect(() =>
    utilisateurUpdationValidate(users.entreprise, { ...users.entreprise, administrationId: null, entreprises: [newEntrepriseId('newEntreprise')] }, { ...users.entreprise })
  ).toThrowErrorMatchingInlineSnapshot('"droits insuffisants"')
  expect(() =>
    utilisateurUpdationValidate(users['bureau d’études'], { ...users['bureau d’études'], administrationId: null, entreprises: [newEntrepriseId('newEntreprise')] }, { ...users['bureau d’études'] })
  ).toThrowErrorMatchingInlineSnapshot('"droits insuffisants"')
})
