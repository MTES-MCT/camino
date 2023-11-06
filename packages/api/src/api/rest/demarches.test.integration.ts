import { restCall } from '../../../tests/_utils/index.js'
import { dbManager } from '../../../tests/db-manager.js'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'
import { userSuper } from '../../database/user-super.js'
import { titreCreate } from '../../database/queries/titres.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import type { Pool } from 'pg'
import { newDemarcheId } from '../../database/models/_format/id-create.js'
import { titreSlugValidator } from 'camino-common/src/titres.js'
import { DemarcheGet, demarcheGetValidator, demarcheSlugValidator } from 'camino-common/src/demarche.js'
import { toCaminoDate } from 'camino-common/src/date.js'

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

    const titreDemarche = await titreDemarcheCreate({
      titreId: titre.id,
      typeId: 'oct',
      statutId: 'acc',
      demarcheDateDebut: toCaminoDate('2023-01-01'),
      demarcheDateFin: toCaminoDate('2025-01-01'),
    })
    const tested = await restCall(dbPool, '/rest/demarches/:demarcheId', { demarcheId: titreDemarche.id }, userSuper)

    expect(tested.statusCode).toBe(200)
    const data = demarcheGetValidator.parse(tested.body)

    const expected: DemarcheGet = {
      id: titreDemarche.id,
      slug: demarcheSlugValidator.parse(titreDemarche.slug),
      titre: {
        nom: titreNom,
        phases: [
          {
            demarche_date_debut: toCaminoDate('2023-01-01'),
            demarche_date_fin: toCaminoDate('2025-01-01'),
            demarche_type_id: titreDemarche.typeId,
            slug: demarcheSlugValidator.parse(titreDemarche.slug),
          },
        ],
        slug: titreSlugValidator.parse(titre.slug),
        titre_type_id: titreTypeId,
      },
      contenu: {},
      amodiataires: [],
      communes: [],
      demarche_statut_id: 'acc',
      demarche_type_id: 'oct',
      etapes: [],
      geojsonMultiPolygon: null,
      secteurs_maritimes: [],
      substances: [],
      titulaires: [],
    }
    expect(data).toEqual(expected)
  })
})
