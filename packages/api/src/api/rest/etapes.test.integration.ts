import { dbManager } from '../../../tests/db-manager.js'
import { titreCreate } from '../../database/queries/titres.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { userSuper } from '../../database/user-super.js'
import { restCall } from '../../../tests/_utils/index.js'
import { getCurrent } from 'camino-common/src/date.js'
import { afterAll, beforeAll, test, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http.js'

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

test('getEtapesTypesEtapesStatusWithMainStep', async () => {
  const titre = await titreCreate(
    {
      nom: 'nomTitre',
      typeId: 'arm',
      titreStatutId: 'val',
      propsTitreEtapesIds: {},
    },
    {}
  )

  const titreDemarche = await titreDemarcheCreate({
    titreId: titre.id,
    typeId: 'oct',
  })

  const tested = await restCall(dbPool, '/rest/etapesTypes/:demarcheId/:date', { demarcheId: titreDemarche.id, date: getCurrent() }, userSuper)

  expect(tested.statusCode).toBe(HTTP_STATUS.HTTP_STATUS_OK)
  expect(tested.body).toMatchInlineSnapshot(`
      [
        {
          "etapeStatutId": "def",
          "etapeTypeId": "rde",
          "mainStep": false,
        },
        {
          "etapeStatutId": "fav",
          "etapeTypeId": "rde",
          "mainStep": true,
        },
        {
          "etapeStatutId": "aco",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "fai",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "aco",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "fai",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "aco",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "fai",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "aco",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "fai",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "aco",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "fai",
          "etapeTypeId": "mfr",
          "mainStep": true,
        },
        {
          "etapeStatutId": "fai",
          "etapeTypeId": "pfd",
          "mainStep": true,
        },
        {
          "etapeStatutId": "req",
          "etapeTypeId": "dae",
          "mainStep": false,
        },
        {
          "etapeStatutId": "exe",
          "etapeTypeId": "dae",
          "mainStep": true,
        },
      ]
    `)
})
