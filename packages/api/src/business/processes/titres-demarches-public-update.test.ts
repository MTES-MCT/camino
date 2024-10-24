import { titresDemarchesPublicUpdate } from './titres-demarches-public-update'
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

const titresDemarchesPublicModifie = [
  {
    typeId: 'cxh',
    demarches: [
      {
        id: 'h-cx-courdemanges-1988-oct01',
        titreId: 'h-cx-courdemanges-1988',
        typeId: 'oct',
        statutId: 'acc',
        ordre: 1,
        publicLecture: true,
        entreprisesLecture: true,
      },
    ],
  },
] as Titres[]

const titresDemarchesPublicIdentique = [
  {
    typeId: 'cxh',
    demarches: [
      {
        id: 'h-cx-courdemanges-1988-oct01',
        titreId: 'h-cx-courdemanges-1988',
        typeId: 'oct',
        statutId: 'rej',
        ordre: 1,
        etapes: [
          {
            id: 'h-cx-courdemanges-1988-oct01-dex01',
            titreDemarcheIdId: 'h-cx-courdemanges-1988-oct01',
            typeId: 'dex',
            statutId: 'rej',
            ordre: 1,
            date: '1988-03-06',
            dateFin: '2013-03-11',
          },
        ],
        publicLecture: false,
        entreprisesLecture: true,
      },
    ],
  },
] as unknown as Titres[]

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
