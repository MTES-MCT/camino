import { titresEtapesAdministrationsLocalesUpdate } from './titres-etapes-administrations-locales-update.js'
import { titresEtapesGet } from '../../database/queries/titres-etapes.js'

import { ICommune, ITitreEtape } from '../../types.js'
import { newDemarcheId, newEtapeId } from '../../database/models/_format/id-create.js'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { vi, describe, expect, test } from 'vitest'
import { toCommuneId } from 'camino-common/src/static/communes.js'
vi.mock('../../database/queries/titres-etapes', () => ({
  titresEtapesGet: vi.fn(),
}))

vi.mock('../../knex', () => {
  const mockvi = {
    update: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  }

  return {
    knex: vi.fn().mockReturnValue(mockvi),
  }
})

const titresEtapesGetMock = vi.mocked(titresEtapesGet, true)

console.info = vi.fn()

describe("administrations d'une étape", () => {
  test('ajoute des administrations dans deux étapes', async () => {
    const titresEtapesCommunes: ITitreEtape[] = [
      {
        id: newEtapeId('h-cx-courdemanges-1988-oct01-dpu01'),
        titreDemarcheId: newDemarcheId(),
        statutId: 'fai',
        date: toCaminoDate('2022-01-01'),
        typeId: 'dpu',
        communes: [
          {
            id: toCommuneId('97300'),
            surface: 12,
          },
        ],
      },
      {
        id: newEtapeId('h-cx-courdemanges-1988-oct01-dpu01'),
        titreDemarcheId: newDemarcheId(),
        statutId: 'fai',
        date: toCaminoDate('2022-01-01'),
        typeId: 'aac',
        communes: [
          {
            id: toCommuneId('87000'),
            surface: 12,
          },
        ],
      },
    ]
    titresEtapesGetMock.mockResolvedValue(titresEtapesCommunes)

    const { titresEtapesAdministrationsLocalesUpdated } = await titresEtapesAdministrationsLocalesUpdate()

    expect(titresEtapesAdministrationsLocalesUpdated.length).toEqual(2)
  })

  test("n'ajoute pas deux fois une administration en doublon ", async () => {
    const titresEtapesCommunesMemeCommune: ITitreEtape[] = [
      {
        id: newEtapeId('h-cx-courdemanges-1988-oct01-dpu01'),
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
        typeId: 'dpu',
        statutId: 'acc',
        ordre: 2,
        date: toCaminoDate('1988-03-11'),
        communes: [
          { id: toCommuneId('29200'), surface: 12 },
          { id: toCommuneId('29300'), surface: 12 },
        ],
      },
    ]

    titresEtapesGetMock.mockResolvedValue(titresEtapesCommunesMemeCommune)

    const { titresEtapesAdministrationsLocalesUpdated } = await titresEtapesAdministrationsLocalesUpdate()

    expect(titresEtapesAdministrationsLocalesUpdated.length).toEqual(1)
  })

  test("ne met pas à jour les administrations d'une étape qui n'a pas de commune", async () => {
    const titresEtapesCommunesVides: ITitreEtape[] = [
      {
        id: newEtapeId('h-cx-courdemanges-1988-oct01-dpu01'),
        titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
        typeId: 'dpu',
        statutId: 'acc',
        ordre: 2,
        date: toCaminoDate('1988-03-11'),
        communes: [],
      },
    ]
    titresEtapesGetMock.mockResolvedValue(titresEtapesCommunesVides)

    const { titresEtapesAdministrationsLocalesUpdated } = await titresEtapesAdministrationsLocalesUpdate()

    expect(titresEtapesAdministrationsLocalesUpdated.length).toEqual(0)
  })

  test("n'ajoute pas d'administration si elle existe déjà dans l'étape", async () => {
    const titreEtape: ITitreEtape = {
      id: newEtapeId('h-cx-courdemanges-1988-oct01-dpu01'),
      titreDemarcheId: newDemarcheId(),
      statutId: 'fai',
      date: toCaminoDate('2022-01-01'),
      typeId: 'dpu',
      communes: [],
      administrationsLocales: [ADMINISTRATION_IDS['DREAL - BRETAGNE']],
    }
    titresEtapesGetMock.mockResolvedValue([titreEtape])

    const { titresEtapesAdministrationsLocalesUpdated } = await titresEtapesAdministrationsLocalesUpdate()

    expect(titresEtapesAdministrationsLocalesUpdated.length).toEqual(1)
    expect(titresEtapesAdministrationsLocalesUpdated[0].administrations).toHaveLength(0)
  })

  test("supprime une administration si l'étape ne la contient plus dans ses communes", async () => {
    const titreEtape: ITitreEtape = {
      statutId: 'fai',
      date: toCaminoDate('2022-01-01'),
      id: newEtapeId('h-cx-courdemanges-1988-oct01-dpu01'),
      titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
      typeId: 'dpu',
      communes: [] as ICommune[],
      administrationsLocales: ['ope-cacem-01'],
    }

    titresEtapesGetMock.mockResolvedValue([titreEtape])

    const { titresEtapesAdministrationsLocalesUpdated } = await titresEtapesAdministrationsLocalesUpdate()

    expect(titresEtapesAdministrationsLocalesUpdated.length).toEqual(1)
  })
})
