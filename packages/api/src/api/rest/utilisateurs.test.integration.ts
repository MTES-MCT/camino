import { restCall, restNewCall, restPostCall, userGenerate } from '../../../tests/_utils/index'
import { dbManager } from '../../../tests/db-manager'
import { Knex } from 'knex'
import { expect, test, describe, afterAll, beforeAll, vi, beforeEach } from 'vitest'
import { UtilisateurToEdit } from 'camino-common/src/utilisateur'
import type { Pool } from 'pg'
import { HTTP_STATUS } from 'camino-common/src/http'
import { userSuper } from '../../database/user-super'
import { newUtilisateurId } from '../../database/models/_format/id-create'
import { KeycloakFakeServer, idUserKeycloakRecognised, setupKeycloak, teardownKeycloak } from '../../../tests/keycloak'
import { renewConfig } from '../../config/index'
import { utilisateurIdValidator } from 'camino-common/src/roles'
import { testBlankUser, TestUser } from 'camino-common/src/tests-utils'
import { Administrations } from 'camino-common/src/static/administrations'

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

beforeEach(async () => {
  await knex.raw('delete from logs')
  await knex.raw('delete from utilisateurs') // ce delete est nécessaire car l'utilisateur n'est pas supprimé de la bdd et pour éviter qu'un test plus bas ne tente une nouvelle réinsertion du user `defaut-user`et échoue
})

afterAll(async () => {
  await dbManager.truncateSchema()
  await dbManager.closeKnex()
  await teardownKeycloak(keycloak)
})

describe('moi', () => {
  test('peut demander les informations sur soi-même', async () => {
    const user = await userGenerate(dbPool, { role: 'defaut' })
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
        "telephone_fixe": null,
        "telephone_mobile": null,
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
    const userToEdit = await userGenerate(dbPool, { role: 'defaut' })

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
        "error": "droits insuffisants",
      }
    `)
  })

  test('peut supprimer son compte utilisateur', async () => {
    const OAUTH_URL = 'http://unused'
    process.env.OAUTH_URL = OAUTH_URL
    renewConfig()
    const user = await userGenerate(dbPool, { role: 'defaut' })

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
    const id = utilisateurIdValidator.parse('id')
    await knex('utilisateurs').insert({
      id,
      prenom: 'prenom-pas-super',
      nom: 'nom-pas-super',
      email: 'prenom-pas-super@camino.local',
      role: 'defaut',
      telephone_fixe: '0102030405',
      dateCreation: '2022-05-12',
      keycloakId: idUserKeycloakRecognised,
    })

    const tested = await restNewCall(dbPool, '/rest/utilisateurs', {}, userSuper, { colonne: 'nom', ordre: 'desc', page: '1', intervalle: '10' })
    expect(tested.statusCode).toBe(200)
    expect(tested.body).toStrictEqual({
      elements: [
        {
          email: 'super@camino.local',
          id: 'super',
          nom: 'nom-super',
          prenom: 'prenom-super',
          role: 'super',
          telephone_fixe: null,
          telephone_mobile: null,
        },
        {
          email: 'prenom-pas-super@camino.local',
          id: 'id',
          nom: 'nom-pas-super',
          prenom: 'prenom-pas-super',
          role: 'defaut',
          telephone_fixe: '0102030405',
          telephone_mobile: null,
        },
      ],
      total: 2,
    })
  })

  describe('vérifie les droits de lecture', async () => {
    const mockAdministration = Administrations['aut-97300-01']
    test.each<[TestUser, boolean]>([
      [{ role: 'super' }, true],
      [{ role: 'admin', administrationId: mockAdministration.id }, true],
      [{ role: 'editeur', administrationId: mockAdministration.id }, true],
      [{ role: 'lecteur', administrationId: mockAdministration.id }, true],
      [{ role: 'entreprise', entreprises: [] }, true],
      [{ role: 'defaut' }, false],
    ])('en tant que $role', async (user, voit) => {
      const mockUserNom = 'utilisateurNom'
      await knex('utilisateurs').insert({
        id: newUtilisateurId('utilisateurId'),
        prenom: 'prenom-pas-super',
        nom: mockUserNom,
        email: 'utilisateurEmail',
        role: 'editeur',
        administrationId: mockAdministration.id,
        dateCreation: '2022-05-12',
        keycloakId: idUserKeycloakRecognised,
        telephone_mobile: null,
        telephone_fixe: null,
      })
      const result = await restNewCall(dbPool, '/rest/utilisateurs', {}, { ...user, ...testBlankUser }, { colonne: 'nom', ordre: 'asc', page: '1', intervalle: '10', nomsUtilisateurs: mockUserNom })

      if (voit) {
        expect(result.status).toBe(200)
        expect(result.body.elements).toHaveLength(1)
        expect(result.body.elements[0]).toMatchSnapshot()
      } else {
        expect(result.status).toBe(403)
        expect(result.body).toMatchSnapshot()
      }
    })
  })
})
describe('getUtilisateur', () => {
  test('retourne un utilisateur', async () => {
    const id = newUtilisateurId('utilisateurDefaut')
    await knex('utilisateurs').insert({
      id,
      prenom: 'prenom-pas-super',
      nom: 'nom-pas-super',
      email: 'prenom-pas-super@camino.local',
      role: 'defaut',
      telephone_fixe: '0102030405',
      dateCreation: '2022-05-12',
      keycloakId: idUserKeycloakRecognised,
    })

    let tested = await restNewCall(dbPool, '/rest/utilisateurs/:id', { id }, userSuper)
    expect(tested.statusCode).toBe(HTTP_STATUS.OK)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "email": "prenom-pas-super@camino.local",
        "id": "utilisateurDefaut",
        "nom": "nom-pas-super",
        "prenom": "prenom-pas-super",
        "role": "defaut",
        "telephone_fixe": "0102030405",
        "telephone_mobile": null,
      }
    `)

    tested = await restNewCall(dbPool, '/rest/utilisateurs/:id', { id }, { ...testBlankUser, role: 'admin', administrationId: 'aut-97300-01' })
    expect(tested.statusCode).toBe(HTTP_STATUS.OK)
    tested = await restNewCall(dbPool, '/rest/utilisateurs/:id', { id }, { ...testBlankUser, role: 'defaut' })
    expect(tested.statusCode).toBe(HTTP_STATUS.FORBIDDEN)
  })
})
