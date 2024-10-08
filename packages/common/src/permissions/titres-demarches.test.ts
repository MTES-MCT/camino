import { describe, expect, test } from 'vitest'
import { AdministrationId } from '../static/administrations'
import { canEditDemarche, canCreateTravaux, canDeleteDemarche, canCreateDemarche } from './titres-demarches'
import { testBlankUser, TestUser } from '../tests-utils'
import { TitresStatutIds } from '../static/titresStatuts'
import { caminoDateValidator } from '../date'

describe('canEditDemarche', () => {
  test.each<[AdministrationId, boolean]>([
    ['dre-ile-de-france-01', false],
    ['dea-guadeloupe-01', false],
    ['min-mtes-dgec-01', false],
    ['pre-42218-01', false],
    ['ope-ptmg-973-01', false],
    ['dea-guyane-01', true],
  ])('Vérifie si l’administration peut modifier des démarches', async (administrationId, creation) => {
    expect(canEditDemarche({ role: 'admin', administrationId, ...testBlankUser }, 'arm', TitresStatutIds.Valide, [])).toEqual(creation)
  })

  test('Une administration locale peut modifier des démarches', () => {
    expect(canEditDemarche({ role: 'admin', administrationId: 'dea-guyane-01', ...testBlankUser }, 'axm', TitresStatutIds.Valide, ['dea-guyane-01'])).toEqual(true)
  })

  test('Le PTMG ne peut pas modifier de démarche sur une ARM classée', () => {
    expect(canEditDemarche({ role: 'admin', administrationId: 'ope-ptmg-973-01', ...testBlankUser }, 'arm', TitresStatutIds.DemandeClassee, [])).toEqual(false)
  })

  test.each<[TestUser, boolean]>([
    [{ role: 'super' }, true],
    [{ role: 'entreprise', entrepriseIds: [] }, false],
    [{ role: 'defaut' }, false],
  ])('Vérifie si un profil peut modifier des démarches', async (user, creation) => {
    expect(canEditDemarche({ ...user, ...testBlankUser }, 'arm', TitresStatutIds.Valide, [])).toEqual(creation)
  })
})

describe('canDeleteDemarche', () => {
  test.each<[AdministrationId, boolean]>([
    ['dre-ile-de-france-01', false],
    ['dea-guadeloupe-01', false],
    ['min-mtes-dgec-01', false],
    ['pre-42218-01', false],
    ['ope-ptmg-973-01', false],
    ['dea-guyane-01', true],
  ])('Vérifie si l’administration peut supprimer des démarches', async (administrationId, creation) => {
    expect(canDeleteDemarche({ role: 'admin', administrationId, ...testBlankUser }, 'arm', TitresStatutIds.Valide, [], { etapes: [] })).toEqual(creation)
  })

  test("Une administration locale peut supprimer des démarches si elles n'ont pas d'étapes", () => {
    expect(canDeleteDemarche({ role: 'admin', administrationId: 'dea-guyane-01', ...testBlankUser }, 'axm', TitresStatutIds.Valide, ['dea-guyane-01'], { etapes: [] })).toEqual(true)
  })

  test('Une administration ne peut pas supprimer de démarche si elle a des étapes', () => {
    expect(canDeleteDemarche({ role: 'admin', administrationId: 'dea-guyane-01', ...testBlankUser }, 'axm', TitresStatutIds.Valide, ['dea-guyane-01'], { etapes: ['notEmptyArray'] })).toEqual(false)
  })

  test.each<[TestUser, boolean]>([
    [{ role: 'super' }, true],
    [{ role: 'entreprise', entrepriseIds: [] }, false],
    [{ role: 'defaut' }, false],
  ])('Vérifie si un profil peut supprimer des démarches', async (user, creation) => {
    expect(canDeleteDemarche({ ...user, ...testBlankUser }, 'arm', TitresStatutIds.Valide, [], { etapes: [] })).toEqual(creation)
  })
})

describe('canCreateDemarche', () => {
  test('Une administration locale peut créer des démarches si il n’y a pas d’octroi en cours de construction', () => {
    expect(
      canCreateDemarche(
        { role: 'admin', administrationId: 'dea-guyane-01', ...testBlankUser },
        'axm',
        TitresStatutIds.Valide,
        ['dea-guyane-01'],
        [{ demarche_date_debut: caminoDateValidator.parse('2023-01-01') }]
      )
    ).toEqual(true)
  })
  test('Une administration locale ne peut pas créer de démarche si il y a un octroi en cours de construction', () => {
    expect(canCreateDemarche({ role: 'admin', administrationId: 'dea-guyane-01', ...testBlankUser }, 'axm', TitresStatutIds.Valide, ['dea-guyane-01'], [{ demarche_date_debut: null }])).toEqual(false)
  })
})

describe('canCreateTravaux', () => {
  test.each<[AdministrationId, boolean]>([
    ['dre-ile-de-france-01', false],
    ['dea-guadeloupe-01', false],
    ['min-mtes-dgec-01', false],
    ['pre-42218-01', false],
    ['ope-ptmg-973-01', false],
    ['dea-guyane-01', true],
  ])('Vérifie si l’administration peut créer des travaux', async (administrationId, creation) => {
    expect(canCreateTravaux({ role: 'admin', administrationId, ...testBlankUser }, 'arm', [], [])).toEqual(creation)
  })

  test('La DGTM peut créer des travaux sur les AXM', () => {
    expect(canCreateTravaux({ role: 'admin', administrationId: 'dea-guyane-01', ...testBlankUser }, 'axm', [], [{ demarche_date_debut: caminoDateValidator.parse('2023-01-01') }])).toEqual(true)
  })

  test('La DGTM ne peut pas créer des travaux sur les AXM si l’octroi n’est pas encore valide', () => {
    expect(canCreateTravaux({ role: 'admin', administrationId: 'dea-guyane-01', ...testBlankUser }, 'axm', [], [{ demarche_date_debut: null }])).toEqual(false)
  })

  test.each<[TestUser, boolean]>([
    [{ role: 'super' }, true],
    [{ role: 'entreprise', entrepriseIds: [] }, false],
    [{ role: 'defaut' }, false],
  ])('Vérifie si un profil peut créer des travaux', async (user, creation) => {
    expect(canCreateTravaux({ ...user, ...testBlankUser }, 'arm', [], [])).toEqual(creation)
  })
})
