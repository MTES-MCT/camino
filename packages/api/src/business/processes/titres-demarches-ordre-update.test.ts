import { titresDemarchesOrdreUpdate } from './titres-demarches-ordre-update.js'
import { titresGet } from '../../database/queries/titres.js'

import { titresDemarchesDesordonnees, titresDemarchesOrdonnees } from './__mocks__/titres-demarches-ordre-update-demarches.js'
import { vi, describe, expect, test } from 'vitest'
vi.mock('../../database/queries/titres', () => ({
  titresGet: vi.fn(),
}))

vi.mock('../../database/queries/titres-demarches', () => ({
  titreDemarcheUpdate: vi.fn().mockResolvedValue(true),
}))

const titresGetMock = vi.mocked(titresGet, true)

console.info = vi.fn()

describe('ordre des démarches', () => {
  test("met à jour l'ordre de deux démarches", async () => {
    titresGetMock.mockResolvedValue(titresDemarchesDesordonnees)
    const titresDemarchesOrdreUpdated = await titresDemarchesOrdreUpdate()
    expect(titresDemarchesOrdreUpdated.length).toEqual(2)
  })

  test('ne met à jour aucune démarche', async () => {
    titresGetMock.mockResolvedValue(titresDemarchesOrdonnees)
    const titresDemarchesOrdreUpdated = await titresDemarchesOrdreUpdate()
    expect(titresDemarchesOrdreUpdated.length).toEqual(0)
  })
})
