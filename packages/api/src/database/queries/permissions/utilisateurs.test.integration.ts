import { IUtilisateur } from '../../../types.js'

import { dbManager } from '../../../../tests/db-manager.js'
import Utilisateurs from '../../models/utilisateurs.js'
import { utilisateursGet } from '../utilisateurs.js'
import { Administrations } from 'camino-common/src/static/administrations.js'
import options from '../_options.js'
import { beforeAll, expect, afterAll, test, describe, vi } from 'vitest'
import { Role } from 'camino-common/src/roles.js'
console.info = vi.fn()
console.error = vi.fn()
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
  test.each<[Role, boolean]>([
    ['super', true],
    ['admin', true],
    ['editeur', true],
    ['lecteur', true],
    ['entreprise', true],
    ['defaut', false]
  ])(
    "Vérifie l'écriture de la requête sur un utilisateur",
    async (role, voit) => {
      const user: IUtilisateur = {
        id: 'userId',
        role,
        administrationId: mockAdministration.id,
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
