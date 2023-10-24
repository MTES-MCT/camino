import { IUtilisateur } from '../../../types.js'

import { dbManager } from '../../../../tests/db-manager.js'
import Utilisateurs from '../../models/utilisateurs.js'
import { utilisateursGet } from '../utilisateurs.js'
import { Administrations } from 'camino-common/src/static/administrations.js'
import options from '../_options.js'
import { beforeAll, expect, afterAll, test, describe, vi } from 'vitest'
import { testBlankUser, TestUser } from 'camino-common/src/tests-utils.js'
import { newUtilisateurId } from '../../models/_format/id-create.js'
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
  id: newUtilisateurId('utilisateurId'),
  role: 'editeur',
  nom: 'utilisateurNom',
  email: 'utilisateurEmail',
  administrationId: mockAdministration.id,
  dateCreation: '2022-05-12',
  keycloakId: 'keycloakId',
}

describe('utilisateursQueryModify', () => {
  test.each<[TestUser, boolean]>([
    [{ role: 'super' }, true],
    [{ role: 'admin', administrationId: mockAdministration.id }, true],
    [{ role: 'editeur', administrationId: mockAdministration.id }, true],
    [{ role: 'lecteur', administrationId: mockAdministration.id }, true],
    [{ role: 'entreprise', entreprises: [] }, true],
    [{ role: 'defaut' }, false],
  ])("Vérifie l'écriture de la requête sur un utilisateur", async (user, voit) => {
    const utilisateurs = await utilisateursGet({ noms: mockUser.nom }, {}, { ...user, ...testBlankUser })
    if (voit) {
      expect(utilisateurs).toHaveLength(1)
      expect(utilisateurs[0]).toMatchSnapshot()
    } else {
      expect(utilisateurs).toHaveLength(0)
    }
  })
})
