/* eslint-disable sql/no-unsafe-query */
import { dbManager } from '../../../tests/db-manager'
import { titreCreate } from '../../database/queries/titres'
import { afterAll, beforeAll, test, expect, vi, describe } from 'vitest'
import type { Pool } from 'pg'
import { getTitresModifiesByMonth } from './journal.queries'
import { Knex } from 'knex'
import { idGenerate } from '../../database/models/_format/id-create'
import { userGenerate } from '../../../tests/_utils/index'
import { ITitre } from '../../types'

console.info = vi.fn()
console.error = vi.fn()

let dbPool: Pool
let knex: Knex

let titre: ITitre
beforeAll(async () => {
  const { pool, knex: knexInstance } = await dbManager.populateDb()
  dbPool = pool
  knex = knexInstance

  titre = await titreCreate(
    {
      nom: 'nomTitre',
      typeId: 'arm',
      titreStatutId: 'val',
      propsTitreEtapesIds: {},
    },
    {}
  )
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('getTitresModifiesByMonth', async () => {
  test('ne prend pas en compte les modifications réalisées par l’utilisateur super', async () => {
    let tested = await getTitresModifiesByMonth(dbPool)

    await knex.raw(
      `INSERT INTO public.journaux (id, utilisateur_id, date, element_id, operation, titre_id) VALUES ('${idGenerate()}', 'super', '2021-11-10 09:02:19.012000 +00:00', '${idGenerate()}', 'update', '${
        titre.id
      }')`
    )
    tested = await getTitresModifiesByMonth(dbPool)
    expect(tested).toMatchInlineSnapshot('[]')
  })

  test('comptabilise chaque modifications sur chaque titres', async () => {
    let tested = await getTitresModifiesByMonth(dbPool)

    const user = await userGenerate({ role: 'defaut' })
    await knex.raw(
      `INSERT INTO public.journaux (id, utilisateur_id, date, element_id, operation, titre_id) VALUES ('${idGenerate()}', '${
        user.id
      }', '2021-11-10 09:02:19.012000 +00:00', '${idGenerate()}', 'update', '${titre.id}')`
    )
    tested = await getTitresModifiesByMonth(dbPool)
    expect(tested).toMatchInlineSnapshot(`
      [
        {
          "mois": "2021-11",
          "quantite": 1,
        },
      ]
    `)

    await knex.raw(
      `INSERT INTO public.journaux (id, utilisateur_id, date, element_id, operation, titre_id) VALUES ('${idGenerate()}', '${
        user.id
      }', '2021-11-10 09:02:19.012000 +00:00', '${idGenerate()}', 'update', '${titre.id}')`
    )
    tested = await getTitresModifiesByMonth(dbPool)
    expect(tested).toMatchInlineSnapshot(`
      [
        {
          "mois": "2021-11",
          "quantite": 2,
        },
      ]
    `)
  })
})
