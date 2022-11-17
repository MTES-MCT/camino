import { titresDatesUpdate } from './titres-dates-update'
import { titreDateFinFind } from '../rules/titre-date-fin-find'
import { titreDateDebutFind } from '../rules/titre-date-debut-find'
import { titreDateDemandeFind } from '../rules/titre-date-demande-find'
import { titresGet } from '../../database/queries/titres'
import Titres from '../../database/models/titres'
import { toCaminoDate } from 'camino-common/src/date'
import { vi, describe, expect, test } from 'vitest'
vi.mock('../../database/queries/titres', () => ({
  titreUpdate: vi.fn().mockResolvedValue(true),
  titresGet: vi.fn()
}))

vi.mock('../rules/titre-date-fin-find', () => ({
  titreDateFinFind: vi.fn()
}))

vi.mock('../rules/titre-date-debut-find', () => ({
  titreDateDebutFind: vi.fn()
}))

vi.mock('../rules/titre-date-demande-find', () => ({
  titreDateDemandeFind: vi.fn()
}))

const titresGetMock = vi.mocked(titresGet, true)
const titreDateFinFindMock = vi.mocked(titreDateFinFind, true)
const titreDateDebutFindMock = vi.mocked(titreDateDebutFind, true)
const titreDateDemandeFindMock = vi.mocked(titreDateDemandeFind, true)

console.info = vi.fn()

describe("dates d'un titre", () => {
  test("met à jour les dates d'un titre", async () => {
    titresGetMock.mockResolvedValue([{ id: 'titre-id' }] as Titres[])
    titreDateFinFindMock.mockReturnValue('2019-01-01')
    titreDateDebutFindMock.mockReturnValue('2018-01-01')
    titreDateDemandeFindMock.mockReturnValue(toCaminoDate('2017-01-01'))

    const titresDatesUpdated = await titresDatesUpdate()

    expect(titresDatesUpdated.length).toEqual(1)
  })

  test('ne met à jour aucun titre', async () => {
    titresGetMock.mockResolvedValue([
      {
        id: 'titre-type-id',
        dateFin: '2019-01-01',
        dateDebut: null,
        dateDemande: null
      }
    ] as Titres[])
    titreDateFinFindMock.mockReturnValue('2019-01-01')
    titreDateDebutFindMock.mockReturnValue(null)
    titreDateDemandeFindMock.mockReturnValue(null)

    const titresDatesUpdated = await titresDatesUpdate()

    expect(titresDatesUpdated.length).toEqual(0)
  })
})
