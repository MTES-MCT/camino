import { newEntrepriseId } from 'camino-common/src/entreprise'
import { dbManager } from '../../../tests/db-manager'
import { restCall, restNewPostCall } from '../../../tests/_utils/index'
import { entrepriseUpsert } from '../../database/queries/entreprises'
import { afterAll, beforeAll, describe, test, expect, vi, beforeEach } from 'vitest'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http'
import { TitreDemande } from 'camino-common/src/titres'
import { titreIdValidator } from 'camino-common/src/validators/titres'
import { TestUser } from 'camino-common/src/tests-utils'

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

// FIXME tester avec un utilisateur entreprise sans entrepriseId dans l'input
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
      titreTypeId: 'arm',
    }
  })
  test('peut créer un titre en tant que super', async () => {
    const tested = await restNewPostCall(dbPool, '/rest/titres', {}, { role: 'super' }, body)

    expect(tested.statusCode).toBe(HTTP_STATUS.OK)

    expect(tested.body.titreId).not.toBeUndefined()
    expect(tested.body.etapeId).toBeUndefined()

    const getTitre = await restCall(dbPool, '/rest/titres/:titreId', { titreId: tested.body.titreId }, { role: 'super' })
    expect(getTitre.statusCode).toBe(HTTP_STATUS.OK)
    expect(getTitre.body.demarches).toHaveLength(1)
    expect(getTitre.body.demarches[0].etapes).toHaveLength(0)
  })

  test('peut créer un titre en tant que entreprise', async () => {
    const user: TestUser = { role: 'entreprise', entreprises: [{ id: entrepriseId }] }
    const tested = await restNewPostCall(dbPool, '/rest/titres', {}, user, body)

    expect(tested.statusCode).toBe(HTTP_STATUS.OK)

    expect(tested.body.titreId).not.toBeUndefined()
    expect(tested.body.etapeId).not.toBeUndefined()

    const getTitre = await restCall(dbPool, '/rest/titres/:titreId', { titreId: tested.body.titreId }, { role: 'super' })
    expect(getTitre.statusCode).toBe(HTTP_STATUS.OK)
    expect(getTitre.body.demarches).toHaveLength(1)
    expect(getTitre.body.demarches[0].etapes).toHaveLength(1)
    expect(getTitre.body.demarches[0].etapes[0].id).toBe(tested.body.etapeId)

    const isAbonne = await restCall(dbPool, '/rest/titres/:titreId/abonne', { titreId: tested.body.titreId }, user)
    expect(isAbonne.body).toBe(true)
  })

  test('ne peut créer un titre en tant que entreprise avec des références', async () => {
    const bodyWithRef: TitreDemande = {
      entrepriseId,
      nom: 'Nom du titre',
      references: [{ nom: 'test', referenceTypeId: 'brg' }],
      titreFromIds: [],
      titreTypeId: 'arm',
    }
    const tested = await restNewPostCall(dbPool, '/rest/titres', {}, { role: 'entreprise', entreprises: [{ id: entrepriseId }] }, bodyWithRef)

    expect(tested.statusCode).toBe(HTTP_STATUS.FORBIDDEN)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "detail": "L'utilisateur n'a pas les droits pour mettre des références",
        "message": "Permissions insuffisantes",
        "status": 403,
      }
    `)
  })

  test('ne peut pas créer un titre en tant que utilisateur défaut', async () => {
    const tested = await restNewPostCall(dbPool, '/rest/titres', {}, { role: 'defaut' }, body)

    expect(tested.statusCode).toBe(HTTP_STATUS.FORBIDDEN)
    expect(tested.body).toMatchInlineSnapshot(`
        {
          "message": "Accès interdit",
          "status": 403,
        }
      `)
  })

  test('ne peut pas lier un titre inexistant', async () => {
    const tested = await restNewPostCall(
      dbPool,
      '/rest/titres',
      {},
      { role: 'super' },
      { ...body, titreTypeId: 'axm', titreFromIds: [titreIdValidator.parse('unknownTitreId'), titreIdValidator.parse('anotherOne')] }
    )

    expect(tested.statusCode).toBe(HTTP_STATUS.BAD_REQUEST)
    expect(tested.body).toMatchInlineSnapshot(`
        {
          "detail": "Ce titre peut avoir un seul titre lié. Droits insuffisants ou titre inexistant",
          "message": "Problème lors du lien des titres",
          "status": 400,
        }
      `)
  })
})
