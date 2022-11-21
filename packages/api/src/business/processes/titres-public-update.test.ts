import { titresPublicUpdate } from './titres-public-update'
import { titresGet } from '../../database/queries/titres'

import {
  titresPublicModifie,
  titresPublicIdentique
} from './__mocks__/titres-public-update-titres'
import { vi, describe, expect, test } from 'vitest'
vi.mock('../../database/queries/titres', () => ({
  __esModule: true,
  titreUpdate: vi.fn().mockResolvedValue(true),
  titresGet: vi.fn()
}))

const titresGetMock = vi.mocked(titresGet, true)

console.info = vi.fn()

describe("public des titres d'un titre", () => {
  test("met à jour la publicité d'un titre", async () => {
    titresGetMock.mockResolvedValue(titresPublicModifie)
    const titresPublicUpdated = await titresPublicUpdate()

    expect(titresPublicUpdated.length).toEqual(1)
  })

  test("ne met pas à jour la publicité d'un titre", async () => {
    titresGetMock.mockResolvedValue(titresPublicIdentique)
    const titresPublicUpdated = await titresPublicUpdate()

    expect(titresPublicUpdated.length).toEqual(0)
  })
})
