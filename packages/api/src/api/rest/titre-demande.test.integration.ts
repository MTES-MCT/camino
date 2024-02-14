import { newEntrepriseId } from 'camino-common/src/entreprise.js'
import { dbManager } from '../../../tests/db-manager.js'
import { restPostCall } from '../../../tests/_utils/index.js'
import { entrepriseUpsert } from '../../database/queries/entreprises.js'
import { afterAll, beforeAll, describe, test, expect, vi, beforeEach } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { TitreDemande } from 'camino-common/src/titres.js'
console.info = vi.fn()
console.error = vi.fn()

beforeEach(() => {
  vi.resetAllMocks()
})

let dbPool: Pool

beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('titreDemandeCreer', () => {
  test('peut créer un titre', async () => {
    const entrepriseId = newEntrepriseId('plop')
    await entrepriseUpsert({
      id: entrepriseId,
      nom: 'Mon Entreprise',
    })

    const body: TitreDemande = {
      entrepriseId,
      nom: 'Nom du titre',
      references: [],
      titreFromIds: [],
      typeId: 'arm',
    }

    const tested = await restPostCall(dbPool, '/rest/titres', {}, { role: 'super' }, body)

    expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
  })
})
