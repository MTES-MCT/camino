import { IAdministration, IUtilisateur } from '../../../types'

import { dbManager } from '../../../../tests/db-manager'
import Utilisateurs from '../../models/utilisateurs'
import { utilisateursGet } from '../utilisateurs'
import { Administrations } from 'camino-common/src/administrations'
import options from '../_options'

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

const mockUser: Omit<IUtilisateur, 'permission'> = {
  id: 'utilisateurId',
  permissionId: 'editeur',
  nom: 'utilisateurNom',
  email: 'utilisateurEmail',
  motDePasse: 'utilisateurMotdepasse',
  administrations: [
    {
      id: mockAdministration.id,
      nom: mockAdministration.nom,
      typeId: mockAdministration.typeId
    }
  ],
  dateCreation: '2022-05-12'
}

describe('utilisateursQueryModify', () => {
  test.each`
    permissionId    | voit
    ${'super'}      | ${true}
    ${'admin'}      | ${true}
    ${'editeur'}    | ${true}
    ${'lecteur'}    | ${true}
    ${'entreprise'} | ${true}
    ${'defaut'}     | ${false}
  `(
    "Vérifie l'écriture de la requête sur un utilisateur",
    async ({ permissionId, voit }) => {
      const user: Omit<IUtilisateur, 'permission'> = {
        id: 'userId',
        permissionId,
        administrations: [mockAdministration] as unknown as IAdministration[],
        dateCreation: '2022-05-12'
      }

      const utilisateurs = await utilisateursGet(
        { noms: mockUser.nom },
        {},
        user
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
