import { IAdministration, IUtilisateur } from '../../../types'

import { dbManager } from '../../../../tests/db-manager'
import Utilisateurs from '../../models/utilisateurs'
import { utilisateursGet } from '../utilisateurs'
import { Administrations } from 'camino-common/src/administrations'
import options from '../_options'

console.info = jest.fn()
console.error = jest.fn()
const knex = dbManager.getKnex()
beforeAll(async () => {
  await dbManager.populateDb(knex)
  await Utilisateurs.query().insertGraph(mockUser, options.utilisateurs.update)
})

afterAll(async () => {
  await dbManager.truncateDb(knex)
  await dbManager.closeKnex(knex)
})

const mockAdministration = Administrations['aut-97300-01']

const mockUser = {
  id: 'utilisateurId',
  permissionId: 'editeur',
  nom: 'utilisateurNom',
  email: 'utilisateurEmail',
  motDePasse: 'utilisateurMotdepasse',
  administrations: [{ id: mockAdministration.id }]
} as IUtilisateur

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
      const user = {
        id: 'userId',
        permissionId,
        administrations: [mockAdministration] as unknown as IAdministration[]
      } as IUtilisateur

      const utilisateurs = await utilisateursGet(
        { noms: mockUser.nom },
        {},
        user
      )

      expect(utilisateurs).toMatchObject(voit ? [mockUser] : [])
    }
  )
})
