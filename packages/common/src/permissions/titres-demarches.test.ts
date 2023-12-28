import { describe, expect, test } from 'vitest'
import { AdministrationId } from '../static/administrations.js'
import { canCreateOrEditDemarche, canCreateTravaux, canDeleteDemarche } from './titres-demarches.js'
import { testBlankUser, TestUser } from '../tests-utils.js'
import { TitresStatutIds } from '../static/titresStatuts.js'

describe('canCreateOrEditDemarche', () => {
  test.each<[AdministrationId, boolean]>([
    ['dre-ile-de-france-01', false],
    ['dea-guadeloupe-01', false],
    ['min-mtes-dgec-01', false],
    ['pre-42218-01', false],
    ['ope-ptmg-973-01', true],
    ['dea-guyane-01', false],
  ])('Vérifie si l’administration peut créer des démarches', async (administrationId, creation) => {
    expect(canCreateOrEditDemarche({ role: 'admin', administrationId, ...testBlankUser }, 'arm', TitresStatutIds.Valide, [])).toEqual(creation)
  })

  test('Une administration locale peut créer des démarches', () => {
    expect(canCreateOrEditDemarche({ role: 'admin', administrationId: 'dea-guyane-01', ...testBlankUser }, 'axm', TitresStatutIds.Valide, ['dea-guyane-01'])).toEqual(true)
  })

  test('Le PTMG ne peut pas créer de démarche sur une ARM classée', () => {
    expect(canCreateOrEditDemarche({ role: 'admin', administrationId: 'ope-ptmg-973-01', ...testBlankUser }, 'arm', TitresStatutIds.DemandeClassee, [])).toEqual(false)
  })

  test.each<[TestUser, boolean]>([
    [{ role: 'super' }, true],
    [{ role: 'entreprise', entreprises: [] }, false],
    [{ role: 'defaut' }, false],
  ])('Vérifie si un profil peut créer des démarches', async (user, creation) => {
    expect(canCreateOrEditDemarche({ ...user, ...testBlankUser }, 'arm', TitresStatutIds.Valide, [])).toEqual(creation)
  })
})

describe('canDeleteDemarche', () => {
  test.each<[AdministrationId, boolean]>([
    ['dre-ile-de-france-01', false],
    ['dea-guadeloupe-01', false],
    ['min-mtes-dgec-01', false],
    ['pre-42218-01', false],
    ['ope-ptmg-973-01', true],
    ['dea-guyane-01', false],
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
    [{ role: 'entreprise', entreprises: [] }, false],
    [{ role: 'defaut' }, false],
  ])('Vérifie si un profil peut supprimer des démarches', async (user, creation) => {
    expect(canDeleteDemarche({ ...user, ...testBlankUser }, 'arm', TitresStatutIds.Valide, [], { etapes: [] })).toEqual(creation)
  })
})

describe('canCreateTravaux', () => {
  test.each<[AdministrationId, boolean]>([
    ['dre-ile-de-france-01', false],
    ['dea-guadeloupe-01', false],
    ['min-mtes-dgec-01', false],
    ['pre-42218-01', false],
    ['ope-ptmg-973-01', false],
    ['dea-guyane-01', false],
  ])('Vérifie si l’administration peut créer des travaux', async (administrationId, creation) => {
    expect(canCreateTravaux({ role: 'admin', administrationId, ...testBlankUser }, 'arm', [])).toEqual(creation)
  })

  test('La DGTM peut créer des travaux sur les AXM', () => {
    expect(canCreateTravaux({ role: 'admin', administrationId: 'dea-guyane-01', ...testBlankUser }, 'axm', [])).toEqual(true)
  })

  test.each<[TestUser, boolean]>([
    [{ role: 'super' }, true],
    [{ role: 'entreprise', entreprises: [] }, false],
    [{ role: 'defaut' }, false],
  ])('Vérifie si un profil peut créer des travaux', async (user, creation) => {
    expect(canCreateTravaux({ ...user, ...testBlankUser }, 'arm', [])).toEqual(creation)
  })
})
