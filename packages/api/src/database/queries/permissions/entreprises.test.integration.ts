import { IEntreprise, IUtilisateur } from '../../../types.js'

import { dbManager } from '../../../../tests/db-manager.js'

import Entreprises from '../../models/entreprises.js'
import Utilisateurs from '../../models/utilisateurs.js'
import { entreprisesQueryModify } from './entreprises.js'
import {
  AdministrationId,
  ADMINISTRATION_IDS
} from 'camino-common/src/static/administrations.js'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'
import { Role } from 'camino-common/src/roles.js'

console.info = vi.fn()
console.error = vi.fn()
beforeAll(async () => {
  await dbManager.populateDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('entreprisesQueryModify', () => {
  test.each<[{ role: Role; administrationId?: AdministrationId }, boolean]>([
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
    [{ role: 'entreprise' }, true],
    [{ role: 'bureau d’études' }, true],
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
        id: '109f95',
        role: user.role,
        entreprises: [mockEntreprise1],
        email: 'email',
        motDePasse: 'motdepasse',
        dateCreation: '2022-05-12',
        administrationId: user.administrationId
      }

      await Utilisateurs.query().insertGraph(mockUser)

      const q = entreprisesQueryModify(Entreprises.query(), mockUser)

      expect(await q.first()).toMatchObject(
        Object.assign(mockEntreprise1, { modification })
      )
    }
  )
})
