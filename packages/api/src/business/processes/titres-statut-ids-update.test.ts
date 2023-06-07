import { titresStatutIdsUpdate } from './titres-statut-ids-update.js'
import { titresGet } from '../../database/queries/titres.js'

import { vi, describe, expect, test, beforeEach } from 'vitest'
import { newDemarcheId, newTitreId } from '../../database/models/_format/id-create.js'
import { toCaminoDate } from 'camino-common/src/date.js'
vi.mock('../../database/queries/titres', () => ({
  __esModule: true,
  titreUpdate: vi.fn().mockResolvedValue(true),
  titresGet: vi.fn(),
}))

const titresGetMock = vi.mocked(titresGet, true)

console.info = vi.fn()

beforeEach(() => {
  vi.resetAllMocks()
})

describe("statut d'un titre", () => {
  test('met à jour un titre si son statut est obsolète', async () => {
    titresGetMock.mockResolvedValue([
      {
        id: newTitreId('m-pr-saint-pierre-1914'),
        nom: 'unused',
        typeId: 'prm',
        propsTitreEtapesIds: {},
        titreStatutId: 'val',
        demarches: [
          {
            id: newDemarcheId('m-pr-saint-pierre-1914-oct01'),
            titreId: newTitreId('m-pr-saint-pierre-1914'),
            typeId: 'oct',
            statutId: 'acc',
            ordre: 1,
            demarcheDateDebut: toCaminoDate('1014-04-01'),
            demarcheDateFin: toCaminoDate('2014-04-01'),
            etapes: [],
          },
        ],
      },
    ])
    const titresUpdatedRequests = await titresStatutIdsUpdate()

    expect(titresUpdatedRequests.length).toEqual(1)
  })

  test("ne met pas à jour le statut d'un titre", async () => {
    titresGetMock.mockResolvedValue([
      {
        id: newTitreId('m-pr-saint-pierre-2014'),
        nom: 'nom',
        typeId: 'prm',
        titreStatutId: 'val',
        propsTitreEtapesIds: {},
        demarches: [
          {
            id: newDemarcheId('m-pr-saint-pierre-2014-oct01'),
            titreId: newTitreId('m-pr-saint-pierre-2014'),
            typeId: 'oct',
            statutId: 'acc',
            ordre: 1,
            demarcheDateDebut: toCaminoDate('2014-04-01'),
            demarcheDateFin: toCaminoDate('3014-04-01'),
            etapes: [],
          },
        ],
      },
    ])
    const titresUpdatedRequests = await titresStatutIdsUpdate()

    expect(titresUpdatedRequests.length).toEqual(0)
  })
})
