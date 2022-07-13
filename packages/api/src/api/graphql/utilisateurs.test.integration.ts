import { app } from '../../../tests/app'
import {
  graphQLCall,
  queryImport,
  tokenCreate,
  userGenerate
} from '../../../tests/_utils/index'
import { userAdd } from '../../knex/user-add'
import request from 'supertest'
import { dbManager } from '../../../tests/db-manager'
import { Administrations } from 'camino-common/src/administrations'
import { Knex } from 'knex'
import { userSuper } from '../../database/user-super'

console.info = jest.fn()
console.error = jest.fn()
let knex: Knex
beforeAll(async () => {
  knex = await dbManager.populateDb()
})

afterEach(async () => {
  await dbManager.reseedDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('utilisateurModifier', () => {
  const utilisateurModifierQuery = queryImport('utilisateur-modifier')

  test('ne peut pas modifier un compte (utilisateur anonyme)', async () => {
    const res = await graphQLCall(
      utilisateurModifierQuery,
      {
        utilisateur: {
          id: 'test',
          prenom: 'toto-updated',
          nom: 'test-updated',
          email: 'test@camino.local'
        }
      },
      undefined
    )

    expect(res.body.errors[0].message).toMatch(/droits insuffisants/)
  })

  test('peut modifier son compte utilisateur', async () => {
    const user = await userGenerate({ role: 'defaut' })
    const res = await graphQLCall(
      utilisateurModifierQuery,
      {
        utilisateur: {
          id: user.id,
          prenom: 'toto-updated',
          nom: 'test-updated',
          email: user.email
        }
      },
      {
        role: 'defaut'
      }
    )

    expect(res.body.errors).toBeUndefined()
    expect(res.body).toMatchObject({
      data: { utilisateurModifier: { id: user.id } }
    })
  })

  test('ne peut pas modifier un compte utilisateur avec un email existant', async () => {
    await userAdd(knex, {
      id: 'test1',
      prenom: 'toto1',
      nom: 'test1',
      email: 'test1@camino.local',
      motDePasse: 'mot-de-passe',
      role: 'defaut',
      dateCreation: '2022-05-12'
    })

    await userAdd(knex, {
      id: 'test2',
      prenom: 'toto2',
      nom: 'test2',
      email: 'test2@camino.local',
      motDePasse: 'mot-de-passe',
      role: 'defaut',
      dateCreation: '2022-05-12'
    })

    const res = await graphQLCall(
      utilisateurModifierQuery,
      {
        utilisateur: {
          id: 'test2',
          nom: 'test2',
          prenom: 'toto2',
          email: 'test1@camino.local'
        }
      },
      userSuper
    )

    expect(res.body.errors[0].message).toEqual(
      'un utilisateur avec cet email existe déjà'
    )
  })
})

describe('utilisateursCreer', () => {
  const utilisateurCreerQuery = queryImport('utilisateur-creer')

  test("ne peut pas créer de compte sans token ou si le token ne contient pas d'email", async () => {
    const res = await graphQLCall(
      utilisateurCreerQuery,
      {
        utilisateur: {
          prenom: 'toto',
          nom: 'test',
          email: 'test@camino.local',
          motDePasse: 'mot-de-passe'
        }
      },
      undefined
    )

    expect(res.body.errors[0].message).toMatch(/droits insuffisants/)
  })

  test('crée un compte utilisateur si le token contient son email', async () => {
    const token = tokenCreate({ email: 'test2@camino.local' })

    const req = request(app)
      .post('/')
      .send({
        query: utilisateurCreerQuery,
        variables: {
          utilisateur: {
            prenom: 'toto',
            nom: 'test',
            email: 'test2@camino.local',
            motDePasse: 'mot-de-passe'
          }
        }
      })

    req.set('x-forwarded-access-token', token)
    const res = await req

    expect(res.body.errors).toBeUndefined()
    expect(res.body).toMatchObject({
      data: { utilisateurCreer: { prenom: 'toto' } }
    })
  })

  test("en tant que 'defaut', ne peut pas créer de compte 'super'", async () => {
    const res = await graphQLCall(
      utilisateurCreerQuery,
      {
        utilisateur: {
          prenom: 'toto',
          nom: 'test',
          email: 'test@camino.local',
          motDePasse: 'mot-de-passe',
          role: 'super'
        }
      },
      { role: 'defaut' }
    )

    expect(res.body.errors[0].message).toMatch(/droits insuffisants/)
  })

  test("en tant que 'defaut', ne peut pas créer de compte avec un email différent", async () => {
    const token = tokenCreate({ id: 'defaut', email: 'test@camino.local' })

    const res = await request(app)
      .post('/')
      .send({
        query: utilisateurCreerQuery,
        variables: {
          utilisateur: {
            prenom: 'toto',
            nom: 'test',
            email: 'autre@camino.local',
            motDePasse: 'mot-de-passe'
          }
        }
      })
      .set('Authorization', `Bearer ${token}`)

    expect(res.body.errors[0].message).toMatch(/droits insuffisants/)
  })

  test("en tant que 'super', peut créer un compte utilisateur 'super'", async () => {
    const res = await graphQLCall(
      utilisateurCreerQuery,
      {
        utilisateur: {
          prenom: 'toto',
          nom: 'test',
          email: 'test@camino.local',
          motDePasse: 'mot-de-passe',
          role: 'super'
        }
      },
      { role: 'super' }
    )

    expect(res.body.errors).toBeUndefined()
    expect(res.body).toMatchObject({
      data: { utilisateurCreer: { prenom: 'toto' } }
    })
  })

  test("en tant que 'defaut', ne peut pas être associé à une administration", async () => {
    const res = await graphQLCall(
      utilisateurCreerQuery,
      {
        utilisateur: {
          prenom: 'toto',
          nom: 'test',
          email: 'test@camino.local',
          motDePasse: 'mot-de-passe',
          administrationId: Administrations['aut-97300-01'].id
        }
      },
      { role: 'defaut' }
    )

    expect(res.body.errors[0].message).toMatch(/droits insuffisants/)
  })

  test("en tant qu'admin', peut être associé à une administrations", async () => {
    const administration = Administrations['aut-97300-01']
    const res = await graphQLCall(
      utilisateurCreerQuery,
      {
        utilisateur: {
          prenom: 'test',
          nom: 'test',
          email: 'test@camino.local',
          motDePasse: 'mot-de-passe',
          role: 'admin',
          administrationId: administration.id
        }
      },
      { role: 'super' }
    )

    expect(res.body.errors).toBeUndefined()
    expect(res.body).toMatchObject({
      data: { utilisateurCreer: { prenom: 'test' } }
    })
  })

  test("ne peut pas être associé à une entreprise (utilisateur 'defaut')", async () => {
    const res = await graphQLCall(
      utilisateurCreerQuery,
      {
        utilisateur: {
          prenom: 'toto',
          nom: 'test',
          email: 'test@camino.local',
          motDePasse: 'mot-de-passe',
          entreprises: [{ id: 'entreprise' }]
        }
      },
      { role: 'super' }
    )

    expect(res.body.errors[0].message).toBe(
      "le rôle de cet utilisateur ne permet pas de l'associer à une entreprise"
    )
  })

  test("peut être associé à une entreprise (utilisateur 'entreprise')", async () => {
    await knex('entreprises').insert({ id: 'entreprise', nom: 'entre' })

    const res = await graphQLCall(
      utilisateurCreerQuery,
      {
        utilisateur: {
          prenom: 'toto',
          nom: 'test',
          email: 'test@camino.local',
          motDePasse: 'mot-de-passe',
          role: 'entreprise',
          entreprises: [{ id: 'entreprise' }]
        }
      },
      { role: 'super' }
    )

    expect(res.body.errors).toBeUndefined()
    expect(res.body).toMatchObject({
      data: { utilisateurCreer: { prenom: 'toto' } }
    })
  })
})

describe('utilisateurSupprimer', () => {
  const utilisateurSupprimerQuery = queryImport('utilisateur-supprimer')

  test('ne peut pas supprimer un compte (utilisateur anonyme)', async () => {
    const res = await graphQLCall(
      utilisateurSupprimerQuery,
      { id: 'test' },
      undefined
    )

    expect(res.body.errors[0].message).toMatch(/droits insuffisants/)
  })

  test('peut supprimer son compte utilisateur', async () => {
    const user = await userGenerate({ role: 'defaut' })
    const res = await graphQLCall(
      utilisateurSupprimerQuery,
      { id: user.id },
      {
        role: 'defaut'
      }
    )

    expect(res.body.errors).toBeUndefined()
    expect(res.body).toMatchObject({
      data: { utilisateurSupprimer: { id: user.id } }
    })
  })

  test('peut supprimer un utilisateur (utilisateur super)', async () => {
    const id = 'user-todelete'
    await userAdd(knex, {
      id,
      prenom: 'userToDelete',
      nom: 'test',
      email: 'user-to-delete@camino.local',
      motDePasse: 'mot-de-passe',
      role: 'defaut',
      dateCreation: '2022-05-12'
    })

    const res = await graphQLCall(
      utilisateurSupprimerQuery,
      { id },
      { role: 'super' }
    )

    expect(res.body).toMatchObject({ data: { utilisateurSupprimer: { id } } })
  })

  test('ne peut pas supprimer un utilisateur inexistant (utilisateur super)', async () => {
    const res = await graphQLCall(
      utilisateurSupprimerQuery,
      { id: 'toto' },
      { role: 'super' }
    )

    expect(res.body.errors[0].message).toMatch(/aucun utilisateur avec cet id/)
  })
})
