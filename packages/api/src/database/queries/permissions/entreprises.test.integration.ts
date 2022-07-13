import { formatUser, IEntreprise, IUtilisateur } from '../../../types'

import { dbManager } from '../../../../tests/db-manager'

import Entreprises from '../../models/entreprises'
import Utilisateurs from '../../models/utilisateurs'
import { entreprisesQueryModify } from './entreprises'
import { testBlankUser, TestUser } from '../../../../tests/_utils'
import { ADMINISTRATION_IDS } from 'camino-common/src/administrations'

console.info = jest.fn()
console.error = jest.fn()
beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('entreprisesQueryModify', () => {
  test.each<[TestUser, boolean]>([
    [{ role: 'super' }, true],
    [
      {
        role: 'admin',
        administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
      },
      true
    ],
    [
      {
        role: 'editeur',
        administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
      },
      true
    ],
    [
      {
        role: 'lecteur',
        administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']
      },
      false
    ],
    [{ role: 'entreprise', entreprises: [] }, true],
    [{ role: 'bureau d’études', entreprises: [] }, true],
    [{ role: 'defaut' }, false]
  ])(
    "Vérifie l'écriture de la requête sur le droit 'modification' d'une entreprise",
    async (user, modification) => {
      await Utilisateurs.query().delete()
      await Entreprises.query().delete()

      const mockEntreprise1 = {
        id: 'monEntrepriseId',
        nom: 'monEntrepriseNom'
      } as IEntreprise

      const mockUser: IUtilisateur = {
        dateCreation: '',
        motDePasse: 'motDePasse',
        ...user,
        ...testBlankUser
      }

      await Entreprises.query().insert(mockEntreprise1)

      await Utilisateurs.query().insertGraph(mockUser)

      const q = entreprisesQueryModify(
        Entreprises.query(),
        formatUser(mockUser)
      )

      expect(await q.first()).toMatchObject(
        Object.assign(mockEntreprise1, { modification })
      )
    }
  )
})
