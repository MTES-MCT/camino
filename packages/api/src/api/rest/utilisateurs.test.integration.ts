import { restCall, restNewCall, restPostCall, userGenerate } from '../../../tests/_utils/index'
import { dbManager } from '../../../tests/db-manager'
import { Knex } from 'knex'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'
import { UtilisateurToEdit } from 'camino-common/src/utilisateur'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http'
import { userSuper } from '../../database/user-super'
import { newUtilisateurId } from '../../database/models/_format/id-create'
import { KeycloakFakeServer, idUserKeycloakRecognised, setupKeycloak, teardownKeycloak } from '../../../tests/keycloak'
import { renewConfig } from '../../config/index'
import { utilisateurIdValidator } from 'camino-common/src/roles'

console.info = vi.fn()
console.error = vi.fn()
let knex: Knex<any, unknown[]>
let dbPool: Pool
let keycloak: KeycloakFakeServer
beforeAll(async () => {
  const { knex: knexInstance, pool } = await dbManager.populateDb()
  dbPool = pool
  knex = knexInstance
  keycloak = await setupKeycloak()
  renewConfig()
})

afterAll(async () => {
  await dbManager.truncateSchema()
  await dbManager.closeKnex()
  await teardownKeycloak(keycloak)
})

describe('moi', () => {
  test('peut demander les informations sur soi-même', async () => {
    const user = await userGenerate({ role: 'defaut' })
    let tested = await restCall(dbPool, '/moi', {}, undefined)

    expect(tested.statusCode).toBe(HTTP_STATUS.NO_CONTENT)

    tested = await restCall(dbPool, '/moi', {}, user)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "email": "defaut-user@camino.local",
        "id": "defaut-user",
        "nom": "nom-defaut",
        "prenom": "prenom-defaut",
        "role": "defaut",
      }
    `)
  })
})

describe('utilisateurModifier', () => {
  test('ne peut pas modifier un compte (utilisateur anonyme)', async () => {
    const utilisateurToEdit: UtilisateurToEdit = {
      id: newUtilisateurId('test'),
      role: 'defaut',
      entreprises: [],
      administrationId: null,
    }
    const tested = await restPostCall(dbPool, '/rest/utilisateurs/:id/permission', { id: utilisateurToEdit.id }, undefined, utilisateurToEdit)

    expect(tested.statusCode).toBe(403)
  })

  test("peut modifier le rôle d'un compte utilisateur", async () => {
    const userToEdit = await userGenerate({ role: 'defaut' })

    const utilisateurToEdit: UtilisateurToEdit = {
      id: userToEdit.id,
      role: 'admin',
      entreprises: [],
      administrationId: 'aut-97300-01',
    }
    const tested = await restPostCall(
      dbPool,
      '/rest/utilisateurs/:id/permission',
      { id: userToEdit.id },
      {
        role: 'super',
      },
      utilisateurToEdit
    )

    expect(tested.statusCode).toBe(204)
  })
})

describe('utilisateurSupprimer', () => {
  test('ne peut pas supprimer un compte (utilisateur anonyme)', async () => {
    const tested = await restCall(dbPool, '/rest/utilisateurs/:id/delete', { id: utilisateurIdValidator.parse('test') }, undefined)
    expect(tested.statusCode).toBe(500)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "error": "aucun utilisateur avec cet id ou droits insuffisants pour voir cet utilisateur",
      }
    `)
  })

  test('peut supprimer son compte utilisateur', async () => {
    const OAUTH_URL = 'http://unused'
    process.env.OAUTH_URL = OAUTH_URL
    renewConfig()
    const user = await userGenerate({ role: 'defaut' })

    const tested = await restCall(dbPool, '/rest/utilisateurs/:id/delete', { id: user.id }, { role: 'defaut' })
    expect(tested.statusCode).toBe(302)
    expect(tested.header.location).toBe(`${OAUTH_URL}/oauth2/sign_out`)
  })

  test('peut supprimer un utilisateur (utilisateur super)', async () => {
    const id = utilisateurIdValidator.parse('user-todelete')
    await knex('utilisateurs').insert({
      id,
      prenom: 'userToDelete',
      nom: 'test',
      email: 'user-to-delete@camino.local',
      role: 'defaut',
      dateCreation: '2022-05-12',
      keycloakId: idUserKeycloakRecognised,
    })

    const tested = await restCall(dbPool, '/rest/utilisateurs/:id/delete', { id }, { role: 'super' })
    expect(tested.statusCode).toBe(204)
  })

  test('ne peut pas supprimer un utilisateur inexistant (utilisateur super)', async () => {
    const tested = await restCall(dbPool, '/rest/utilisateurs/:id/delete', { id: utilisateurIdValidator.parse('not-existing') }, { role: 'super' })
    expect(tested.statusCode).toBe(500)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "error": "aucun utilisateur avec cet id ou droits insuffisants pour voir cet utilisateur",
      }
    `)
  })
})

describe('generateQgisToken', () => {
  test('génère un token Qgis', async () => {
    const tested = await restPostCall(dbPool, '/rest/utilisateur/generateQgisToken', {}, userSuper, undefined)
    expect(tested.statusCode).toBe(200)
  })
})

describe('utilisateurCreer', () => {
  test('ne peut pas créer un utilisateur sans keycloak_id', async () => {
    expect(async () =>
      knex('utilisateurs').insert({
        id: 'userWithoutKeycloakId',
        prenom: 'userWithoutKeycloak',
        nom: 'test',
        email: 'userWithoutKeycloakId@camino.local',
        role: 'defaut',
        dateCreation: '2022-05-12',
      })
    ).rejects.toThrowError(/check_keycloak_id_not_null/)
  })
})

describe('registerToNewsletter', () => {
  test("abonne l'email donné à la newsletter s'il n'est pas encore abonné", async () => {
    const tested = await restNewCall(dbPool, '/rest/utilisateurs/registerToNewsletter', {}, undefined, { email: 'jean@dupont.fr' })
    expect(tested.statusCode).toBe(200)
    expect(tested.body).toBe(true)
  })
  test("ne fonctionne pas si l'email est invalide", async () => {
    const tested = await restNewCall(dbPool, '/rest/utilisateurs/registerToNewsletter', {}, undefined)
    expect(tested.statusCode).toBe(400)
  })
})

describe('getUtilisateurs', () => {
  test('retourne la liste ordonnée des utilisateurs', async () => {
    const tested = await restNewCall(dbPool, '/rest/utilisateurs', {}, userSuper, { colonne: 'noms', ordre: 'desc' })
    expect(tested.statusCode).toBe(200)
    expect(tested.body).toBe({
      elements: [],
      total: 0
    })
  })

  test('retourne la liste filtrée des utilisateurs', async () => {
    const tested = await restNewCall(dbPool, '/rest/utilisateurs', {}, userSuper, { noms: 'dupont' })
    expect(tested.statusCode).toBe(200)
    expect(tested.body).toBe({
      elements: [],
      total: 0
    })
  })

  test('retourne la liste paginée des utilisateurs', async () => {
    const tested = await restNewCall(dbPool, '/rest/utilisateurs', {}, userSuper, { intervalle: '1', page: '2' })
    expect(tested.statusCode).toBe(200)
    expect(tested.body).toBe({
      elements: [],
      total: 0
    })
  })

  // beforeAll(async () => {
  //   await dbManager.populateDb()
  //   await Utilisateurs.query().insertGraph(mockUser, options.utilisateurs.update)
  // })

  // afterAll(async () => {
  //   await dbManager.closeKnex()
  // })

  // const mockAdministration = Administrations['aut-97300-01']

  // const mockUser: IUtilisateur = {
  //   id: newUtilisateurId('utilisateurId'),
  //   role: 'editeur',
  //   nom: 'utilisateurNom',
  //   email: 'utilisateurEmail',
  //   administrationId: mockAdministration.id,
  //   dateCreation: '2022-05-12',
  //   keycloakId: 'keycloakId',
  // }

  // describe('utilisateursQueryModify', () => {
  //   test.each<[TestUser, boolean]>([
  //     [{ role: 'super' }, true],
  //     [{ role: 'admin', administrationId: mockAdministration.id }, true],
  //     [{ role: 'editeur', administrationId: mockAdministration.id }, true],
  //     [{ role: 'lecteur', administrationId: mockAdministration.id }, true],
  //     [{ role: 'entreprise', entreprises: [] }, true],
  //     [{ role: 'defaut' }, false],
  //   ])("Vérifie l'écriture de la requête sur un utilisateur", async (user, voit) => {
  //     const utilisateurs = await utilisateursGet({ noms: mockUser.nom }, {}, { ...user, ...testBlankUser })
  //     if (voit) {
  //       expect(utilisateurs).toHaveLength(1)
  //       expect(utilisateurs[0]).toMatchSnapshot()
  //     } else {
  //       expect(utilisateurs).toHaveLength(0)
  //     }
  //   })
  // })

})
