import { titresDemarchesDatesUpdate } from './titres-phases-update.js'
import { titresGet } from '../../database/queries/titres.js'
import { vi, afterEach, describe, expect, test } from 'vitest'
import Titres from '../../database/models/titres.js'

vi.mock('../../database/queries/titres', () => ({
  titresGet: vi.fn(),
}))
vi.mock('../../knex', () => ({
  knex: { raw: vi.fn() },
}))

const titresGetMock = vi.mocked(titresGet, true)

console.info = vi.fn()

afterEach(() => {
  vi.resetAllMocks()
})
describe("phases d'un titre", () => {
  test('met à jour un titre dont une phase est créée', async () => {
    titresGetMock.mockResolvedValue([
      {
        id: 'h-cx-courdemanges-1988',
        demarches: [
          {
            id: 'h-cx-courdemanges-1988-oct01',
            titreId: 'h-cx-courdemanges-1988',
            typeId: 'oct',
            statutId: 'acc',
            ordre: 1,
            etapes: [
              {
                id: 'h-cx-courdemanges-1988-oct01-dpu01',
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: '2200-01-01',
                dateFin: '2500-01-01',
              },
              {
                id: 'h-cx-courdemanges-1988-oct01-dex01',
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: '2200-01-01',
                dateFin: '2500-01-01',
              },
            ],
          },
        ],
      } as Titres,
    ])

    const [titresDemarchesDatesUpdated] = await titresDemarchesDatesUpdate()

    expect(titresDemarchesDatesUpdated.length).toEqual(1)
  })

  test('met à jour un titre dont une phase est modifiée', async () => {
    titresGetMock.mockResolvedValue([
      {
        id: 'h-cx-courdemanges-1988',
        demarches: [
          {
            id: 'h-cx-courdemanges-1988-oct01',
            titreId: 'h-cx-courdemanges-1988',
            typeId: 'oct',
            statutId: 'acc',
            ordre: 1,
            demarcheDateFin: '2500-01-01',
            demarcheDateDebut: '2300-01-01',
            etapes: [
              {
                id: 'h-cx-courdemanges-1988-oct01-dpu01',
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: '2200-01-01',
                dateFin: '2500-01-01',
              },
              {
                id: 'h-cx-courdemanges-1988-oct01-dex01',
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: '2200-01-01',
                dateFin: '2500-01-01',
              },
            ],
          },
        ],
      } as Titres,
    ])
    const [titresDemarchesDatesUpdated] = await titresDemarchesDatesUpdate()

    expect(titresDemarchesDatesUpdated.length).toEqual(1)
  })

  test('met à jour un titre dont une phase est supprimée', async () => {
    titresGetMock.mockResolvedValue([
      {
        id: 'h-cx-courdemanges-1988',
        demarches: [
          {
            id: 'h-cx-courdemanges-1988-oct01',
            titreId: 'h-cx-courdemanges-1988',
            typeId: 'oct',
            statutId: 'acc',
            ordre: 1,
            phase: {
              titreDemarcheId: 'h-cx-courdemanges-1988-oct01',
              dateFin: '2500-01-01',
              dateDebut: '2200-01-01',
              statutId: 'val',
            },
            etapes: [],
          },
        ],
      } as unknown as Titres,
    ])
    const [titresDemarchesDatesUpdated] = await titresDemarchesDatesUpdate()

    expect(titresDemarchesDatesUpdated.length).toEqual(1)
  })

  test("ne met pas à jour un titre si aucune phase n'est modifiée", async () => {
    titresGetMock.mockResolvedValue([
      {
        id: 'h-cx-courdemanges-1988',
        demarches: [
          {
            id: 'h-cx-courdemanges-1988-oct01',
            titreId: 'h-cx-courdemanges-1988',
            typeId: 'oct',
            statutId: 'acc',
            ordre: 1,
            demarcheDateFin: '2500-01-01',
            demarcheDateDebut: '2200-01-01',
            etapes: [
              {
                id: 'h-cx-courdemanges-1988-oct01-dpu01',
                typeId: 'dpu',
                statutId: 'acc',
                ordre: 2,
                date: '2200-01-01',
                dateFin: '2500-01-01',
              },
              {
                id: 'h-cx-courdemanges-1988-oct01-dex01',
                typeId: 'dex',
                statutId: 'acc',
                ordre: 1,
                date: '2200-01-01',
                dateFin: '2500-01-01',
              },
            ],
          },
        ],
      } as Titres,
    ])
    const [titresDemarchesDatesUpdated] = await titresDemarchesDatesUpdate()

    expect(titresDemarchesDatesUpdated.length).toEqual(1)
  })

  test("ne met pas à jour un titre si aucune phase n'existe", async () => {
    titresGetMock.mockResolvedValue([
      {
        id: 'h-cx-courdemanges-1988',
        demarches: [
          {
            id: 'h-cx-courdemanges-1988-oct01',
            titreId: 'h-cx-courdemanges-1988',
            typeId: 'oct',
            statutId: 'acc',
            ordre: 1,
            etapes: [],
          },
        ],
      } as unknown as Titres,
    ])
    const [titresDemarchesDatesUpdated] = await titresDemarchesDatesUpdate()

    expect(titresDemarchesDatesUpdated.length).toEqual(1)
  })
})
