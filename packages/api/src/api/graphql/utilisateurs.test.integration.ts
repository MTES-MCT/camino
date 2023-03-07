import {
  graphQLCall,
  queryImport,
  userGenerate
} from '../../../tests/_utils/index.js'
import { userAdd } from '../../knex/user-add.js'
import { dbManager } from '../../../tests/db-manager.js'
import { Knex } from 'knex'
import {
  expect,
  test,
  describe,
  afterAll,
  afterEach,
  beforeAll,
  vi
} from 'vitest'

console.info = vi.fn()
console.error = vi.fn()
let knex: Knex<any, unknown[]>
beforeAll(async () => {
  knex = await dbManager.populateDb()
})

afterEach(async () => {
  await dbManager.reseedDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('utilisateurModifier', () => {
  const utilisateurModifierQuery = queryImport('utilisateur-modifier')

  test('ne peut pas modifier un compte (utilisateur anonyme)', async () => {
    const res = await graphQLCall(
      utilisateurModifierQuery,
      {
        utilisateur: {
          id: 'test',
          prenom: 'toto-updated',
          nom: 'test-updated',
          email: 'test@camino.local',
          role: 'defaut',
          entreprises: []
        }
      },
      undefined
    )

    expect(res.body.errors[0].message).toMatchInlineSnapshot(
      '"l\'utilisateur n\'existe pas"'
    )
  })

  test('peut modifier son compte utilisateur', async () => {
    const user = await userGenerate({ role: 'defaut' })
    const res = await graphQLCall(
      utilisateurModifierQuery,
      {
        utilisateur: {
          id: user.id,
          prenom: 'toto-updated',
          nom: 'test-updated',
          email: user.email,
          role: 'defaut',
          entreprises: []
        }
      },
      {
        role: 'defaut'
      }
    )

    expect(res.body.errors).toBeUndefined()
    expect(res.body).toMatchObject({
      data: { utilisateurModifier: { id: user.id } }
    })
  })
})

describe('utilisateurSupprimer', () => {
  const utilisateurSupprimerQuery = queryImport('utilisateur-supprimer')

  test('ne peut pas supprimer un compte (utilisateur anonyme)', async () => {
    const res = await graphQLCall(
      utilisateurSupprimerQuery,
      { id: 'test' },
      undefined
    )

    expect(res.body.errors[0].message).toMatch(/droits insuffisants/)
  })

  test('peut supprimer son compte utilisateur', async () => {
    const user = await userGenerate({ role: 'defaut' })
    const res = await graphQLCall(
      utilisateurSupprimerQuery,
      { id: user.id },
      {
        role: 'defaut'
      }
    )

    expect(res.body.errors).toBeUndefined()
    expect(res.body).toMatchObject({
      data: { utilisateurSupprimer: { id: user.id } }
    })
  })

  test('peut supprimer un utilisateur (utilisateur super)', async () => {
    const id = 'user-todelete'
    await userAdd(knex, {
      id,
      prenom: 'userToDelete',
      nom: 'test',
      email: 'user-to-delete@camino.local',
      role: 'defaut',
      dateCreation: '2022-05-12'
    })

    const res = await graphQLCall(
      utilisateurSupprimerQuery,
      { id },
      { role: 'super' }
    )

    expect(res.body).toMatchObject({ data: { utilisateurSupprimer: { id } } })
  })

  test('ne peut pas supprimer un utilisateur inexistant (utilisateur super)', async () => {
    const res = await graphQLCall(
      utilisateurSupprimerQuery,
      { id: 'toto' },
      { role: 'super' }
    )

    expect(res.body.errors[0].message).toMatch(/aucun utilisateur avec cet id/)
  })
})
