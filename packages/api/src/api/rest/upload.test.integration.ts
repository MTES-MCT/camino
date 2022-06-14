import { restUploadCall } from '../../../tests/_utils'
import { dbManager } from '../../../tests/db-manager'

jest.mock('tus-node-server')

console.info = jest.fn()
describe('téléversement de fichier par rest (tus)', () => {
  beforeAll(async () => {
    await dbManager.populateDb()
  })

  afterAll(async () => {
    await dbManager.closeKnex()
  })

  describe('permission de téléverser', () => {
    test.each`
      role            | code
      ${'admin'}      | ${200}
      ${'super'}      | ${200}
      ${'editeur'}    | ${200}
      ${'lecteur'}    | ${200}
      ${'entreprise'} | ${200}
      ${'defaut'}     | ${403}
    `(
      'retourne le code $code pour un utilisateur "$role"',
      async ({ role, code }) => {
        const res = await restUploadCall(role)
        expect(res.statusCode).toBe(code)
      }
    )
  })
})
