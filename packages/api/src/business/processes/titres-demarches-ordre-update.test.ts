import { titresDemarchesOrdreUpdate } from './titres-demarches-ordre-update'
import { titresGet } from '../../database/queries/titres'

import { vi, describe, expect, test } from 'vitest'
import Titres from '../../database/models/titres'
vi.mock('../../database/queries/titres', () => ({
  titresGet: vi.fn(),
}))

vi.mock('../../database/queries/titres-demarches', () => ({
  titreDemarcheUpdate: vi.fn().mockResolvedValue(true),
}))

const titresGetMock = vi.mocked(titresGet, true)

console.info = vi.fn()

const titresDemarchesDesordonnees = [
  {
    demarches: [
      {
        id: 'm-pr-saint-pierre-2014-oct01',
        titreId: 'm-pr-saint-pierre-2014',
        typeId: 'oct',
        statutId: 'acc',
        ordre: 2,
        etapes: [
          {
            id: 'm-pr-saint-pierre-2014-oct01-dpu01',
            titreDemarcheId: 'm-pr-saint-pierre-2014-oct01',
            typeId: 'dpu',
            statutId: 'acc',
          },
        ],
      },
      {
        id: 'm-pr-saint-pierre-2014-pro01',
        titreId: 'm-pr-saint-pierre-2014',
        typeId: 'oct',
        statutId: 'acc',
        ordre: 3,
        etapes: [
          {
            id: 'm-pr-saint-pierre-2014-pro01-dpu01',
            titreDemarcheId: 'm-pr-saint-pierre-2014-pro01',
            typeId: 'dpu',
            statutId: 'acc',
          },
        ],
      },
    ],
  },
] as Titres[]

const titresDemarchesOrdonnees = [
  {
    demarches: [
      {
        id: 'm-pr-saint-pierre-2014-oct01',
        titreId: 'm-pr-saint-pierre-2014',
        typeId: 'oct',
        statutId: 'acc',
        ordre: 1,
        etapes: [
          {
            id: 'm-pr-saint-pierre-2014-oct01-dpu01',
            titreDemarcheId: 'm-pr-saint-pierre-2014-oct01',
            typeId: 'dpu',
            statutId: 'acc',
          },
        ],
      },
      {
        id: 'm-pr-saint-pierre-2014-pro01',
        titreId: 'm-pr-saint-pierre-2014',
        typeId: 'oct',
        statutId: 'acc',
        ordre: 2,
        etapes: [
          {
            id: 'm-pr-saint-pierre-2014-pro01-dpu01',
            titreDemarcheId: 'm-pr-saint-pierre-2014-pro01',
            typeId: 'dpu',
            statutId: 'acc',
          },
        ],
      },
    ],
  },
] as Titres[]

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
