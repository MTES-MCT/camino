import { ITitreEtapeJustificatif } from '../../types.js'
import { dbManager } from '../../../tests/db-manager.js'
import { graphQLCall, queryImport } from '../../../tests/_utils/index.js'
import { entreprisesEtablissementsFetch, entreprisesFetch, tokenInitialize } from '../../tools/api-insee/fetch.js'
import { entreprise, entrepriseAndEtablissements } from '../../../tests/__mocks__/fetch-insee-api.js'
import { entrepriseUpsert } from '../../database/queries/entreprises.js'
import { titreCreate } from '../../database/queries/titres.js'
import { documentCreate } from '../../database/queries/documents.js'
import { titreEtapeCreate, titresEtapesJustificatifsUpsert } from '../../database/queries/titres-etapes.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { userSuper } from '../../database/user-super.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { newEntrepriseId } from 'camino-common/src/entreprise.js'
import { beforeAll, afterEach, afterAll, test, expect, describe, vi } from 'vitest'
console.info = vi.fn()
console.error = vi.fn()

vi.mock('../../tools/api-insee/fetch', () => ({
  __esModule: true,
  tokenInitialize: vi.fn(),
  entreprisesFetch: vi.fn(),
  entreprisesEtablissementsFetch: vi.fn(),
}))

const tokenInitializeMock = vi.mocked(tokenInitialize, true)
const entrepriseFetchMock = vi.mocked(entreprisesFetch, true)
const entreprisesEtablissementsFetchMock = vi.mocked(entreprisesEtablissementsFetch, true)
beforeAll(async () => {
  await dbManager.populateDb()
})

