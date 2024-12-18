import { restDeleteCall, restDownloadCall, restNewCall, restNewPostCall } from '../../../tests/_utils/index'
import { dbManager } from '../../../tests/db-manager'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http'
import { dateAddDays, toCaminoDate } from 'camino-common/src/date'
import { titreSlugValidator } from 'camino-common/src/validators/titres'
import { newTitreId, newDemarcheId, newEtapeId } from '../../database/models/_format/id-create'
import TitresDemarches from '../../database/models/titres-demarches'
import Titres from '../../database/models/titres'
import { userSuper } from '../../database/user-super'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { entrepriseUpsert } from '../../database/queries/entreprises'
import { FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { codePostalValidator } from 'camino-common/src/static/departement'
import crypto from 'crypto'
import { km2Validator } from 'camino-common/src/number'
import { demarcheIdValidator, demarcheSlugValidator } from 'camino-common/src/demarche'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { insertTitreGraph } from '../../../tests/integration-test-helper'
import TitresEtapes from '../../database/models/titres-etapes'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes'
import { DATE_DEBUT_PROCEDURE_SPECIFIQUE } from 'camino-common/src/machines'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { DOWNLOAD_FORMATS } from 'camino-common/src/rest'
import { REFERENCES_TYPES_IDS } from 'camino-common/src/static/referencesTypes'

console.info = vi.fn()
console.error = vi.fn()
console.warn = vi.fn()
let dbPool: Pool
beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool
})

afterAll(async () => {
  await dbManager.closeKnex()
})

const multiPolygonWith4Points: FeatureMultiPolygon = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [-53.16822754488772, 5.02935254143807],
          [-53.15913163720232, 5.029382753429523],
          [-53.15910186841349, 5.020342601941031],
          [-53.168197650929095, 5.02031244452273],
          [-53.16822754488772, 5.02935254143807],
        ],
      ],
    ],
  },
}

