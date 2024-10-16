import { describe, expect, test } from 'vitest'
import { AdministrationId } from '../static/administrations'
import { canEditDemarche, canCreateTravaux, canDeleteDemarche, canCreateDemarche, canPublishResultatMiseEnConcurrence } from './titres-demarches'
import { testBlankUser, TestUser } from '../tests-utils'
import { TitresStatutIds } from '../static/titresStatuts'
import { caminoDateValidator, dateAddDays, toCaminoDate } from '../date'
import { demarcheIdValidator } from '../demarche'
import { ETAPES_TYPES } from '../static/etapesTypes'
import { EtapesTypesEtapesStatuts } from '../static/etapesTypesEtapesStatuts'
import { DATE_DEBUT_PROCEDURE_SPECIFIQUE } from '../machines'

describe('canEditDemarche', () => {
  test.each<[AdministrationId, boolean]>([
    ['dre-ile-de-france-01', false],
    ['dea-guadeloupe-01', false],
    ['min-mtes-dgec-01', false],
    ['pre-42218-01', false],
    ['ope-ptmg-973-01', false],
    ['dea-guyane-01', true],
  ])("Vérifie si l'administration peut modifier des démarches", async (administrationId, creation) => {
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
  ])("Vérifie si l'administration peut supprimer des démarches", async (administrationId, creation) => {
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
  test("Une administration locale peut créer des démarches si il n'y a pas d'octroi en cours de construction", () => {
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
  ])("Vérifie si l'administration peut créer des travaux", async (administrationId, creation) => {
    expect(canCreateTravaux({ role: 'admin', administrationId, ...testBlankUser }, 'arm', [], [])).toEqual(creation)
  })

  test('La DGTM peut créer des travaux sur les AXM', () => {
    expect(canCreateTravaux({ role: 'admin', administrationId: 'dea-guyane-01', ...testBlankUser }, 'axm', [], [{ demarche_date_debut: caminoDateValidator.parse('2023-01-01') }])).toEqual(true)
  })

  test("La DGTM ne peut pas créer des travaux sur les AXM si l'octroi n'est pas encore valide", () => {
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

describe('canPublishResultatMiseEnConcurrence', () => {
  const demarcheId = demarcheIdValidator.parse('demarcheId')
  test('machine non procédure spécifique', () => {
    expect(canPublishResultatMiseEnConcurrence({ ...testBlankUser, role: 'super' }, 'arm', 'oct', [{ date: toCaminoDate('2020-01-01'), etape_statut_id: 'fai', etape_type_id: 'mfr' }], demarcheId))
      .toMatchInlineSnapshot(`
      {
        "error": "Cette démarche n'est pas une procédure spécifique",
        "valid": false,
      }
    `)
  })
  test('mise en concurrence non terminée', () => {
    expect(
      canPublishResultatMiseEnConcurrence(
        { ...testBlankUser, role: 'super' },
        'arm',
        'oct',
        [{ date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 12), etape_statut_id: 'fai', etape_type_id: 'mfr' }],
        demarcheId
      )
    ).toMatchInlineSnapshot(`
      {
        "error": "Cette démarche n'a pas terminé sa mise en concurrence",
        "valid": false,
      }
    `)
  })
  test('pas les droits', () => {
    expect(
      canPublishResultatMiseEnConcurrence(
        { ...testBlankUser, role: 'defaut' },
        'arm',
        'oct',
        [
          {
            etape_type_id: ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF,
            etape_statut_id: EtapesTypesEtapesStatuts.avisDeMiseEnConcurrenceAuJORF.TERMINE.etapeStatutId,
            demarche_id_en_concurrence: null,
            date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 10),
          },
        ],
        demarcheId
      )
    ).toMatchInlineSnapshot(`
      {
        "error": "L'utilisateur ne dispose pas des droits suffisants",
        "valid": false,
      }
    `)
  })

  test('peut publier le résultat de la mise en concurrence', () => {
    expect(
      canPublishResultatMiseEnConcurrence(
        { ...testBlankUser, role: 'admin', administrationId: 'aut-mrae-guyane-01' },
        'arm',
        'oct',
        [
          {
            etape_type_id: ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF,
            etape_statut_id: EtapesTypesEtapesStatuts.avisDeMiseEnConcurrenceAuJORF.TERMINE.etapeStatutId,
            demarche_id_en_concurrence: null,
            date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 10),
          },
        ],
        demarcheId
      )
    ).toMatchInlineSnapshot(`
      {
        "error": null,
        "valid": true,
      }
    `)
  })

  test('ne peut publier pas le résultat de la mise en concurrence si déjà existant', () => {
    expect(
      canPublishResultatMiseEnConcurrence(
        { ...testBlankUser, role: 'editeur', administrationId: 'aut-mrae-guyane-01' },
        'arm',
        'oct',
        [
          {
            etape_type_id: ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF,
            etape_statut_id: EtapesTypesEtapesStatuts.avisDeMiseEnConcurrenceAuJORF.TERMINE.etapeStatutId,
            demarche_id_en_concurrence: null,
            date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 10),
          },
          {
            etape_type_id: ETAPES_TYPES.resultatMiseEnConcurrence,
            etape_statut_id: EtapesTypesEtapesStatuts.resultatMiseEnConcurrence.ACCEPTE.etapeStatutId,
            demarche_id_en_concurrence: null,
            date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 11),
          },
        ],
        demarcheId
      )
    ).toMatchInlineSnapshot(`
      {
        "error": "Cette démarche a déja un résultat final de la mise en concurrence",
        "valid": false,
      }
    `)
  })
})
