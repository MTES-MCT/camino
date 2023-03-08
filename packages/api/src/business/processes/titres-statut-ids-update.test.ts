import { titresStatutIdsUpdate } from './titres-statut-ids-update.js'
import { titresGet } from '../../database/queries/titres.js'

import { titresValideStatutIdAJour, titresEchuStatutIdObselete } from './__mocks__/titres-statut-ids-update-titres.js'
import { vi, describe, expect, test } from 'vitest'
vi.mock('../../database/queries/titres', () => ({
  __esModule: true,
  titreUpdate: vi.fn().mockResolvedValue(true),
  titresGet: vi.fn(),
}))

const titresGetMock = vi.mocked(titresGet, true)

console.info = vi.fn()

describe("statut d'un titre", () => {
  test('met à jour un titre si son statut est obsolète', async () => {
    titresGetMock.mockResolvedValue(titresEchuStatutIdObselete)
    const titresUpdatedRequests = await titresStatutIdsUpdate()

    expect(titresUpdatedRequests.length).toEqual(1)
  })

  test("ne met pas à jour le statut d'un titre", async () => {
    titresGetMock.mockResolvedValue(titresValideStatutIdAJour)
    const titresUpdatedRequests = await titresStatutIdsUpdate()

    expect(titresUpdatedRequests.length).toEqual(0)
  })
})