describe('downloadDemarches', () => {
  const demarcheId = newDemarcheId('demarche-id')
  beforeAll(async () => {
    const titulaireId = entrepriseIdValidator.parse('titulaireid')
    await entrepriseUpsert({
      id: titulaireId,
      nom: 'Mon Titulaire',
      adresse: 'Une adresse',
      legalSiren: 'SIREN1',
      codePostal: codePostalValidator.parse('10000'),
      commune: 'Commune',
    })
    const amodiataireId = entrepriseIdValidator.parse('amodiataireid')
    await entrepriseUpsert({
      id: amodiataireId,
      nom: 'Mon Amodiataire',
      adresse: 'Une adresse',
      legalSiren: 'SIREN2',
      codePostal: codePostalValidator.parse('10000'),
      commune: 'Commune',
    })

    const titreId = newTitreId('titre-id')
    await Titres.query().insert({
      id: titreId,
      nom: 'mon titre',
      typeId: TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
      titreStatutId: TitresStatutIds.Valide,
      propsTitreEtapesIds: {
        titulaires: titulaireId,
        amodiataires: amodiataireId,
      },
      slug: titreSlugValidator.parse('slug'),
      archive: false,
      references: [{ nom: 'Test', referenceTypeId: REFERENCES_TYPES_IDS.NOM_USAGE }],
    })

    await TitresDemarches.query().insert({
      id: demarcheId,
      titreId,
      typeId: DEMARCHES_TYPES_IDS.Octroi,
      description: 'description',
    })

    const etapeId = newEtapeId('titre-etape-id')
    await TitresEtapes.query().insert({
      id: etapeId,
      titreDemarcheId: demarcheId,
      typeId: ETAPES_TYPES.demande,
      statutId: ETAPES_STATUTS.FAIT,
      date: toCaminoDate('2022-01-01'),
      ordre: 1,
      surface: km2Validator.parse(42),
      geojson4326Perimetre: multiPolygonWith4Points,
      geojsonOriginePerimetre: multiPolygonWith4Points,
      geojsonOrigineGeoSystemeId: '4326',
      titulaireIds: [titulaireId],
      amodiataireIds: [amodiataireId],
      etapeFondamentaleId: etapeId,
    })
  })

  test('peut récupérer des démarches au format csv par défaut', async () => {
    const tested = await restDownloadCall(dbPool, '/demarches', {}, userSuper)

    expect(tested.statusCode).toBe(HTTP_STATUS.OK)
    expect(tested.headers['content-type']).toBe('text/csv; charset=utf-8')
    expect(tested.text)
      .toMatchInlineSnapshot(`"titre_id,titre_nom,titre_domaine,titre_type,titre_statut,type,statut,description,surface km2,titre_references,titulaires_noms,titulaires_adresses,titulaires_legal,amodiataires_noms,amodiataires_adresses,amodiataires_legal,demande,forets,communes
slug,mon titre,minéraux et métaux,autorisation d'exploitation,valide,octroi,indéterminé,description,42,Nom d'usage : Test,Mon Titulaire,Une adresse 10000 Commune,SIREN1,Mon Amodiataire,Une adresse 10000 Commune,SIREN2,2022-01-01,,"`)
  })

  test('peut récupérer des démarches au format xlsx', async () => {
    const tested = await restDownloadCall(dbPool, '/demarches', {}, userSuper, { format: 'xlsx' })

    expect(tested.statusCode).toBe(HTTP_STATUS.OK)
    expect(tested.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    expect(crypto.createHash('md5').update(tested.text).digest('hex')).toBe('b338f1d36d6d79bf6378eebce0480f72')
  })

  test('récupère les titulaires, amodiataires, et surfaces les plus récents', async () => {
    const titulaireId2 = entrepriseIdValidator.parse('titulaireid2')
    await entrepriseUpsert({
      id: titulaireId2,
      nom: 'Mon Titulaire 2',
      adresse: 'Une adresse',
      legalSiren: 'SIREN1',
      codePostal: codePostalValidator.parse('10000'),
      commune: 'Commune',
    })
    const amodiataireId2 = entrepriseIdValidator.parse('amodiataireid2')
    await entrepriseUpsert({
      id: amodiataireId2,
      nom: 'Mon Amodiataire 2',
      adresse: 'Une adresse',
      legalSiren: 'SIREN2',
      codePostal: codePostalValidator.parse('10000'),
      commune: 'Commune',
    })

    const etapeId2 = newEtapeId('titre-etape-id2')
    await TitresEtapes.query().insert({
      id: etapeId2,
      titreDemarcheId: demarcheId,
      typeId: ETAPES_TYPES.demande,
      statutId: ETAPES_STATUTS.FAIT,
      date: toCaminoDate('2023-01-01'),
      ordre: 2,
      surface: km2Validator.parse(102),
      geojson4326Perimetre: multiPolygonWith4Points,
      geojsonOriginePerimetre: multiPolygonWith4Points,
      geojsonOrigineGeoSystemeId: '4326',
      titulaireIds: [titulaireId2],
      amodiataireIds: [amodiataireId2],
    })

    const tested = await restDownloadCall(dbPool, '/demarches', {}, userSuper, { format: DOWNLOAD_FORMATS.Csv })

    expect(tested.statusCode).toBe(HTTP_STATUS.OK)
    expect(tested.headers['content-type']).toBe('text/csv; charset=utf-8')
    expect(tested.text)
      .toMatchInlineSnapshot(`"titre_id,titre_nom,titre_domaine,titre_type,titre_statut,type,statut,description,surface km2,titre_references,titulaires_noms,titulaires_adresses,titulaires_legal,amodiataires_noms,amodiataires_adresses,amodiataires_legal,demande,forets,communes
slug,mon titre,minéraux et métaux,autorisation d'exploitation,valide,octroi,indéterminé,description,102,Nom d'usage : Test,Mon Titulaire 2,Une adresse 10000 Commune,SIREN1,Mon Amodiataire 2,Une adresse 10000 Commune,SIREN2,2022-01-01,,"`)
  })
})

describe('demarcheSupprimer', () => {
  test('ne peut pas supprimer une démarche (utilisateur anonyme)', async () => {
    const { demarcheId } = await demarcheCreate()
    const res = await restDeleteCall(dbPool, '/rest/demarches/:demarcheIdOrSlug', { demarcheIdOrSlug: demarcheId }, undefined)
    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN)
  })

  test('ne peut pas supprimer une démarche si l utilisateur n a pas accès à la démarche (utilisateur admin)', async () => {
    const { demarcheId } = await demarcheCreate()
    const res = await restDeleteCall(dbPool, '/rest/demarches/:demarcheIdOrSlug', { demarcheIdOrSlug: demarcheId }, { role: 'admin', administrationId: 'dea-mayotte-01' })
    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN)
  })

  test('ne peut pas supprimer une démarche inexistante (utilisateur super)', async () => {
    const res = await restDeleteCall(dbPool, '/rest/demarches/:demarcheIdOrSlug', { demarcheIdOrSlug: demarcheIdValidator.parse('toto') }, userSuper)
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST)
  })

  test('peut supprimer une démarche (utilisateur super)', async () => {
    const { demarcheId } = await demarcheCreate()

    let demarche = await TitresDemarches.query().findById(demarcheId)
    expect(demarche?.archive).toBe(false)

    const res = await restDeleteCall(dbPool, '/rest/demarches/:demarcheIdOrSlug', { demarcheIdOrSlug: demarcheId }, userSuper)
    expect(res.body.errors).toBe(undefined)

    demarche = await TitresDemarches.query().findById(demarcheId)
    expect(demarche?.archive).toBe(true)
  })
})

