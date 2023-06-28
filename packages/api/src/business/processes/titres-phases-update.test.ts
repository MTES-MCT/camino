import { titresDemarchesDatesUpdate } from './titres-phases-update.js'
import { titresGet } from '../../database/queries/titres.js'
import { vi, afterEach, describe, expect, test } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'
import { ITitre } from '../../types.js'
import { newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create.js'
import { Pool } from 'pg'
import { updateDatesDemarche } from './titres-phases-update.queries.js'

vi.mock('../../database/queries/titres', () => ({
  titresGet: vi.fn(),
}))
vi.mock('pg', () => {
  const Pool = vi.fn()
  Pool.prototype.query = vi.fn()

  return { Pool }
})
vi.mock('./titres-phases-update.queries.js', () => ({
  updateDatesDemarche: vi.fn(),
}))

const titresGetMock = vi.mocked(titresGet, true)
const updateDatesDemarcheMock = vi.mocked(updateDatesDemarche, true)

const mockedPool = new Pool()
console.info = vi.fn()

afterEach(() => {
  vi.resetAllMocks()
})
describe("phases d'un titre", () => {
  test('met à jour un titre dont une phase est créée', async () => {
    titresGetMock.mockResolvedValue([
      {
        id: newTitreId('h-cx-courdemanges-1988'),
        nom: 'nom',
        typeId: 'cxh',
        propsTitreEtapesIds: {},
        demarches: [
          {
            id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
            titreId: newTitreId('h-cx-courdemanges-1988'),
            typeId: 'oct',
            statutId: 'acc',
            ordre: 1,
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1988-oct01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: toCaminoDate('2200-01-01'),
                dateFin: toCaminoDate('2500-01-01'),
              },
              {
                id: newEtapeId('h-cx-courdemanges-1988-oct01-dex01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('2200-01-01'),
                dateFin: toCaminoDate('2500-01-01'),
              },
            ],
          },
        ],
      } satisfies ITitre,
    ])

    const [titresDemarchesDatesUpdated] = await titresDemarchesDatesUpdate(mockedPool)

    expect(updateDatesDemarcheMock).toBeCalledWith(expect.anything(), { demarcheId: 'h-cx-courdemanges-1988-oct01', newDateDebut: toCaminoDate('2200-01-01'), newDateFin: toCaminoDate('2500-01-01') })
    expect(titresDemarchesDatesUpdated.length).toEqual(1)
  })

  test('met à jour un titre dont une phase est modifiée', async () => {
    titresGetMock.mockResolvedValue([
      {
        id: newTitreId('h-cx-courdemanges-1988'),
        nom: 'nom',
        typeId: 'cxh',
        propsTitreEtapesIds: {},
        demarches: [
          {
            id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
            titreId: newTitreId('h-cx-courdemanges-1988'),
            typeId: 'oct',
            statutId: 'acc',
            ordre: 1,
            demarcheDateFin: toCaminoDate('2500-01-01'),
            demarcheDateDebut: toCaminoDate('2300-01-01'),
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1988-oct01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: toCaminoDate('2200-01-01'),
                dateFin: toCaminoDate('2500-01-01'),
              },
              {
                id: newEtapeId('h-cx-courdemanges-1988-oct01-dex01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('2200-01-01'),
                dateFin: toCaminoDate('2500-01-01'),
              },
            ],
          },
        ],
      } satisfies ITitre,
    ])
    const [titresDemarchesDatesUpdated] = await titresDemarchesDatesUpdate(mockedPool)

    expect(updateDatesDemarcheMock).toBeCalledWith(expect.anything(), { demarcheId: 'h-cx-courdemanges-1988-oct01', newDateDebut: toCaminoDate('2200-01-01'), newDateFin: toCaminoDate('2500-01-01') })
    expect(titresDemarchesDatesUpdated.length).toEqual(1)
  })

  test('met à jour un titre dont une phase est supprimée', async () => {
    titresGetMock.mockResolvedValue([
      {
        id: newTitreId('h-cx-courdemanges-1988'),
        nom: 'test',
        typeId: 'cxh',
        propsTitreEtapesIds: {},
        demarches: [
          {
            id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
            titreId: newTitreId('h-cx-courdemanges-1988'),
            typeId: 'oct',
            statutId: 'acc',
            demarcheDateDebut: toCaminoDate('2200-01-01'),
            demarcheDateFin: toCaminoDate('2500-01-01'),
            ordre: 1,
            etapes: [],
          },
        ],
      } satisfies ITitre,
    ])
    const [titresDemarchesDatesUpdated] = await titresDemarchesDatesUpdate(mockedPool)

    expect(updateDatesDemarcheMock).toBeCalledWith(expect.anything(), { demarcheId: 'h-cx-courdemanges-1988-oct01', newDateDebut: null, newDateFin: null })

    expect(titresDemarchesDatesUpdated.length).toEqual(1)
  })

  test("ne met pas à jour un titre si aucune phase n'est modifiée", async () => {
    titresGetMock.mockResolvedValue([
      {
        id: newTitreId('h-cx-courdemanges-1988'),
        nom: 'nom',
        propsTitreEtapesIds: {},
        typeId: 'cxh',
        demarches: [
          {
            id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
            titreId: newTitreId('h-cx-courdemanges-1988'),
            typeId: 'oct',
            statutId: 'acc',
            ordre: 1,
            demarcheDateFin: toCaminoDate('2500-01-01'),
            demarcheDateDebut: toCaminoDate('2200-01-01'),
            etapes: [
              {
                id: newEtapeId('h-cx-courdemanges-1988-oct01-dpu01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: toCaminoDate('2200-01-01'),
                dateFin: toCaminoDate('2500-01-01'),
              },
              {
                id: newEtapeId('h-cx-courdemanges-1988-oct01-dex01'),
                titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: toCaminoDate('2200-01-01'),
                dateFin: toCaminoDate('2500-01-01'),
              },
            ],
          },
        ],
      } satisfies ITitre,
    ])
    const [titresDemarchesDatesUpdated] = await titresDemarchesDatesUpdate(mockedPool)

    expect(updateDatesDemarcheMock).not.toBeCalled()
    expect(titresDemarchesDatesUpdated.length).toEqual(0)
  })

  test("ne met pas à jour un titre si aucune phase n'existe", async () => {
    titresGetMock.mockResolvedValue([
      {
        id: newTitreId('h-cx-courdemanges-1988'),
        nom: 'nom',
        typeId: 'cxh',
        propsTitreEtapesIds: {},
        demarches: [
          {
            id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
            titreId: newTitreId('h-cx-courdemanges-1988'),
            typeId: 'oct',
            statutId: 'acc',
            ordre: 1,
            etapes: [],
          },
        ],
      } satisfies ITitre,
    ])
    const [titresDemarchesDatesUpdated] = await titresDemarchesDatesUpdate(mockedPool)
    expect(updateDatesDemarcheMock).not.toBeCalled()
    expect(titresDemarchesDatesUpdated.length).toEqual(0)
  })
})
