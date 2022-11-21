import { newEntrepriseId } from 'camino-common/src/entreprise'
import { dbManager } from '../../../tests/db-manager'
import { restCall } from '../../../tests/_utils'
import { entrepriseUpsert } from '../../database/queries/entreprises'
import { afterAll, beforeAll, describe, test, expect } from 'vitest'

beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('fiscalite', () => {
  test('un utilisateur defaut n’a pas les droits', async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('plop'),
      nom: 'Mon Entreprise'
    })
    const tested = await restCall(
      `/entreprises/${entreprise.id}/fiscalite/2022`,
      'defaut'
    )

    expect(tested.statusCode).toBe(403)
  })
})
