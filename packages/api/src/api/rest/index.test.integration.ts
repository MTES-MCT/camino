import { dbManager } from '../../../tests/db-manager'
import { afterAll, beforeAll, test, expect, vi, describe } from 'vitest'
import type { Pool } from 'pg'
import { newTitreId } from '../../database/models/_format/id-create'
import { insertTitreGraph } from '../../../tests/integration-test-helper'
import { titreSlugValidator } from 'camino-common/src/validators/titres'
import { restDownloadCall } from '../../../tests/_utils'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { HTTP_STATUS } from 'camino-common/src/http'

console.info = vi.fn()
console.error = vi.fn()

let dbPool: Pool

beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool

  const titreId = newTitreId('titre-id-1-for-import')
  const titreSlug = titreSlugValidator.parse('titre-slug-1-for-import')
  await insertTitreGraph({
    id: titreId,
    slug: titreSlug,
    nom: 'nomTitre',
    typeId: 'arm',
    titreStatutId: 'val',
    propsTitreEtapesIds: {},
  })
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('titres', async () => {
  test('peut télécharger les titres en csv', async () => {
    const tested = await restDownloadCall(
      dbPool,
      '/titres',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
      },
      { format: 'csv' }
    )

    expect(tested.text).toMatchInlineSnapshot(`
      "id,nom,type,domaine,date_debut,date_fin,date_demande,statut,substances,surface renseignee km2,communes (surface calculee km2),forets,facades_maritimes,departements,regions,administrations_noms,titulaires_noms,titulaires_adresses,titulaires_legal,titulaires_categorie,amodiataires_noms,amodiataires_adresses,amodiataires_legal,amodiataires_categorie,geojson
      titre-slug-1-for-import,nomTitre,autorisation de recherches,minéraux et métaux,,,,valide,,,,,,,,Direction Générale des Territoires et de la Mer de Guyane,,,,,,,,,null"
    `)
  })
  test('peut télécharger les titres en xlsx', async () => {
    const tested = await restDownloadCall(
      dbPool,
      '/titres',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
      },
      { format: 'xlsx' }
    )

    expect(tested.statusCode).toStrictEqual(HTTP_STATUS.OK)
  })

  test('peut télécharger les titres en ods', async () => {
    const tested = await restDownloadCall(
      dbPool,
      '/titres',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
      },
      { format: 'ods' }
    )

    expect(tested.statusCode).toStrictEqual(HTTP_STATUS.OK)
  })

  test('peut télécharger les titres en geojson', async () => {
    const tested = await restDownloadCall(
      dbPool,
      '/titres',
      {},
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'],
      },
      { format: 'geojson' }
    )

    expect(tested.body).toMatchInlineSnapshot(`
        {
          "features": [],
          "type": "FeatureCollection",
        }
      `)
  })
})
