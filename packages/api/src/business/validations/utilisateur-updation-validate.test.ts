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
  expect(() => utilisateurUpdationValidate(users.defaut, { ...users.defaut, role: 'super', entreprises: [] }, users.defaut)).toThrowErrorMatchingInlineSnapshot(
    '"impossible de modifier son propre rôle"'
  )
  expect(() =>
    utilisateurUpdationValidate(
      users.admin,
      {
        ...users.admin,
        role: 'super',
        entreprises: [],
        administrationId: undefined,
      },
      users.admin
    )
  ).toThrowErrorMatchingInlineSnapshot('"impossible de modifier son propre rôle"')
  expect(() =>
    utilisateurUpdationValidate(
      users.lecteur,
      {
        ...users.lecteur,
        role: 'super',
        entreprises: [],
        administrationId: undefined,
      },
      users.lecteur
    )
  ).toThrowErrorMatchingInlineSnapshot('"impossible de modifier son propre rôle"')
  expect(() =>
    utilisateurUpdationValidate(
      users.editeur,
      {
        ...users.editeur,
        role: 'super',
        entreprises: [],
        administrationId: undefined,
      },
      users.editeur
    )
  ).toThrowErrorMatchingInlineSnapshot('"impossible de modifier son propre rôle"')
  expect(() => utilisateurUpdationValidate(users.entreprise, { ...users.entreprise, role: 'super', entreprises: [] }, users.entreprise)).toThrowErrorMatchingInlineSnapshot(
    '"impossible de modifier son propre rôle"'
  )
  expect(() => utilisateurUpdationValidate(users['bureau d’études'], { ...users['bureau d’études'], role: 'super', entreprises: [] }, users.entreprise)).toThrowErrorMatchingInlineSnapshot(
    '"impossible de modifier son propre rôle"'
  )

  expect(() =>
    utilisateurUpdationValidate(
      users.editeur,
      {
        ...users.editeur,
        role: 'entreprise',
        administrationId: undefined,
        entreprises: [{ id: newEntrepriseId('id') }],
      },
      users.editeur
    )
  ).toThrowErrorMatchingInlineSnapshot('"impossible de modifier son propre rôle"')
  expect(() =>
    utilisateurUpdationValidate(
      users.defaut,
      {
        ...users.defaut,
        role: 'entreprise',
        entreprises: [{ id: newEntrepriseId('id') }],
      },
      users.defaut
    )
  ).toThrowErrorMatchingInlineSnapshot('"impossible de modifier son propre rôle"')
})

