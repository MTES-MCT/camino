import { titresDatesUpdate } from './titres-dates-update.js'
import { titreDateDemandeFind } from '../rules/titre-date-demande-find.js'
import { titresGet } from '../../database/queries/titres.js'
import Titres from '../../database/models/titres.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { vi, describe, expect, test, beforeEach } from 'vitest'
vi.mock('../../database/queries/titres', () => ({
  titreUpdate: vi.fn().mockResolvedValue(true),
  titresGet: vi.fn(),
}))

vi.mock('../rules/titre-date-demande-find', () => ({
  titreDateDemandeFind: vi.fn(),
}))

const titresGetMock = vi.mocked(titresGet, true)
const titreDateDemandeFindMock = vi.mocked(titreDateDemandeFind, true)

console.info = vi.fn()

beforeEach(() => {
  vi.resetAllMocks()
})

describe("dates d'un titre", () => {
  test("met à jour les dates d'un titre", async () => {
    titresGetMock.mockResolvedValue([{ id: 'titre-id' }] as Titres[])
    titreDateDemandeFindMock.mockReturnValue(toCaminoDate('2017-01-01'))

    const titresDatesUpdated = await titresDatesUpdate()

    expect(titresDatesUpdated.length).toEqual(1)
  })

  test('ne met à jour aucun titre', async () => {
    titresGetMock.mockResolvedValue([
      {
        id: 'titre-type-id',
        dateFin: '2019-01-01',
        dateDebut: '2010-01-01',
        dateDemande: null,
        demarches: [
          {
            demarcheDateDebut: toCaminoDate('2010-01-01'), demarcheDateFin: toCaminoDate('2019-01-01') ,
          },
        ],
      },
    ] as Titres[])
    titreDateDemandeFindMock.mockReturnValue(null)

    const titresDatesUpdated = await titresDatesUpdate()

    expect(titresDatesUpdated.length).toEqual(0)
  })
})
