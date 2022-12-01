import { titresDemarchesPublicUpdate } from './titres-demarches-public-update.js'
import { titresGet } from '../../database/queries/titres.js'

import {
  titresDemarchesPublicModifie,
  titresDemarchesPublicIdentique
} from './__mocks__/titres-demarches-public-update-demarches.js'
import { vi, describe, expect, test } from 'vitest'
vi.mock('../../database/queries/titres', () => ({
  titresGet: vi.fn()
}))

vi.mock('../../database/queries/titres-demarches', () => ({
  titreDemarcheUpdate: vi.fn().mockResolvedValue(true)
}))

const titresGetMock = vi.mocked(titresGet, true)

console.info = vi.fn()

describe("public des démarches d'un titre", () => {
  test("met à jour la publicité d'une démarche", async () => {
    titresGetMock.mockResolvedValue(titresDemarchesPublicModifie)
    const titresDemarchesPublicUpdated = await titresDemarchesPublicUpdate()

    expect(titresDemarchesPublicUpdated.length).toEqual(1)
  })

  test("ne met pas à jour la publicité d'une démarche", async () => {
    titresGetMock.mockResolvedValue(titresDemarchesPublicIdentique)
    const titresDemarchesPublicUpdated = await titresDemarchesPublicUpdate()

    expect(titresDemarchesPublicUpdated.length).toEqual(0)
  })
})