test('utilisateurUpdationValidate incorrect users throw error', () => {
  expect(() =>
    utilisateurUpdationValidate(
      users.super,
      {
        id: 'utilisateurId',
        role: 'super',
      },
      undefined
    )
  ).toThrowErrorMatchingInlineSnapshot('"utilisateur incorrect"')
  expect(() =>
    utilisateurUpdationValidate(
      users.super,
      {
        id: 'utilisateurId',
        role: 'super',
        email: 'toto@gmail.com',
        entreprises: [{ id: newEntrepriseId('entrepriseId') }],
      },
      undefined
    )
  ).toThrowErrorMatchingInlineSnapshot('"utilisateur incorrect"')
  expect(() =>
    utilisateurUpdationValidate(
      users.super,
      {
        id: 'utilisateurId',
        role: 'super',
        email: 'toto@gmail.com',
        administrationId: 'aut-97300-01',
      },
      undefined
    )
  ).toThrowErrorMatchingInlineSnapshot('"utilisateur incorrect"')

  expect(() =>
    utilisateurUpdationValidate(
      users.super,
      {
        id: 'utilisateurId',
        role: 'defaut',
      },
      undefined
    )
  ).toThrowErrorMatchingInlineSnapshot('"utilisateur incorrect"')
  expect(() =>
    utilisateurUpdationValidate(
      users.super,
      {
        id: 'utilisateurId',
        role: 'defaut',
        email: 'toto@gmail.com',
        entreprises: [{ id: newEntrepriseId('entrepriseId') }],
      },
      undefined
    )
  ).toThrowErrorMatchingInlineSnapshot('"utilisateur incorrect"')
  expect(() =>
    utilisateurUpdationValidate(
      users.super,
      {
        id: 'utilisateurId',
        role: 'defaut',
        email: 'toto@gmail.com',
        administrationId: 'aut-97300-01',
      },
      undefined
    )
  ).toThrowErrorMatchingInlineSnapshot('"utilisateur incorrect"')

  expect(() =>
    utilisateurUpdationValidate(
      users.super,
      {
        id: 'utilisateurId',
        role: 'admin',
      },
      undefined
    )
  ).toThrowErrorMatchingInlineSnapshot('"utilisateur incorrect"')
  expect(() =>
    utilisateurUpdationValidate(
      users.super,
      {
        id: 'utilisateurId',
        role: 'admin',
        email: 'toto@gmail.com',
        entreprises: [{ id: newEntrepriseId('entrepriseId') }],
      },
      undefined
    )
  ).toThrowErrorMatchingInlineSnapshot('"utilisateur incorrect"')
  expect(() =>
    utilisateurUpdationValidate(
      users.super,
      {
        id: 'utilisateurId',
        role: 'admin',
        email: 'toto@gmail.com',
        administrationId: fakeAdministrationId,
      },
      undefined
    )
  ).toThrowErrorMatchingInlineSnapshot('"utilisateur incorrect"')

  expect(() =>
    utilisateurUpdationValidate(
      users.super,
      {
        id: 'utilisateurId',
        role: 'entreprise',
      },
      undefined
    )
  ).toThrowErrorMatchingInlineSnapshot('"utilisateur incorrect"')
  expect(() =>
    utilisateurUpdationValidate(
      users.super,
      {
        id: 'utilisateurId',
        role: 'entreprise',
        email: 'toto@gmail.com',
        entreprises: [],
      },
      undefined
    )
  ).toThrowErrorMatchingInlineSnapshot('"utilisateur incorrect"')
  expect(() =>
    utilisateurUpdationValidate(
      users.super,
      {
        id: 'utilisateurId',
        role: 'entreprise',
        email: 'toto@gmail.com',
        administrationId: fakeAdministrationId,
        entreprises: [{ id: newEntrepriseId('entrepriseId') }],
      },
      undefined
    )
  ).toThrowErrorMatchingInlineSnapshot('"utilisateur incorrect"')

  expect(() =>
    utilisateurUpdationValidate(
      users.super,
      {
        id: 'utilisateurId',
        role: 'super',
        email: 'toto@gmail.com',
        entreprises: [],
      },
      undefined
    )
  ).toThrowErrorMatchingInlineSnapshot('"l\'utilisateur n\'existe pas"')

  expect(() =>
    utilisateurUpdationValidate(
      users.admin,
      {
        id: 'utilisateurId',
        role: 'editeur',
        administrationId: 'aut-97300-01',
        email: 'toto@gmail.com',
        entreprises: [],
      },
      {
        ...testBlankUser,
        id: 'fakeId',
        role: 'admin',
        administrationId: 'aut-97300-01',
      }
    )
  ).toThrowErrorMatchingInlineSnapshot('"droits insuffisants"')
  expect(() =>
    utilisateurUpdationValidate(
      users.admin,
      {
        id: 'utilisateurId',
        role: 'admin',
        administrationId: 'aut-97300-01',
        email: 'toto@gmail.com',
        entreprises: [],
      },
      {
        ...testBlankUser,
        id: 'fakeId',
        role: 'editeur',
        administrationId: 'aut-97300-01',
      }
    )
  ).toThrowErrorMatchingInlineSnapshot('"droits insuffisants"')
  expect(() =>
    utilisateurUpdationValidate(
      users.admin,
      {
        id: 'utilisateurId',
        role: 'editeur',
        administrationId: 'aut-mrae-guyane-01',
        email: 'toto@gmail.com',
        entreprises: [],
      },
      {
        ...testBlankUser,
        id: 'fakeId',
        role: 'editeur',
        administrationId: 'aut-97300-01',
      }
    )
  ).toThrowErrorMatchingInlineSnapshot('"droits insuffisants"')
  expect(() =>
    utilisateurUpdationValidate(
      users.admin,
      {
        id: 'utilisateurId',
        role: 'editeur',
        administrationId: 'aut-97300-01',
        email: 'toto@gmail.com',
        entreprises: [],
      },
      {
        ...testBlankUser,
        id: 'fakeId',
        role: 'editeur',
        administrationId: 'aut-mrae-guyane-01',
      }
    )
  ).toThrowErrorMatchingInlineSnapshot('"droits insuffisants"')

  expect(() => utilisateurUpdationValidate(users.editeur, { ...users.editeur, administrationId: 'dea-reunion-01', entreprises: [] }, { ...users.editeur })).toThrowErrorMatchingInlineSnapshot(
    '"droits insuffisants pour modifier les administrations"'
  )
  expect(() => utilisateurUpdationValidate(users.lecteur, { ...users.lecteur, administrationId: 'dea-reunion-01', entreprises: [] }, { ...users.lecteur })).toThrowErrorMatchingInlineSnapshot(
    '"droits insuffisants pour modifier les administrations"'
  )

  expect(() =>
    utilisateurUpdationValidate(
      users.entreprise,
      {
        ...users.entreprise,
        entreprises: [{ id: newEntrepriseId('newEntreprise') }],
      },
      { ...users.entreprise }
    )
  ).toThrowErrorMatchingInlineSnapshot('"droits insuffisants pour modifier les entreprises"')
  expect(() =>
    utilisateurUpdationValidate(
      users['bureau d’études'],
      {
        ...users['bureau d’études'],
        entreprises: [{ id: newEntrepriseId('newEntreprise') }],
      },
      { ...users['bureau d’études'] }
    )
  ).toThrowErrorMatchingInlineSnapshot('"droits insuffisants pour modifier les entreprises"')
})
