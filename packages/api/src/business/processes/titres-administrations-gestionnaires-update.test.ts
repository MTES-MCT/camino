import { titresAdministrationsGestionnairesUpdate } from './titres-administrations-gestionnaires-update'
import {
  titresAdministrationsGestionnairesCreate,
  titreAdministrationGestionnaireDelete,
  titresGet
} from '../../database/queries/titres'

import {
  titresAdministrationGestionnaireInexistante,
  titresAdministrationGestionnaireExistante,
  titresAdministrationGestionnaireVide
} from './__mocks__/titres-administrations-gestionnaires-update-titres'

jest.mock('../../database/queries/titres', () => ({
  __esModule: true,
  titresAdministrationsGestionnairesCreate: jest
    .fn()
    .mockImplementation(a => a),
  titreAdministrationGestionnaireDelete: jest.fn(),
  titresGet: jest.fn()
}))

jest.mock('../../database/queries/administrations', () => ({
  administrationsGet: jest.fn()
}))

const titresGetMock = jest.mocked(titresGet, true)

const titresAdministrationsGestionnairesCreateMock = jest.mocked(
  titresAdministrationsGestionnairesCreate,
  true
)
const titreAdministrationGestionnaireDeleteMock = jest.mocked(
  titreAdministrationGestionnaireDelete,
  true
)

console.info = jest.fn()

describe("administrations d'une étape", () => {
  test("ajoute les administrations gestionnaires si elles n'existent pas dans l'étape", async () => {
    titresGetMock.mockResolvedValue(titresAdministrationGestionnaireVide)

    const {
      titresAdministrationsGestionnairesCreated,
      titresAdministrationsGestionnairesDeleted
    } = await titresAdministrationsGestionnairesUpdate()

    expect(titresAdministrationsGestionnairesCreated.length).toEqual(3)
    expect(titresAdministrationsGestionnairesDeleted.length).toEqual(0)

    expect(titresAdministrationsGestionnairesCreateMock).toHaveBeenCalled()
  })

  test("n'ajoute pas d'administration gestionnaire si elle existe déjà dans l'étape", async () => {
    titresGetMock.mockResolvedValue(titresAdministrationGestionnaireExistante)

    const {
      titresAdministrationsGestionnairesCreated,
      titresAdministrationsGestionnairesDeleted
    } = await titresAdministrationsGestionnairesUpdate()

    expect(titresAdministrationsGestionnairesCreated.length).toEqual(0)
    expect(titresAdministrationsGestionnairesDeleted.length).toEqual(0)
  })

  test('ajoute et supprime une administration gestionnaire', async () => {
    titresGetMock.mockResolvedValue(titresAdministrationGestionnaireInexistante)

    const {
      titresAdministrationsGestionnairesCreated,
      titresAdministrationsGestionnairesDeleted
    } = await titresAdministrationsGestionnairesUpdate()

    expect(titresAdministrationsGestionnairesCreated.length).toEqual(1)
    expect(titresAdministrationsGestionnairesDeleted.length).toEqual(1)
    expect(titreAdministrationGestionnaireDeleteMock).toHaveBeenCalled()
  })
})
