import { titresDemarchesStatutIdUpdate } from './titres-demarches-statut-ids-update.js'
import { vi, describe, expect, test } from 'vitest'
import { getDemarches } from './titres-etapes-heritage-contenu-update.queries.js'
import { newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { Pool } from 'pg'

vi.mock('./titres-etapes-heritage-contenu-update.queries', () => ({
  getDemarches: vi.fn().mockResolvedValue(true),
}))

vi.mock('../../database/queries/titres-demarches', () => ({
  titreDemarcheUpdate: vi.fn().mockResolvedValue(true),
}))

const getDemarchesMock = vi.mocked(getDemarches, true)

console.info = vi.fn()

describe("statut des démarches d'un titre", () => {
  test("met à jour le statut d'une démarche", async () => {
    getDemarchesMock.mockResolvedValue({
      [newDemarcheId('')]: {
        id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
        titreId: newTitreId('h-cx-courdemanges-1988'),
        titreTypeId: 'cxh',
        typeId: 'oct',
        statutId: 'rej',
        etapes: [
          {
            id: newEtapeId('h-cx-courdemanges-1988-oct01-dpu01'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('1988-03-11'),
            communes: [],
            contenu: {},
            heritageContenu: {},
            surface: null,
          },
          {
            id: newEtapeId('h-cx-courdemanges-1988-oct01-dex01'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('1988-03-06'),
            communes: [],
            contenu: {},
            heritageContenu: {},
            surface: null,
          },
        ],
      },
    })
    const titresDemarchesStatutUpdated = await titresDemarchesStatutIdUpdate(undefined as unknown as Pool)

    expect(titresDemarchesStatutUpdated.length).toEqual(1)
  })

  test("ne met pas à jour le statut d'une démarche", async () => {
    getDemarchesMock.mockResolvedValue({
      [newDemarcheId('')]: {
        id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
        titreId: newTitreId('h-cx-courdemanges-1988'),
        titreTypeId: 'cxh',
        typeId: 'oct',
        statutId: 'acc',
        etapes: [
          {
            id: newEtapeId('h-cx-courdemanges-1988-oct01-dpu01'),
            typeId: 'dpu',
            statutId: 'acc',
            ordre: 2,
            date: toCaminoDate('1988-03-11'),
            communes: [],
            contenu: {},
            heritageContenu: {},
            surface: null,
          },
          {
            id: newEtapeId('h-cx-courdemanges-1988-oct01-dex01'),
            typeId: 'dex',
            statutId: 'acc',
            ordre: 1,
            date: toCaminoDate('1988-03-06'),
            communes: [],
            contenu: {},
            heritageContenu: {},
            surface: null,
          },
        ],
      },
    })
    const titresDemarchesStatutUpdated = await titresDemarchesStatutIdUpdate(undefined as unknown as Pool)

    expect(titresDemarchesStatutUpdated.length).toEqual(0)
  })

  test("ne met pas à jour le statut d'une démarche sans étape", async () => {
    getDemarchesMock.mockResolvedValue({
      [newDemarcheId('')]: {
        id: newDemarcheId('h-cx-courdemanges-1988-oct01'),
        titreId: newTitreId('h-cx-courdemanges-1988'),
        titreTypeId: 'cxh',
        typeId: 'oct',
        statutId: 'ind',
        etapes: [],
      },
    })
    const titresDemarchesStatutUpdated = await titresDemarchesStatutIdUpdate(undefined as unknown as Pool)
    expect(titresDemarchesStatutUpdated.length).toEqual(0)
  })
})
