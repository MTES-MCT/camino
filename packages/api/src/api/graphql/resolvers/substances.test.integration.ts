import { graphQLCall } from '../../../../tests/_utils'
import { dbManager } from '../../../../tests/db-manager'
import { expect, test, describe, afterAll, beforeAll } from 'vitest'
beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})
describe('substances', () => {
  test('peut voir toutes les substances', async () => {
    const res = await graphQLCall(
      `query Substances {
  substances {
   id
    nom
    description    
  }
}`,
      {},
      'defaut'
    )

    expect(res.body.data).toMatchSnapshot()
  })
})
