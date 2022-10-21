import { titresEtapesAdministrationsLocalesUpdate } from './titres-etapes-administrations-locales-update'
import { titresEtapesGet } from '../../database/queries/titres-etapes'

import {
  titresEtapesCommunes,
  titresEtapesCommunesVides,
  titresEtapesCommunesMemeCommune,
  titresEtapesAdministrationLocalesInexistante,
  titresEtapesAdministrationLocalesExistante
} from './__mocks__/titres-etapes-administrations-locales-update-etapes'

jest.mock('../../database/queries/titres-etapes', () => ({
  titresEtapesAdministrationsCreate: jest.fn().mockImplementation(a => a),
  titreEtapeAdministrationDelete: jest.fn().mockImplementation(a => a)
}))

jest.mock('../../database/queries/titres', () => ({
  titresGet: jest.fn()
}))

jest.mock('../../database/queries/administrations', () => ({
  administrationsGet: jest.fn()
}))

const titresEtapesGetMock = jest.mocked(titresEtapesGet, true)

console.info = jest.fn()

describe("administrations d'une étape", () => {
  test('ajoute 2 administrations dans une étape', async () => {
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
    titresEtapesGetMock.mockResolvedValue(
      titresEtapesAdministrationLocalesExistante
    )

    const { titresEtapesAdministrationsLocalesUpdated } =
      await titresEtapesAdministrationsLocalesUpdate()

    expect(titresEtapesAdministrationsLocalesUpdated.length).toEqual(0)
  })

  test("supprime une administration si l'étape ne la contient plus dans ses communes", async () => {
    titresEtapesGetMock.mockResolvedValue(
      titresEtapesAdministrationLocalesInexistante
    )

    const { titresEtapesAdministrationsLocalesUpdated } =
      await titresEtapesAdministrationsLocalesUpdate()

    expect(titresEtapesAdministrationsLocalesUpdated.length).toEqual(1)
  })
})
