import { restDownloadCall } from '../../../tests/_utils/index.js'
import { dbManager } from '../../../tests/db-manager.js'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { titreSlugValidator } from 'camino-common/src/validators/titres.js'
import { newTitreId, newDemarcheId, newEtapeId } from '../../database/models/_format/id-create.js'
import TitresDemarches from '../../database/models/titres-demarches.js'
import TitresEtapes from '../../database/models/titres-etapes.js'
import Titres from '../../database/models/titres.js'
import { userSuper } from '../../database/user-super.js'
import { entrepriseIdValidator } from 'camino-common/src/entreprise.js'
import { entrepriseUpsert } from '../../database/queries/entreprises.js'
import { FeatureMultiPolygon } from 'camino-common/src/perimetre.js'
import { codePostalValidator } from 'camino-common/src/static/departement.js'

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

// FIXME: tester xlsx ?
// FIXME: tester le cas d'un changement de titulaire/amodiataires ?
// FIXME: factoriser multiPolygonWith4Points (récupéré d'un autre test)

describe('downloadDemarches', () => {
  test('peut récupérer des démarches', async () => {
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

    const titulaireId = entrepriseIdValidator.parse('titulaireid')
    await entrepriseUpsert({
      id: titulaireId,
      nom: 'Mon Titulaire',
      adresse: 'Une adresse',
      legalSiren: 'SIREN1',
      codePostal: codePostalValidator.parse('10000'),
      commune: 'Commune'
    })
    const amodiataireId = entrepriseIdValidator.parse('amodiataireid')
    await entrepriseUpsert({
      id: amodiataireId,
      nom: 'Mon Amodiataire',
      adresse: 'Une adresse',
      legalSiren: 'SIREN2',
      codePostal: codePostalValidator.parse('10000'),
      commune: 'Commune'
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
      references:[{nom:'Test',referenceTypeId:'nus'}]
    })

    const demarcheId = newDemarcheId('demarche-id')
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
      surface: 42,
      geojson4326Perimetre: multiPolygonWith4Points,
      geojsonOriginePerimetre: multiPolygonWith4Points,
      geojsonOrigineGeoSystemeId: '4326',
      titulaireIds: [titulaireId],
      amodiataireIds: [amodiataireId]
    })

    const tested = await restDownloadCall(dbPool, '/demarches', {}, userSuper, { format: 'csv' })

    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
    expect(tested.headers['content-type']).toBe('text/csv; charset=utf-8')
    expect(tested.text).toMatchInlineSnapshot(`"titre_id,titre_nom,titre_domaine,titre_type,titre_statut,type,statut,description,surface km2,titre_references,titulaires_noms,titulaires_adresses,titulaires_legal,amodiataires_noms,amodiataires_adresses,amodiataires_legal,demande,forets,communes
slug,mon titre,minéraux et métaux,autorisation d'exploitation,valide,octroi,indéterminé,description,42,Nom d'usage : Test,Mon Titulaire,Une adresse 10000 Commune,SIREN1,Mon Amodiataire,Une adresse 10000 Commune,SIREN2,2022-01-01,,"`)
  })
})
