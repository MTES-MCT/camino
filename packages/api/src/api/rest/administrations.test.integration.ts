import { restCall, userGenerate } from '../../../tests/_utils/index.js'
import { dbManager } from '../../../tests/db-manager.js'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { TestUser } from 'camino-common/src/tests-utils.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { toCaminoDate } from 'camino-common/src/date.js'

console.info = vi.fn()
console.error = vi.fn()
let dbPool: Pool
beforeAll(async () => {
  const { knex: knexInstance, pool } = await dbManager.populateDb()
  dbPool = pool

  await knexInstance('utilisateurs').insert({
    id: 'deletedUserId',
    prenom: 'test',
    nom: 'test',
    email: null,
    keycloak_id: null,
    role: 'lecteur',
    administrationId: 'dea-guyane-01',
    dateCreation: toCaminoDate('2022-05-12'),
  })
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
    await userGenerate({ role: 'defaut' })
    await userGenerate({ role: 'admin', administrationId: 'dea-guyane-01' })
    await userGenerate({ role: 'admin', administrationId: 'dea-reunion-01' })

    const tested = await restCall(dbPool, '/rest/administrations/:administrationId/utilisateurs', { administrationId: 'dea-guyane-01' }, user)

    if (lecture) {
      expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
      expect(tested.body).toEqual([
        {
          administrationId: 'dea-guyane-01',
          administration_id: 'dea-guyane-01',
          email: 'admin-user-dea-guyane-01@camino.local',
          id: 'admin-user-dea-guyane-01',
          nom: 'nom-admin',
          prenom: 'prenom-admin',
          role: 'admin',
        },
      ])
    } else {
      expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
    }
  })
})
