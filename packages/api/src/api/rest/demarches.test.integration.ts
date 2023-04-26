import { restCall } from '../../../tests/_utils/index.js'
import { dbManager } from '../../../tests/db-manager.js'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'
import { CaminoRestRoutes } from 'camino-common/src/rest.js'
import { userSuper } from '../../database/user-super.js'
import { titreCreate } from '../../database/queries/titres.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import type { Pool } from 'pg'

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
    const tested = await restCall(dbPool, CaminoRestRoutes.demarche, { demarcheId: 'not existing' }, undefined)

    expect(tested.statusCode).toBe(403)
  })

  test('ne peut pas récupérer une démarche inexistante', async () => {
    const tested = await restCall(dbPool, CaminoRestRoutes.demarche, { demarcheId: 'not existing' }, userSuper)

    expect(tested.statusCode).toBe(404)
  })

  test('peut récupérer une démarche', async () => {
    const titre = await titreCreate(
      {
        nom: '',
        typeId: 'arm',
        slug: 'arm-slug',
        propsTitreEtapesIds: {},
      },
      {}
    )

    const titreDemarche = await titreDemarcheCreate({
      titreId: titre.id,
      typeId: 'oct',
    })
    const tested = await restCall(dbPool, CaminoRestRoutes.demarche, { demarcheId: titreDemarche.id }, userSuper)

    expect(tested.statusCode).toBe(200)
    expect(tested.body).toEqual({
      titre_id: titre.id,
      type_id: 'oct',
    })
  })
})
