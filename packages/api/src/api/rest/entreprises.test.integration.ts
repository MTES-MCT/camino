import { dbManager } from '../../../tests/db-manager'
import { restCall } from '../../../tests/_utils'

beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('fiscalite', () => {
  test('un utilisateur defaut n’a pas les droits', async () => {
    const tested = await restCall('/entreprises/1234/fiscalite', 'defaut')

    expect(tested.statusCode).toBe(403)
  })
})
