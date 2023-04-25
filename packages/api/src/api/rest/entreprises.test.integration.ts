import { newEntrepriseId } from 'camino-common/src/entreprise.js'
import { dbManager } from '../../../tests/db-manager.js'
import { restCall, restPostCall, restPutCall } from '../../../tests/_utils/index.js'
import { entrepriseUpsert } from '../../database/queries/entreprises.js'
import { afterAll, beforeAll, describe, test, expect, vi, beforeEach } from 'vitest'
import { CaminoRestRoutes } from 'camino-common/src/rest.js'
import { userSuper } from '../../database/user-super.js'
import { testBlankUser } from 'camino-common/src/tests-utils.js'
import { entreprisesEtablissementsFetch, entreprisesFetch, tokenInitialize } from '../../tools/api-insee/fetch.js'
import { entreprise, entrepriseAndEtablissements } from '../../../tests/__mocks__/fetch-insee-api.js'
import type { Pool } from 'pg'

vi.mock('../../tools/api-insee/fetch', () => ({
  __esModule: true,
  tokenInitialize: vi.fn(),
  entreprisesFetch: vi.fn(),
  entreprisesEtablissementsFetch: vi.fn(),
}))

const tokenInitializeMock = vi.mocked(tokenInitialize, true)
const entrepriseFetchMock = vi.mocked(entreprisesFetch, true)
const entreprisesEtablissementsFetchMock = vi.mocked(entreprisesEtablissementsFetch, true)

beforeEach(() => {
  vi.resetAllMocks()
})
let dbPool: Pool
beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('fiscalite', () => {
  test('un utilisateur defaut n’a pas les droits', async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('plop'),
      nom: 'Mon Entreprise',
    })
    const tested = await restCall(dbPool, CaminoRestRoutes.fiscaliteEntreprise, { entrepriseId: entreprise.id, annee: '2022' }, { role: 'defaut' })

    expect(tested.statusCode).toBe(403)
  })
})

describe('entrepriseCreer', () => {
  test('ne peut pas créer une entreprise (utilisateur anonyme)', async () => {
    const tested = await restPostCall(dbPool, CaminoRestRoutes.entreprises, {}, undefined, { siren: entreprise.siren })
    expect(tested.statusCode).toBe(403)
  })

  test("peut créer une entreprise (un utilisateur 'super')", async () => {
    tokenInitializeMock.mockResolvedValue('token')
    entrepriseFetchMock.mockResolvedValue([entreprise])
    entreprisesEtablissementsFetchMock.mockResolvedValue([entrepriseAndEtablissements])

    const tested = await restPostCall(dbPool, CaminoRestRoutes.entreprises, {}, userSuper, { siren: entreprise.siren })
    expect(tested.statusCode).toBe(204)
  })

  test("ne peut pas créer une entreprise déjà existante (un utilisateur 'super')", async () => {
    tokenInitializeMock.mockResolvedValue('token')
    const siren = '123456789'
    entrepriseFetchMock.mockResolvedValue([{ ...entreprise, siren }])
    entreprisesEtablissementsFetchMock.mockResolvedValue([{ ...entrepriseAndEtablissements, siren }])
    let tested = await restPostCall(dbPool, CaminoRestRoutes.entreprises, {}, userSuper, { siren })
    expect(tested.statusCode).toBe(204)
    tested = await restPostCall(dbPool, CaminoRestRoutes.entreprises, {}, userSuper, { siren })
    expect(tested.statusCode).toBe(400)
  })

  test("ne peut pas créer une entreprise avec un siren invalide (un utilisateur 'super')", async () => {
    tokenInitializeMock.mockResolvedValue('token')
    entrepriseFetchMock.mockResolvedValue([])

    const tested = await restPostCall(dbPool, CaminoRestRoutes.entreprises, {}, userSuper, { siren: 'invalide' })
    expect(tested.statusCode).toBe(400)
  })
})

describe('entrepriseModifier', () => {
  test('ne peut pas modifier une entreprise (utilisateur anonyme)', async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('anonymous'),
      nom: 'Mon Entreprise',
    })
    const tested = await restPutCall(dbPool, CaminoRestRoutes.entreprise, { entrepriseId: entreprise.id }, undefined, { id: entreprise.id, email: 'toto@gmail.com' })
    expect(tested.statusCode).toBe(403)
  })

  test("peut modifier une entreprise (un utilisateur 'super')", async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('super'),
      nom: 'Mon Entreprise',
    })
    const tested = await restPutCall(dbPool, CaminoRestRoutes.entreprise, { entrepriseId: entreprise.id }, userSuper, { id: entreprise.id, email: 'toto@gmail.com' })
    expect(tested.statusCode).toBe(204)
  })

  test("peut modifier une entreprise (un utilisateur 'entreprise')", async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('entreprise'),
      nom: 'Mon Entreprise',
    })
    const tested = await restPutCall(
      dbPool,
      CaminoRestRoutes.entreprise,
      { entrepriseId: entreprise.id },
      { ...testBlankUser, role: 'entreprise', entreprises: [{ id: entreprise.id }] },
      { id: entreprise.id, email: 'toto@gmail.com' }
    )
    expect(tested.statusCode).toBe(204)
  })

  test('un utilisateur entreprise ne peut pas modifier une entreprise qui ne lui appartient pas', async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('otherEntreprise'),
      nom: 'Mon Entreprise',
    })
    const tested = await restPutCall(
      dbPool,
      CaminoRestRoutes.entreprise,
      { entrepriseId: entreprise.id },
      { ...testBlankUser, role: 'entreprise', entreprises: [] },
      { id: entreprise.id, email: 'toto@gmail.com' }
    )
    expect(tested.statusCode).toBe(403)
  })

  test("ne peut pas modifier une entreprise avec un email invalide (un utilisateur 'super')", async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('super'),
      nom: 'Mon Entreprise',
    })
    const tested = await restPutCall(dbPool, CaminoRestRoutes.entreprise, { entrepriseId: entreprise.id }, userSuper, { id: entreprise.id, email: 'totogmailcom' })
    expect(tested.statusCode).toBe(400)
  })

  test("ne peut pas modifier une entreprise inexistante (un utilisateur 'super')", async () => {
    const entrepriseId = newEntrepriseId('unknown')
    const tested = await restPutCall(dbPool, CaminoRestRoutes.entreprise, { entrepriseId: newEntrepriseId('unknown') }, userSuper, { id: entrepriseId, email: 'totogmailcom' })
    expect(tested.statusCode).toBe(400)
  })

  test('peut archiver une entreprise (super)', async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('superArchive'),
      nom: 'Mon Entreprise',
      archive: false,
    })
    const tested = await restPutCall(dbPool, CaminoRestRoutes.entreprise, { entrepriseId: entreprise.id }, userSuper, { id: entreprise.id, archive: true })
    expect(tested.statusCode).toBe(204)
  })
  test('ne peut pas archiver une entreprise', async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('notArchive'),
      nom: 'Mon Entreprise',
      archive: false,
    })
    const tested = await restPutCall(
      dbPool,
      CaminoRestRoutes.entreprise,
      { entrepriseId: entreprise.id },
      { ...testBlankUser, role: 'admin', administrationId: 'aut-97300-01' },
      { id: entreprise.id, archive: true }
    )
    expect(tested.statusCode).toBe(400)
  })
})
