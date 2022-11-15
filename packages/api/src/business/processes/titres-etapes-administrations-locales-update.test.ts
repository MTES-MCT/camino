import { titresEtapesAdministrationsLocalesUpdate } from './titres-etapes-administrations-locales-update'
import { titresEtapesGet } from '../../database/queries/titres-etapes'

import {
  titresEtapesCommunesVides,
  titresEtapesCommunesMemeCommune
} from './__mocks__/titres-etapes-administrations-locales-update-etapes'
import { ICommune, ITitreEtape } from '../../types'
import { newDemarcheId } from '../../database/models/_format/id-create'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { toCaminoDate } from 'camino-common/src/date'

jest.mock('../../database/queries/titres-etapes', () => ({
  titresEtapesGet: jest.fn()
}))

jest.mock('../../knex', () => {
  const mockJest = {
    update: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis()
  }

  return {
    knex: jest.fn().mockReturnValue(mockJest)
  }
})

const titresEtapesGetMock = jest.mocked(titresEtapesGet, true)

console.info = jest.fn()

describe("administrations d'une étape", () => {
  test('ajoute des administrations dans deux étapes', async () => {
    const titresEtapesCommunes: ITitreEtape[] = [
      {
        id: 'h-cx-courdemanges-1988-oct01-dpu01',
        titreDemarcheId: newDemarcheId(),
        statutId: 'fai',
        date: toCaminoDate('2022-01-01'),
        typeId: 'dpu',
        communes: [
          {
            id: 'paris',
            nom: 'paris',
            departementId: '973'
          }
        ]
      },
      {
        id: 'h-cx-courdemanges-1988-oct01-dpu01',
        titreDemarcheId: newDemarcheId(),
        statutId: 'fai',
        date: toCaminoDate('2022-01-01'),
        typeId: 'aac',
        communes: [
          {
            id: 'issy',
            nom: 'issy',
            departementId: '87'
          }
        ]
      }
    ]
    titresEtapesGetMock.mockResolvedValue(titresEtapesCommunes)

    const { titresEtapesAdministrationsLocalesUpdated } =
      await titresEtapesAdministrationsLocalesUpdate()

    expect(titresEtapesAdministrationsLocalesUpdated.length).toEqual(2)
  })

  test("n'ajoute pas deux fois une administration en doublon ", async () => {
    titresEtapesGetMock.mockResolvedValue(titresEtapesCommunesMemeCommune)

    const { titresEtapesAdministrationsLocalesUpdated } =
      await titresEtapesAdministrationsLocalesUpdate()

    expect(titresEtapesAdministrationsLocalesUpdated.length).toEqual(1)
  })

  test("ne met pas à jour les administrations d'une étape qui n'a pas de commune", async () => {
    titresEtapesGetMock.mockResolvedValue(titresEtapesCommunesVides)

    const { titresEtapesAdministrationsLocalesUpdated } =
      await titresEtapesAdministrationsLocalesUpdate()

    expect(titresEtapesAdministrationsLocalesUpdated.length).toEqual(0)
  })

  test("n'ajoute pas d'administration si elle existe déjà dans l'étape", async () => {
    const titreEtape: ITitreEtape = {
      id: 'h-cx-courdemanges-1988-oct01-dpu01',
      titreDemarcheId: newDemarcheId(),
      statutId: 'fai',
      date: toCaminoDate('2022-01-01'),
      typeId: 'dpu',
      communes: [],
      administrationsLocales: [ADMINISTRATION_IDS['DREAL - BRETAGNE']]
    }
    titresEtapesGetMock.mockResolvedValue([titreEtape])

    const { titresEtapesAdministrationsLocalesUpdated } =
      await titresEtapesAdministrationsLocalesUpdate()

    expect(titresEtapesAdministrationsLocalesUpdated.length).toEqual(1)
    expect(
      titresEtapesAdministrationsLocalesUpdated[0].administrations
    ).toHaveLength(0)
  })

  test("supprime une administration si l'étape ne la contient plus dans ses communes", async () => {
    const titreEtape: ITitreEtape = {
      statutId: 'fai',
      date: toCaminoDate('2022-01-01'),
      id: 'h-cx-courdemanges-1988-oct01-dpu01',
      titreDemarcheId: newDemarcheId('h-cx-courdemanges-1988-oct01'),
      typeId: 'dpu',
      communes: [] as ICommune[],
      administrationsLocales: ['ope-cacem-01']
    }

    titresEtapesGetMock.mockResolvedValue([titreEtape])

    const { titresEtapesAdministrationsLocalesUpdated } =
      await titresEtapesAdministrationsLocalesUpdate()

    expect(titresEtapesAdministrationsLocalesUpdated.length).toEqual(1)
  })
})
