import { restDeleteCall, restPostCall, userGenerate } from '../../../tests/_utils/index.js'
import { dbManager } from '../../../tests/db-manager.js'
import { Knex } from 'knex'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'
import { UtilisateurToEdit } from 'camino-common/src/utilisateur.js'
import { CaminoRestRoutes } from 'camino-common/src/rest.js'
import type { Pool } from 'pg'

console.info = vi.fn()
console.error = vi.fn()
let knex: Knex<any, unknown[]>
let dbPool: Pool
beforeAll(async () => {
  const { knex: knexInstance, pool } = await dbManager.populateDb()
  dbPool = pool
  knex = knexInstance
})

afterAll(async () => {
  await dbManager.reseedDb()
  await dbManager.closeKnex()
})

describe('utilisateurModifier', () => {
  test('ne peut pas modifier un compte (utilisateur anonyme)', async () => {
    const utilisateurToEdit: UtilisateurToEdit = {
      id: 'test',
      role: 'defaut',
      entreprises: [],
      administrationId: null,
    }
    const tested = await restPostCall(dbPool, CaminoRestRoutes.utilisateurPermission, { id: utilisateurToEdit.id }, undefined, utilisateurToEdit)

    expect(tested.statusCode).toBe(403)
  })

  test("peut modifier le rôle d'un compte utilisateur", async () => {
    const userToEdit = await userGenerate({ role: 'defaut' })

    const utilisateurToEdit: UtilisateurToEdit = {
      id: userToEdit.id,
      role: 'admin',
      entreprises: [],
      administrationId: 'aut-97300-01',
    }
    const tested = await restPostCall(
      dbPool,
      CaminoRestRoutes.utilisateurPermission,
      { id: userToEdit.id },
      {
        role: 'super',
      },
      utilisateurToEdit
    )

    expect(tested.statusCode).toBe(204)
  })
})

describe('utilisateurSupprimer', () => {
  test('ne peut pas supprimer un compte (utilisateur anonyme)', async () => {
    const tested = await restDeleteCall(dbPool, CaminoRestRoutes.utilisateur, { id: 'test' }, undefined)
    expect(tested.statusCode).toBe(500)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "error": "aucun utilisateur avec cet id ou droits insuffisants pour voir cet utilisateur",
      }
    `)
  })

  test('peut supprimer son compte utilisateur', async () => {
    const user = await userGenerate({ role: 'defaut' })

    const tested = await restDeleteCall(dbPool, CaminoRestRoutes.utilisateur, { id: user.id }, { role: 'defaut' })
    expect(tested.statusCode).toBe(204)
  })

  test('peut supprimer un utilisateur (utilisateur super)', async () => {
    const id = 'user-todelete'
    await knex('utilisateurs').insert({
      id,
      prenom: 'userToDelete',
      nom: 'test',
      email: 'user-to-delete@camino.local',
      role: 'defaut',
      dateCreation: '2022-05-12',
    })

    const tested = await restDeleteCall(dbPool, CaminoRestRoutes.utilisateur, { id }, { role: 'super' })
    expect(tested.statusCode).toBe(204)
  })

  test('ne peut pas supprimer un utilisateur inexistant (utilisateur super)', async () => {
    const tested = await restDeleteCall(dbPool, CaminoRestRoutes.utilisateur, { id: 'not-existing' }, { role: 'super' })
    expect(tested.statusCode).toBe(500)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "error": "aucun utilisateur avec cet id ou droits insuffisants pour voir cet utilisateur",
      }
    `)
  })
})
