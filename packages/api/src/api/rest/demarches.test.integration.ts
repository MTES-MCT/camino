import { restDeleteCall, restDownloadCall } from '../../../tests/_utils/index'
import { dbManager } from '../../../tests/db-manager'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http'
import { toCaminoDate } from 'camino-common/src/date'
import { titreSlugValidator } from 'camino-common/src/validators/titres'
import { newTitreId, newDemarcheId, newEtapeId } from '../../database/models/_format/id-create'
import { titreCreate } from '../../database/queries/titres'
import TitresDemarches from '../../database/models/titres-demarches'
import TitresEtapes from '../../database/models/titres-etapes'
import Titres from '../../database/models/titres'
import { userSuper } from '../../database/user-super'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { entrepriseUpsert } from '../../database/queries/entreprises'
import { FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { codePostalValidator } from 'camino-common/src/static/departement'
import crypto from 'crypto'
import { km2Validator } from 'camino-common/src/number'
import { demarcheIdValidator } from 'camino-common/src/demarche'

console.info = vi.fn()
console.error = vi.fn()
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
      typeId: 'axm',
      titreStatutId: 'val',
      propsTitreEtapesIds: {
        titulaires: titulaireId,
        amodiataires: amodiataireId,
      },
      slug: titreSlugValidator.parse('slug'),
      archive: false,
      references: [{ nom: 'Test', referenceTypeId: 'nus' }],
    })

    await TitresDemarches.query().insert({
      id: demarcheId,
      titreId,
      typeId: 'oct',
      description: 'description',
    })

    const etapeId = newEtapeId('titre-etape-id')
    await TitresEtapes.query().insert({
      id: etapeId,
      titreDemarcheId: demarcheId,
      typeId: 'mfr',
      statutId: 'fai',
      date: toCaminoDate('2022-01-01'),
      ordre: 1,
      surface: km2Validator.parse(42),
      geojson4326Perimetre: multiPolygonWith4Points,
      geojsonOriginePerimetre: multiPolygonWith4Points,
      geojsonOrigineGeoSystemeId: '4326',
      titulaireIds: [titulaireId],
      amodiataireIds: [amodiataireId],
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
      typeId: 'mfr',
      statutId: 'fai',
      date: toCaminoDate('2023-01-01'),
      ordre: 2,
      surface: km2Validator.parse(102),
      geojson4326Perimetre: multiPolygonWith4Points,
      geojsonOriginePerimetre: multiPolygonWith4Points,
      geojsonOrigineGeoSystemeId: '4326',
      titulaireIds: [titulaireId2],
      amodiataireIds: [amodiataireId2],
    })

    const tested = await restDownloadCall(dbPool, '/demarches', {}, userSuper, { format: 'csv' })

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
    const res = await restDeleteCall(dbPool, '/rest/demarches/:demarcheId', { demarcheId }, undefined)
    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN)
  })

  test('ne peut pas supprimer une démarche si l utilisateur n a pas accès à la démarche (utilisateur admin)', async () => {
    const { demarcheId } = await demarcheCreate()
    const res = await restDeleteCall(dbPool, '/rest/demarches/:demarcheId', { demarcheId }, { role: 'admin', administrationId: 'dea-mayotte-01' })
    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN)
  })

  test('ne peut pas supprimer une démarche inexistante (utilisateur super)', async () => {
    const res = await restDeleteCall(dbPool, '/rest/demarches/:demarcheId', { demarcheId: demarcheIdValidator.parse('toto') }, userSuper)
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST)
  })

  test('peut supprimer une démarche (utilisateur super)', async () => {
    const { demarcheId } = await demarcheCreate()

    let demarche = await TitresDemarches.query().findById(demarcheId)
    expect(demarche?.archive).toBe(false)

    const res = await restDeleteCall(dbPool, '/rest/demarches/:demarcheId', { demarcheId }, userSuper)
    expect(res.body.errors).toBe(undefined)

    demarche = await TitresDemarches.query().findById(demarcheId)
    expect(demarche?.archive).toBe(true)
  })
})

const demarcheCreate = async () => {
  const titre = await titreCreate(
    {
      nom: 'mon titre',
      typeId: 'arm',
      titreStatutId: 'ind',
      propsTitreEtapesIds: {},
    },
    {}
  )

  const titreDemarche = await TitresDemarches.query().insertAndFetch({ titreId: titre.id, typeId: 'oct' })

  return {
    titreId: titre.id,
    demarcheId: titreDemarche.id,
  }
}
