import { newEntrepriseId } from 'camino-common/src/entreprise.js'
import { dbManager } from '../../../tests/db-manager.js'
import { restCall, restPostCall } from '../../../tests/_utils/index.js'
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
  let body: TitreDemande
  const entrepriseId = newEntrepriseId('plop')
  beforeAll(async () => {
    await entrepriseUpsert({
      id: entrepriseId,
      nom: 'Mon Entreprise',
    })

    body = {
      entrepriseId,
      nom: 'Nom du titre',
      references: [],
      titreFromIds: [],
      typeId: 'arm',
    }
  })
  test('peut créer un titre en tant que super', async () => {
    const tested = await restPostCall(dbPool, '/rest/titres', {}, { role: 'super' }, body)

    expect(tested.statusCode).toBe(HTTP_STATUS.OK)

    expect(tested.body.titreId).not.toBeUndefined()
    expect(tested.body.etapeId).toBeUndefined()

    const getTitre = await restCall(dbPool, '/rest/titres/:titreId', { titreId: tested.body.titreId }, { role: 'super' })
    expect(getTitre.statusCode).toBe(HTTP_STATUS.OK)
    expect(getTitre.body.demarches).toHaveLength(1)
    expect(getTitre.body.demarches[0].etapes).toHaveLength(0)
  })
  test('peut créer un titre en tant que entreprise', async () => {
    const tested = await restPostCall(dbPool, '/rest/titres', {}, { role: 'entreprise', entreprises: [{ id: entrepriseId }] }, body)

    expect(tested.statusCode).toBe(HTTP_STATUS.OK)

    expect(tested.body.titreId).toBeUndefined()
    expect(tested.body.etapeId).not.toBeUndefined()
  })
})
