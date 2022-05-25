import { restCall } from '../../../tests/_utils'

describe('fiscalite', () => {
  test('un utilisateur defaut n’a pas les droits', async () => {
    const tested = await restCall('/entreprises/1234/fiscalite', 'defaut')

    expect(tested.statusCode).toBe(403)
  })
})