afterEach(async () => {
  await dbManager.reseedDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('entrepriseCreer', () => {
  const entrepriseCreerQuery = queryImport('entreprise-creer')

  test('ne peut pas créer une entreprise (utilisateur anonyme)', async () => {
    const res = await graphQLCall(
      entrepriseCreerQuery,
      {
        entreprise: { legalSiren: 'test', paysId: 'fr' },
      },
      undefined
    )

    expect(res.body.errors[0].message).toBe('droits insuffisants')
  })

  test("peut créer une entreprise (un utilisateur 'super')", async () => {
    tokenInitializeMock.mockResolvedValue('token')
    entrepriseFetchMock.mockResolvedValue([entreprise])
    entreprisesEtablissementsFetchMock.mockResolvedValue([entrepriseAndEtablissements])

    const res = await graphQLCall(entrepriseCreerQuery, { entreprise: { legalSiren: '729800706', paysId: 'fr' } }, { role: 'super' })

    expect(res.body).toMatchObject({
      data: {
        entrepriseCreer: {
          legalSiren: '729800706',
        },
      },
    })
    expect(res.body.errors).toBeUndefined()
  })

  test("ne peut pas créer une entreprise déjà existante (un utilisateur 'super')", async () => {
    await graphQLCall(entrepriseCreerQuery, { entreprise: { legalSiren: '729800706', paysId: 'fr' } }, { role: 'super' })

    const res = await graphQLCall(entrepriseCreerQuery, { entreprise: { legalSiren: '729800706', paysId: 'fr' } }, { role: 'super' })

    expect(res.body.errors[0].message).toBe("l'entreprise PLACOPLATRE existe déjà dans Camino")
  })

  test("ne peut pas créer une entreprise avec un siren invalide (un utilisateur 'super')", async () => {
    tokenInitializeMock.mockResolvedValue('token')
    entrepriseFetchMock.mockResolvedValue([])

    const res = await graphQLCall(entrepriseCreerQuery, { entreprise: { legalSiren: 'invalid', paysId: 'fr' } }, { role: 'super' })

    expect(res.body.errors[0].message).toBe('numéro de siren non reconnu dans la base Insee')
  })

  test("ne peut pas créer une entreprise étrangère (un utilisateur 'super')", async () => {
    const res = await graphQLCall(entrepriseCreerQuery, { entreprise: { legalSiren: '729800706', paysId: 'en' } }, { role: 'super' })

    expect(res.body.errors[0].message).toBe('impossible de créer une entreprise étrangère')
  })

  test('n’est pas archivée à la création par défaut (utilisateur super)', async () => {
    tokenInitializeMock.mockResolvedValue('token')
    entrepriseFetchMock.mockResolvedValue([entreprise])
    entreprisesEtablissementsFetchMock.mockResolvedValue([entrepriseAndEtablissements])

    const res = await graphQLCall(entrepriseCreerQuery, { entreprise: { legalSiren: '729800706', paysId: 'fr' } }, { role: 'super' })

    expect(res.body).toMatchObject({
      data: {
        entrepriseCreer: {
          archive: false,
        },
      },
    })
  })
})

describe('entreprise', () => {
  const entrepriseQuery = queryImport('entreprise')

  test('un document d’entreprise lié à une étape est non supprimable et non modifiable (super)', async () => {
    const entrepriseId = newEntrepriseId('entreprise-id')
    await entrepriseUpsert({ id: entrepriseId, nom: entrepriseId })

    const titre = await titreCreate(
      {
        nom: '',
        typeId: 'arm',
        propsTitreEtapesIds: {},
      },
      {}
    )

    const titreDemarche = await titreDemarcheCreate({
      titreId: titre.id,
      typeId: 'oct',
    })
    const titreEtape = await titreEtapeCreate(
      {
        typeId: 'mfr',
        statutId: 'fai',
        titreDemarcheId: titreDemarche.id,
        date: toCaminoDate('2022-01-01'),
      },
      userSuper,
      titre.id
    )

    const documentId = 'document-id'
    await documentCreate({
      id: documentId,
      typeId: 'fac',
      date: toCaminoDate('2023-01-12'),
      entrepriseId,
    })

    await titresEtapesJustificatifsUpsert([{ documentId, titreEtapeId: titreEtape.id } as ITitreEtapeJustificatif])

    const res = await graphQLCall(entrepriseQuery, { id: entrepriseId }, { role: 'super' })

    expect(res.body.errors).toBeUndefined()
    expect(res.body.data.entreprise.documents[0].modification).toBe(false)
    expect(res.body.data.entreprise.documents[0].suppression).toBe(false)
  })

  test('un document d’entreprise lié à aucune étape est supprimable et modifiable (super)', async () => {
    const entrepriseId = newEntrepriseId('entreprise-id')
    await entrepriseUpsert({ id: entrepriseId, nom: entrepriseId })

    const documentId = 'document-id'
    await documentCreate({
      id: documentId,
      typeId: 'fac',
      date: toCaminoDate('2023-01-12'),
      entrepriseId,
    })

    const res = await graphQLCall(entrepriseQuery, { id: entrepriseId }, { role: 'super' })

    expect(res.body.errors).toBeUndefined()
    expect(res.body.data.entreprise.documents[0].modification).toBe(true)
    expect(res.body.data.entreprise.documents[0].suppression).toBe(true)
  })
})

describe('entreprises', () => {
  const entreprisesQuery = queryImport('entreprises')

  test('peut filter les entreprises archivées ou non (super)', async () => {
    const entrepriseId = 'entreprise-id'
    for (let i = 0; i < 10; i++) {
      await entrepriseUpsert({
        id: newEntrepriseId(`${entrepriseId}-${i}`),
        nom: `${entrepriseId}-${i}`,
        archive: i > 3,
      })
    }

    let res = await graphQLCall(entreprisesQuery, { archive: false }, { role: 'super' })
    expect(res.body.errors).toBeUndefined()
    expect(res.body.data.entreprises.elements).toHaveLength(4)

    res = await graphQLCall(entreprisesQuery, { archive: true }, { role: 'super' })
    expect(res.body.data.entreprises.elements).toHaveLength(6)

    res = await graphQLCall(entreprisesQuery, {}, { role: 'super' })
    expect(res.body.data.entreprises.elements).toHaveLength(10)
  })
})
