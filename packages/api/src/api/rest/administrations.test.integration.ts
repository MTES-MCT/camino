import { restCall } from '../../../tests/_utils/index.js'
import { dbManager } from '../../../tests/db-manager.js'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { TestUser } from 'camino-common/src/tests-utils.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'

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

describe('getAdministrationUtilisateurs', () => {
  test.each<[TestUser | undefined, boolean]>([
    [{ role: 'super' }, true],
    [
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['DREAL - AUVERGNE-RHÔNE-ALPES - SIÈGE DE LYON'],
      },
      true,
    ],
    [{ role: 'entreprise', entreprises: [] }, false],
    [{ role: 'bureau d’études', entreprises: [] }, false],
    [{ role: 'defaut' }, false],
    [undefined, false],
  ])('utilisateur %s peur voir les utilisateurs: %s', async (user, lecture) => {
    const tested = await restCall(dbPool, '/rest/administrations/:administrationId/utilisateurs', { administrationId: 'dea-guyane-01' }, user)

    if (lecture) {
      expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
    } else {
      expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
    }
  })

  test('ne récupère pas les utilisateurs sans keycloak_id', () => {
    throw new Error('TODO')
  })

  test('ne récupère pas que les utilisateurs de l’administration', () => {
    throw new Error('TODO')
  })
})