describe('demarcheCreer', () => {
  test('ne peut pas créer une démarche (utilisateur anonyme)', async () => {
    const titreId = newTitreId()
    await insertTitreGraph({
      id: titreId,
      nom: 'mon titre',
      typeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      titreStatutId: TitresStatutIds.Indetermine,
      propsTitreEtapesIds: {},
      publicLecture: true,
    })

    const res = await restNewPostCall(dbPool, '/rest/demarches', {}, undefined, { titreId, typeId: DEMARCHES_TYPES_IDS.Octroi, description: '' })

    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN)
  })

  test('ne peut pas créer une démarche (utilisateur editeur)', async () => {
    const titreId = newTitreId()
    await insertTitreGraph({
      id: titreId,
      nom: 'mon titre',
      typeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      titreStatutId: TitresStatutIds.Indetermine,
      propsTitreEtapesIds: {},
      publicLecture: true,
    })

    const res = await restNewPostCall(
      dbPool,
      '/rest/demarches',
      {},
      {
        role: 'editeur',
        administrationId: 'ope-onf-973-01',
      },
      { titreId, typeId: DEMARCHES_TYPES_IDS.Octroi, description: '' }
    )

    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(res.body.message).toBe('droits insuffisants')
  })

  test('peut créer une démarche (utilisateur super)', async () => {
    const titreId = newTitreId()
    await insertTitreGraph({ id: titreId, nom: 'titre', typeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, titreStatutId: TitresStatutIds.Valide, propsTitreEtapesIds: {} })

    const res = await restNewPostCall(dbPool, '/rest/demarches', {}, userSuper, { titreId, typeId: DEMARCHES_TYPES_IDS.Octroi, description: '' })

    expect(res.status).toBe(HTTP_STATUS.OK)
    expect(res.body).toMatchObject({ slug: {} })
  })

  test('ne peut pas créer une démarche si titre inexistant (utilisateur admin)', async () => {
    const res = await restNewPostCall(
      dbPool,
      '/rest/demarches',
      {},
      {
        role: 'admin',
        administrationId: 'ope-onf-973-01',
      },
      { titreId: newTitreId('unknown'), typeId: DEMARCHES_TYPES_IDS.Octroi, description: '' }
    )
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(res.body.message).toBe("le titre n'existe pas")
  })

  test('peut créer une démarche (utilisateur admin)', async () => {
    const titreId = newTitreId()
    await insertTitreGraph({ id: titreId, nom: 'titre', typeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX, titreStatutId: TitresStatutIds.Valide, propsTitreEtapesIds: {} })

    const res = await restNewPostCall(
      dbPool,
      '/rest/demarches',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
      },
      { titreId, typeId: DEMARCHES_TYPES_IDS.Octroi, description: '' }
    )

    expect(res.status).toBe(HTTP_STATUS.OK)
    expect(res.body).toMatchObject({ slug: {} })
  })

  test("ne peut pas créer une démarche sur un titre ARM échu (un utilisateur 'admin' PTMG)", async () => {
    const titreId = newTitreId()
    await insertTitreGraph({
      id: titreId,
      nom: 'mon titre échu',
      typeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      titreStatutId: TitresStatutIds.Echu,
      propsTitreEtapesIds: {},
    })
    const res = await restNewPostCall(
      dbPool,
      '/rest/demarches',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['PÔLE TECHNIQUE MINIER DE GUYANE'],
      },
      { titreId, typeId: DEMARCHES_TYPES_IDS.Octroi, description: '' }
    )

    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    expect(res.body.message).toBe("le titre n'existe pas")
  })
})

