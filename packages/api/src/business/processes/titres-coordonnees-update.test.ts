import { titreCoordonneesFind } from '../utils/titre-coordonnees-find'
import { titresGet } from '../../database/queries/titres'
import Titres from '../../database/models/titres'
import { titresCoordonneesUpdate } from './titres-coordonnees-update'
import { vi, describe, expect, test } from 'vitest'
vi.mock('../../database/queries/titres', () => ({
  titreUpdate: vi.fn().mockResolvedValue(true),
  titresGet: vi.fn()
}))

vi.mock('../utils/titre-coordonnees-find', () => ({
  titreCoordonneesFind: vi.fn()
}))

const titresGetMock = vi.mocked(titresGet, true)
const titreCoordonneesFindMock = vi.mocked(titreCoordonneesFind, true)

console.info = vi.fn()

describe('coordoonnées des titres', () => {
  test.each([{ x: 1, y: 1 }, { x: 1 }, { y: 1 }, undefined])(
    "met à jour les coordonnees d'un titre",
    async coordonnees => {
      titresGetMock.mockResolvedValue([
        { id: 'titre-id', coordonnees }
      ] as Titres[])
      titreCoordonneesFindMock.mockReturnValue({ x: 1, y: 0.5 })

      const titresCoordonneesUpdated = await titresCoordonneesUpdate()

      expect(titresCoordonneesUpdated.length).toEqual(1)
    }
  )

  test.each([null, { x: null, y: 1 }])(
    "enlève les coordonnees d'un titre sans points",
    async coordonnees => {
      titresGetMock.mockResolvedValue([
        { id: 'titre-id', coordonnees: { x: 1, y: 1 } }
      ] as Titres[])
      titreCoordonneesFindMock.mockReturnValue(coordonnees)

      const titresCoordonneesUpdated = await titresCoordonneesUpdate()

      expect(titresCoordonneesUpdated.length).toEqual(1)
    }
  )

  test("met à jour les coordonnees d'un titre", async () => {
    titresGetMock.mockResolvedValue([
      { id: 'titre-id', coordonnees: null }
    ] as Titres[])
    titreCoordonneesFindMock.mockReturnValue({ x: null, y: 1 })

    const titresCoordonneesUpdated = await titresCoordonneesUpdate()

    expect(titresCoordonneesUpdated.length).toEqual(1)
  })

  test('ne met à jour aucun titre', async () => {
    titresGetMock.mockResolvedValue([
      {
        id: 'titre-type-id',
        coordonnees: { x: 1, y: 0.5 }
      }
    ] as Titres[])
    titreCoordonneesFindMock.mockReturnValue({ x: 1, y: 0.5 })

    const titresCoordonneesUpdated = await titresCoordonneesUpdate()

    expect(titresCoordonneesUpdated.length).toEqual(0)
  })
})
