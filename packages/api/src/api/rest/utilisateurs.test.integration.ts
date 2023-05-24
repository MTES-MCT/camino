import { restCall, restDeleteCall, restPostCall, userGenerate } from '../../../tests/_utils/index.js'
import { dbManager } from '../../../tests/db-manager.js'
import { Knex } from 'knex'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'
import { UtilisateurToEdit } from 'camino-common/src/utilisateur.js'
import type { Pool } from 'pg'
import { constants } from 'http2'

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

describe('moi', () => {
  test('peut demander les informations sur soi-même', async () => {
    const user = await userGenerate({ role: 'defaut' })
    let tested = await restCall(dbPool, '/moi', {  }, undefined)
    
    expect(tested.statusCode).toBe(constants.HTTP_STATUS_NO_CONTENT)

    tested = await restCall(dbPool, '/moi', {  }, user)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "email": "defaut-user@camino.local",
        "id": "defaut-user",
        "nom": "nom-defaut",
        "prenom": "prenom-defaut",
        "role": "defaut",
      }
    `)
  })
})

describe('utilisateurModifier', () => {
  test('ne peut pas modifier un compte (utilisateur anonyme)', async () => {
    const utilisateurToEdit: UtilisateurToEdit = {
      id: 'test',
      role: 'defaut',
      entreprises: [],
      administrationId: null,
    }
    const tested = await restPostCall(dbPool, '/rest/utilisateurs/:id/permission', { id: utilisateurToEdit.id }, undefined, utilisateurToEdit)

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
      '/rest/utilisateurs/:id/permission',
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
    const tested = await restDeleteCall(dbPool, '/rest/utilisateurs/:id', { id: 'test' }, undefined)
    expect(tested.statusCode).toBe(500)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "error": "aucun utilisateur avec cet id ou droits insuffisants pour voir cet utilisateur",
      }
    `)
  })

  test('peut supprimer son compte utilisateur', async () => {
    const user = await userGenerate({ role: 'defaut' })

    const tested = await restDeleteCall(dbPool, '/rest/utilisateurs/:id', { id: user.id }, { role: 'defaut' })
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

    const tested = await restDeleteCall(dbPool, '/rest/utilisateurs/:id', { id }, { role: 'super' })
    expect(tested.statusCode).toBe(204)
  })

  test('ne peut pas supprimer un utilisateur inexistant (utilisateur super)', async () => {
    const tested = await restDeleteCall(dbPool, '/rest/utilisateurs/:id', { id: 'not-existing' }, { role: 'super' })
    expect(tested.statusCode).toBe(500)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "error": "aucun utilisateur avec cet id ou droits insuffisants pour voir cet utilisateur",
      }
    `)
  })
})
