import { IUtilisateur } from '../../../types'

import { dbManager } from '../../../../tests/db-manager'
import Utilisateurs from '../../models/utilisateurs'
import { utilisateursGet } from '../utilisateurs'
import { Administrations } from 'camino-common/src/administrations'
import options from '../_options'
import { testBlankUser, TestUser } from '../../../../tests/_utils'

console.info = jest.fn()
console.error = jest.fn()
beforeAll(async () => {
  await dbManager.populateDb()
  await Utilisateurs.query().insertGraph(mockUser, options.utilisateurs.update)
})

afterAll(async () => {
  await dbManager.closeKnex()
})

const mockAdministration = Administrations['aut-97300-01']

const mockUser: IUtilisateur = {
  id: 'utilisateurId',
  role: 'editeur',
  nom: 'utilisateurNom',
  email: 'utilisateurEmail',
  motDePasse: 'utilisateurMotdepasse',
  administrationId: mockAdministration.id,
  dateCreation: '2022-05-12'
}

describe('utilisateursQueryModify', () => {
  test.each<[TestUser, boolean]>([
    [{ role: 'super' }, true],
    [{ role: 'admin', administrationId: mockAdministration.id }, true],
    [{ role: 'editeur', administrationId: mockAdministration.id }, true],
    [{ role: 'lecteur', administrationId: mockAdministration.id }, true],
    [{ role: 'entreprise', entreprises: [] }, true],
    [{ role: 'defaut' }, false]
  ])(
    "Vérifie l'écriture de la requête sur un utilisateur",
    async (user, voit) => {
      const utilisateurs = await utilisateursGet(
        { noms: mockUser.nom },
        {},
        { ...user, ...testBlankUser }
      )
      if (voit) {
        expect(utilisateurs).toHaveLength(1)
        expect(utilisateurs[0]).toMatchSnapshot()
      } else {
        expect(utilisateurs).toHaveLength(0)
      }
    }
  )
})