describe('getDemarchesEnConcurrence', () => {
  test('retourne aucune démarche en concurrence en tant que admin', async () => {
    const demarcheId = newDemarcheId()

    const res = await restNewCall(dbPool, '/rest/demarches/:demarcheId/miseEnConcurrence', { demarcheId }, { ...testBlankUser, role: 'admin', administrationId: 'aut-mrae-guyane-01' })
    expect(res.status).toBe(HTTP_STATUS.OK)
    expect(res.body).toEqual([])
  })

  test('retourne toutes les démarches en concurrence en tant que admin', async () => {
    // insérer titre pivot
    const titreIdPivot = newTitreId()
    const demarcheIdPivot = newDemarcheId('demarcheIdPivot')
    await insertTitreGraph({
      id: titreIdPivot,
      nom: 'titre pivot',
      typeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      titreStatutId: TitresStatutIds.Indetermine,
      propsTitreEtapesIds: {},
      demarches: [
        {
          id: demarcheIdPivot,
          titreId: titreIdPivot,
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          publicLecture: false,
          etapes: [
            { id: newEtapeId(), date: toCaminoDate('2024-01-01'), isBrouillon: ETAPE_IS_NOT_BROUILLON, typeId: ETAPES_TYPES.demande, statutId: ETAPES_STATUTS.FAIT, titreDemarcheId: demarcheIdPivot },
          ],
        },
      ],
    })

    // insérer titres satellite
    const titreIdSatellite1 = newTitreId()
    const demarcheIdSatellite1 = newDemarcheId('demarcheIdSatellite1')
    await insertTitreGraph({
      id: titreIdSatellite1,
      nom: 'titre satellite 1',
      typeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      titreStatutId: TitresStatutIds.Indetermine,
      propsTitreEtapesIds: {},
      demarches: [
        {
          id: demarcheIdSatellite1,
          titreId: titreIdSatellite1,
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          etapes: [
            {
              id: newEtapeId(),
              date: toCaminoDate('2024-01-02'),
              isBrouillon: ETAPE_IS_NOT_BROUILLON,
              typeId: ETAPES_TYPES.demande,
              statutId: ETAPES_STATUTS.FAIT,
              titreDemarcheId: demarcheIdSatellite1,
              demarcheIdEnConcurrence: demarcheIdPivot,
            },
          ],
        },
      ],
    })

    const titreIdSatellite2 = newTitreId()
    const demarcheIdSatellite2 = newDemarcheId('demarcheIdSatellite2')
    await insertTitreGraph({
      id: titreIdSatellite2,
      nom: 'titre satellite 2',
      typeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      titreStatutId: TitresStatutIds.Indetermine,
      propsTitreEtapesIds: {},
      demarches: [
        {
          id: demarcheIdSatellite2,
          titreId: titreIdSatellite2,
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          publicLecture: true,
          etapes: [
            {
              id: newEtapeId(),
              date: toCaminoDate('2024-01-03'),
              isBrouillon: ETAPE_IS_NOT_BROUILLON,
              typeId: ETAPES_TYPES.demande,
              statutId: ETAPES_STATUTS.FAIT,
              titreDemarcheId: demarcheIdSatellite2,
              demarcheIdEnConcurrence: demarcheIdPivot,
            },
          ],
        },
      ],
    })

    const resForAdmin = await restNewCall(
      dbPool,
      '/rest/demarches/:demarcheId/miseEnConcurrence',
      { demarcheId: demarcheIdPivot },
      { ...testBlankUser, role: 'admin', administrationId: 'aut-mrae-guyane-01' }
    )
    expect(resForAdmin.status).toBe(HTTP_STATUS.OK)
    expect(resForAdmin.body).toMatchInlineSnapshot(`
      [
        {
          "demarcheId": "demarcheIdPivot",
          "titreNom": "titre pivot",
        },
        {
          "demarcheId": "demarcheIdSatellite1",
          "titreNom": "titre satellite 1",
        },
        {
          "demarcheId": "demarcheIdSatellite2",
          "titreNom": "titre satellite 2",
        },
      ]
    `)

    const resForDefault = await restNewCall(dbPool, '/rest/demarches/:demarcheId/miseEnConcurrence', { demarcheId: demarcheIdPivot }, { ...testBlankUser, role: 'defaut' })
    expect(resForDefault.status).toBe(HTTP_STATUS.OK)
    expect(resForDefault.body).toMatchInlineSnapshot(`
      [
        {
          "demarcheId": "demarcheIdSatellite2",
          "titreNom": "titre satellite 2",
        },
      ]
    `)
  })
})

