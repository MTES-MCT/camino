import { restCall } from '../../../tests/_utils/index.js'
import { dbManager } from '../../../tests/db-manager.js'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'
import { userSuper } from '../../database/user-super.js'
import { titreCreate } from '../../database/queries/titres.js'
import type { Pool } from 'pg'
import { newDemarcheId, newEtapeId } from '../../database/models/_format/id-create.js'
import { titreSlugValidator } from 'camino-common/src/titres.js'
import { demarcheGetValidator, demarcheSlugValidator } from 'camino-common/src/demarche.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes.js'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts.js'
import TitresDemarches from '../../database/models/titres-demarches.js'
import { SUBSTANCES_LEGALES_IDS } from 'camino-common/src/static/substancesLegales.js'
import TitresEtapes from '../../database/models/titres-etapes.js'

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

describe('getDemarche', () => {
  test('ne peut pas récupérer une démarche (utilisateur non super)', async () => {
    const tested = await restCall(dbPool, '/rest/demarches/:demarcheId', { demarcheId: newDemarcheId('not existing') }, undefined)

    expect(tested.statusCode).toBe(403)
  })

  test('ne peut pas récupérer une démarche inexistante', async () => {
    const tested = await restCall(dbPool, '/rest/demarches/:demarcheId', { demarcheId: newDemarcheId('not existing') }, userSuper)

    expect(tested.statusCode).toBe(404)
  })

  test('peut récupérer une démarche', async () => {
    const titreNom = 'nom-titre'
    const titreTypeId = 'arm'
    const titre = await titreCreate(
      {
        nom: titreNom,
        typeId: titreTypeId,
        titreStatutId: 'ind',
        slug: titreSlugValidator.parse('arm-slug'),
        propsTitreEtapesIds: {},
      },
      {}
    )

    const demarcheId = newDemarcheId('superDemarcheId')
    const titreDemarche = await TitresDemarches.query().insertAndFetch({
      id: demarcheId,
      slug: demarcheSlugValidator.parse('demarche-slug'),
      titreId: titre.id,
      typeId: 'oct',
      statutId: 'acc',
      demarcheDateDebut: toCaminoDate('2023-01-01'),
      demarcheDateFin: toCaminoDate('2025-01-01'),
    })

    const etapeId = newEtapeId('superEtapeId')
    await TitresEtapes.query().insertAndFetch({
      id: etapeId,
      typeId: ETAPES_TYPES.demande,
      statutId: ETAPES_STATUTS.DEPOSE,
      date: toCaminoDate('2023-01-01'),
      titreDemarcheId: titreDemarche.id,
      contenu: {
        arm: {
          franchissements: 3,
        },
      },
      dateDebut: toCaminoDate('2023-01-01'),
      duree: 5,
      substances: [SUBSTANCES_LEGALES_IDS.or, SUBSTANCES_LEGALES_IDS.argent],
    })
    const tested = await restCall(dbPool, '/rest/demarches/:demarcheId', { demarcheId: titreDemarche.id }, userSuper)

    expect(tested.statusCode).toBe(200)
    const data = demarcheGetValidator.parse(tested.body)

    expect(data).toMatchInlineSnapshot(`
      {
        "amodiataires": [],
        "communes": [],
        "contenu": {
          "Franchissements de cours d'eau": "3",
        },
        "demarche_statut_id": "acc",
        "demarche_type_id": "oct",
        "etapes": [
          {
            "date": "2023-01-01",
            "documents": [],
            "entreprises_documents": [],
            "etape_statut_id": "dep",
            "etape_type_id": "mfr",
            "fondamentale": {
              "amodiataires": null,
              "date_debut": "2023-01-01",
              "date_fin": null,
              "duree": 5,
              "geojsonMultiPolygon": null,
              "substances": [
                "auru",
                "arge",
              ],
              "surface": null,
              "titulaires": null,
            },
            "id": "superEtapeId",
            "sections_with_values": [
              {
                "elements": [
                  {
                    "description": "",
                    "id": "mecanise",
                    "nom": "Prospection mécanisée",
                    "type": "radio",
                    "value": null,
                  },
                  {
                    "description": "Nombre de franchissements de cours d'eau",
                    "id": "franchissements",
                    "nom": "Franchissements de cours d'eau",
                    "optionnel": true,
                    "type": "integer",
                    "value": 3,
                  },
                ],
                "id": "arm",
                "nom": "Caractéristiques ARM",
              },
            ],
            "slug": "superDemarcheId-mfr99",
          },
        ],
        "geojsonMultiPolygon": null,
        "id": "superDemarcheId",
        "secteurs_maritimes": [],
        "slug": "demarche-slug",
        "substances": [
          "auru",
          "arge",
        ],
        "titre": {
          "nom": "nom-titre",
          "phases": [
            {
              "demarche_date_debut": "2023-01-01",
              "demarche_date_fin": "2025-01-01",
              "demarche_type_id": "oct",
              "slug": "demarche-slug",
            },
          ],
          "slug": "arm-slug",
          "titre_type_id": "arm",
        },
        "titulaires": [],
      }
    `)
  })
})