describe('getDemarcheByIdOrSlug', () => {
  test("La démarche n'existe pas", async () => {
    const actual = await restNewCall(dbPool, '/rest/demarches/:demarcheIdOrSlug', { demarcheIdOrSlug: demarcheIdValidator.parse('non-existing') }, { ...testBlankUser, role: 'defaut' })

    expect(actual.body).toMatchInlineSnapshot(`
      {
        "message": "La démarche n'existe pas",
        "status": 400,
      }
    `)
  })

  test('La démarche existe', async () => {
    const perimetreSimple: FeatureMultiPolygon = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [7.252418901, 47.828347504],
              [7.251749335, 47.827897983],
              [7.252418901, 47.827448465],
              [7.253088467, 47.827897983],
              [7.252418901, 47.828347504],
            ],
          ],
        ],
      },
    }

    const titreId = newTitreId('titreIdGetDemarche')
    const demarcheId = newDemarcheId('getDemarcheIdId')
    const demarcheSlug = demarcheSlugValidator.parse('demarche-slug')
    await insertTitreGraph({
      id: titreId,
      nom: 'titre',
      typeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      slug: titreSlugValidator.parse('slug-titre'),
      titreStatutId: TitresStatutIds.Indetermine,
      propsTitreEtapesIds: {},
      demarches: [
        {
          id: demarcheId,
          titreId: titreId,
          slug: demarcheSlug,
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          publicLecture: false,
          etapes: [
            {
              id: newEtapeId(),
              date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 2),
              isBrouillon: ETAPE_IS_NOT_BROUILLON,
              typeId: ETAPES_TYPES.demande,
              statutId: ETAPES_STATUTS.FAIT,
              ordre: 1,
              titreDemarcheId: demarcheId,
              geojson4326Perimetre: perimetreSimple,
              geojsonOriginePerimetre: perimetreSimple,
              geojsonOrigineGeoSystemeId: '4326',
            },
            {
              id: newEtapeId(),
              date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 3),
              isBrouillon: ETAPE_IS_NOT_BROUILLON,
              typeId: ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF,
              statutId: ETAPES_STATUTS.TERMINE,
              ordre: 2,
              titreDemarcheId: demarcheId,
              geojson4326Perimetre: perimetreSimple,
              geojsonOriginePerimetre: perimetreSimple,
              surface: km2Validator.parse(12),
              geojsonOrigineGeoSystemeId: '4326',
              titulaireIds: [entrepriseIdValidator.parse('enterpriseId')],
            },
          ],
        },
      ],
    })

    const actual = await restNewCall(dbPool, '/rest/demarches/:demarcheIdOrSlug', { demarcheIdOrSlug: demarcheId }, { ...testBlankUser, role: 'super' })

    expect(actual.body).toMatchInlineSnapshot(`
      {
        "demarche_description": null,
        "demarche_id": "getDemarcheIdId",
        "demarche_slug": "demarche-slug",
        "demarche_type_id": "oct",
        "first_etape_date": "2400-01-03",
        "titre_id": "titreIdGetDemarche",
        "titre_nom": "titre",
        "titre_slug": "slug-titre",
        "titre_type_id": "arm",
      }
    `)

    const actualBySlug = await restNewCall(dbPool, '/rest/demarches/:demarcheIdOrSlug', { demarcheIdOrSlug: demarcheSlug }, { ...testBlankUser, role: 'super' })
    expect(actual.body).toStrictEqual(actualBySlug.body)
  })
})
describe('getResultatEnConcurrence', () => {
  test("La démarche n'existe pas", async () => {
    const actual = await restNewCall(dbPool, '/rest/demarches/:demarcheId/resultatMiseEnConcurrence', { demarcheId: demarcheIdValidator.parse('non-existing') }, { ...testBlankUser, role: 'defaut' })

    expect(actual.status).toBe(HTTP_STATUS.BAD_REQUEST)
  })

  test('Avec un seul satellite', async () => {
    const perimetreSimple: FeatureMultiPolygon = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [7.252418901, 47.828347504],
              [7.251749335, 47.827897983],
              [7.252418901, 47.827448465],
              [7.253088467, 47.827897983],
              [7.252418901, 47.828347504],
            ],
          ],
        ],
      },
    }
    const perimetreDecale: FeatureMultiPolygon = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [7.252718901, 47.828347504],
              [7.252049335, 47.827897983],
              [7.252718901, 47.827448465],
              [7.253388467, 47.827897983],
              [7.252718901, 47.828347504],
            ],
          ],
        ],
      },
    }
    // insérer titre pivot
    const titreIdPivot = newTitreId()
    const demarcheIdPivot = newDemarcheId('demarcheIdPivotResultat')
    await insertTitreGraph({
      id: titreIdPivot,
      nom: 'titre pivot',
      typeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      slug: titreSlugValidator.parse('slug-pivot'),
      titreStatutId: TitresStatutIds.Indetermine,
      propsTitreEtapesIds: {},
      demarches: [
        {
          id: demarcheIdPivot,
          titreId: titreIdPivot,
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          publicLecture: false,
          etapes: [
            {
              id: newEtapeId(),
              date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 2),
              isBrouillon: ETAPE_IS_NOT_BROUILLON,
              typeId: ETAPES_TYPES.demande,
              statutId: ETAPES_STATUTS.FAIT,
              ordre: 1,
              titreDemarcheId: demarcheIdPivot,
              geojson4326Perimetre: perimetreSimple,
              geojsonOriginePerimetre: perimetreSimple,
              geojsonOrigineGeoSystemeId: '4326',
            },
            {
              id: newEtapeId(),
              date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 3),
              isBrouillon: ETAPE_IS_NOT_BROUILLON,
              typeId: ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF,
              statutId: ETAPES_STATUTS.TERMINE,
              ordre: 2,
              titreDemarcheId: demarcheIdPivot,
              geojson4326Perimetre: perimetreSimple,
              geojsonOriginePerimetre: perimetreSimple,
              surface: km2Validator.parse(12),
              geojsonOrigineGeoSystemeId: '4326',
              titulaireIds: [entrepriseIdValidator.parse('enterpriseId')],
            },
          ],
        },
      ],
    })

    // insérer titres satellite
    const titreIdSatellite1 = newTitreId()
    const demarcheIdSatellite1 = newDemarcheId('demarcheIdSatelliteResultat1')
    await insertTitreGraph({
      id: titreIdSatellite1,
      nom: 'titre satellite 1',
      typeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      slug: titreSlugValidator.parse('slug-satellite-1'),
      titreStatutId: TitresStatutIds.Indetermine,
      propsTitreEtapesIds: {},
      demarches: [
        {
          id: demarcheIdSatellite1,
          titreId: titreIdSatellite1,
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          etapes: [
            {
              id: newEtapeId(),
              date: dateAddDays(DATE_DEBUT_PROCEDURE_SPECIFIQUE, 3),
              isBrouillon: ETAPE_IS_NOT_BROUILLON,
              typeId: ETAPES_TYPES.demande,
              statutId: ETAPES_STATUTS.FAIT,
              ordre: 1,
              titreDemarcheId: demarcheIdSatellite1,
              demarcheIdEnConcurrence: demarcheIdPivot,
              geojson4326Perimetre: perimetreDecale,
              geojsonOriginePerimetre: perimetreDecale,
              geojsonOrigineGeoSystemeId: '4326',
              surface: km2Validator.parse(17),
              titulaireIds: [entrepriseIdValidator.parse('enterpriseId2')],
            },
          ],
        },
      ],
    })
    const actual = await restNewCall(dbPool, '/rest/demarches/:demarcheId/resultatMiseEnConcurrence', { demarcheId: demarcheIdPivot }, { ...testBlankUser, role: 'super' })

    expect(actual.body).toMatchSnapshot()
    expect(actual.status).toBe(HTTP_STATUS.OK)
  })
})
const demarcheCreate = async () => {
  const titreId = newTitreId()
  await insertTitreGraph({
    id: titreId,
    nom: 'mon titre',
    typeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
    titreStatutId: TitresStatutIds.Indetermine,
    propsTitreEtapesIds: {},
  })

  const titreDemarche = await TitresDemarches.query().insertAndFetch({ titreId, typeId: DEMARCHES_TYPES_IDS.Octroi })

  return {
    titreId,
    demarcheId: titreDemarche.id,
  }
}
