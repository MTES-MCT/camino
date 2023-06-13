import { entrepriseDocumentIdValidator, EntrepriseDocumentInput, newEntrepriseId, Siren, sirenValidator, tempDocumentNameValidator } from 'camino-common/src/entreprise.js'
import { dbManager } from '../../../tests/db-manager.js'
import { restCall, restDeleteCall, restPostCall, restPutCall } from '../../../tests/_utils/index.js'
import { entrepriseUpsert } from '../../database/queries/entreprises.js'
import { afterAll, beforeAll, describe, test, expect, vi, beforeEach } from 'vitest'
import { userSuper } from '../../database/user-super.js'
import { testBlankUser } from 'camino-common/src/tests-utils.js'
import { entreprisesEtablissementsFetch, entreprisesFetch, tokenInitialize } from '../../tools/api-insee/fetch.js'
import { entreprise, entrepriseAndEtablissements } from '../../../tests/__mocks__/fetch-insee-api.js'
import type { Pool } from 'pg'
import { titreCreate } from '../../database/queries/titres.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { titreEtapeCreate } from '../../database/queries/titres-etapes.js'
import { toCaminoAnnee, toCaminoDate } from 'camino-common/src/date.js'
import { constants } from 'http2'
import { mkdirSync, writeFileSync } from 'fs'
import { idGenerate } from '../../database/models/_format/id-create'
import { dbQueryAndValidate } from '../../pg-database.js'
import { insertTitreEtapeEntrepriseDocument } from '../../database/queries/titres-etapes.queries.js'
import { z } from 'zod'
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
const dir = `${process.cwd()}/files/tmp/`
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
    const tested = await restCall(dbPool, '/rest/entreprises/:entrepriseId/fiscalite/:annee', { entrepriseId: entreprise.id, annee: toCaminoAnnee('2022') }, { role: 'defaut' })

    expect(tested.statusCode).toBe(403)
  })
})

describe('entrepriseCreer', () => {
  test('ne peut pas créer une entreprise (utilisateur anonyme)', async () => {
    const tested = await restPostCall(dbPool, '/rest/entreprises', {}, undefined, { siren: entreprise.siren })
    expect(tested.statusCode).toBe(403)
  })

  test("peut créer une entreprise (un utilisateur 'super')", async () => {
    tokenInitializeMock.mockResolvedValue('token')
    entrepriseFetchMock.mockResolvedValue([entreprise])
    entreprisesEtablissementsFetchMock.mockResolvedValue([entrepriseAndEtablissements])

    const tested = await restPostCall(dbPool, '/rest/entreprises', {}, userSuper, { siren: entreprise.siren })
    expect(tested.statusCode).toBe(204)
  })

  test("ne peut pas créer une entreprise déjà existante (un utilisateur 'super')", async () => {
    tokenInitializeMock.mockResolvedValue('token')
    const siren = sirenValidator.parse('123456789')
    entrepriseFetchMock.mockResolvedValue([{ ...entreprise, siren }])
    entreprisesEtablissementsFetchMock.mockResolvedValue([{ ...entrepriseAndEtablissements, siren }])
    let tested = await restPostCall(dbPool, '/rest/entreprises', {}, userSuper, { siren })
    expect(tested.statusCode).toBe(204)
    tested = await restPostCall(dbPool, '/rest/entreprises', {}, userSuper, { siren })
    expect(tested.statusCode).toBe(400)
  })

  test("ne peut pas créer une entreprise avec un siren invalide (un utilisateur 'super')", async () => {
    tokenInitializeMock.mockResolvedValue('token')
    entrepriseFetchMock.mockResolvedValue([])

    const tested = await restPostCall(dbPool, '/rest/entreprises', {}, userSuper, { siren: 'invalide' as Siren })
    expect(tested.statusCode).toBe(400)
  })
})

describe('entrepriseModifier', () => {
  test('ne peut pas modifier une entreprise (utilisateur anonyme)', async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('anonymous'),
      nom: 'Mon Entreprise',
    })
    const tested = await restPutCall(dbPool, '/rest/entreprises/:entrepriseId', { entrepriseId: entreprise.id }, undefined, { id: entreprise.id, email: 'toto@gmail.com' })
    expect(tested.statusCode).toBe(403)
  })

  test("peut modifier une entreprise (un utilisateur 'super')", async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('super'),
      nom: 'Mon Entreprise',
    })
    const tested = await restPutCall(dbPool, '/rest/entreprises/:entrepriseId', { entrepriseId: entreprise.id }, userSuper, { id: entreprise.id, email: 'toto@gmail.com' })
    expect(tested.statusCode).toBe(204)
  })

  test("peut modifier une entreprise (un utilisateur 'entreprise')", async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('monBelEntrepriseId'),
      nom: 'Mon Entreprise',
    })
    const tested = await restPutCall(
      dbPool,
      '/rest/entreprises/:entrepriseId',
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
      '/rest/entreprises/:entrepriseId',
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
    const tested = await restPutCall(dbPool, '/rest/entreprises/:entrepriseId', { entrepriseId: entreprise.id }, userSuper, { id: entreprise.id, email: 'totogmailcom' })
    expect(tested.statusCode).toBe(400)
  })

  test("ne peut pas modifier une entreprise inexistante (un utilisateur 'super')", async () => {
    const entrepriseId = newEntrepriseId('unknown')
    const tested = await restPutCall(dbPool, '/rest/entreprises/:entrepriseId', { entrepriseId: newEntrepriseId('unknown') }, userSuper, { id: entrepriseId, email: 'totogmailcom' })
    expect(tested.statusCode).toBe(400)
  })

  test('peut archiver une entreprise (super)', async () => {
    const entreprise = await entrepriseUpsert({
      id: newEntrepriseId('superArchive'),
      nom: 'Mon Entreprise',
      archive: false,
    })
    const tested = await restPutCall(dbPool, '/rest/entreprises/:entrepriseId', { entrepriseId: entreprise.id }, userSuper, { id: entreprise.id, archive: true })
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
      '/rest/entreprises/:entrepriseId',
      { entrepriseId: entreprise.id },
      { ...testBlankUser, role: 'admin', administrationId: 'aut-97300-01' },
      { id: entreprise.id, archive: true }
    )
    expect(tested.statusCode).toBe(400)
  })
})

describe('getEntreprise', () => {
  test('peut récupérer une entreprise', async () => {
    const entrepriseId = newEntrepriseId('nouvelle-entreprise-id')
    await entrepriseUpsert({ id: entrepriseId, nom: entrepriseId })
    const tested = await restCall(dbPool, '/rest/entreprises/:entrepriseId', { entrepriseId }, { ...testBlankUser, role: 'super' })
    expect(tested.statusCode).toBe(constants.HTTP_STATUS_OK)
    expect(tested.body).toMatchInlineSnapshot(`
      {
        "adresse": null,
        "amodiataireTitres": [],
        "archive": false,
        "categorie": null,
        "cedex": null,
        "codePostal": null,
        "commune": null,
        "dateCreation": null,
        "email": null,
        "etablissements": [],
        "id": "nouvelle-entreprise-id",
        "legalEtranger": null,
        "legalForme": null,
        "legalSiren": null,
        "nom": "nouvelle-entreprise-id",
        "paysId": null,
        "telephone": null,
        "titulaireTitres": [],
        "url": null,
        "utilisateurs": [],
      }
    `)
  })
})

describe('postEntrepriseDocument', () => {
  test('ne peut pas ajouter un document inexistant sur le disque dur', async () => {
    const entrepriseId = newEntrepriseId('entreprise-id')
    await entrepriseUpsert({ id: entrepriseId, nom: entrepriseId })

    const documentToInsert: EntrepriseDocumentInput = {
      typeId: 'kbi',
      date: toCaminoDate('2023-05-16'),
      description: 'desc',
      tempDocumentName: tempDocumentNameValidator.parse('notExistingFile'),
    }
    const tested = await restPostCall(dbPool, '/rest/entreprises/:entrepriseId/documents', { entrepriseId }, { ...testBlankUser, role: 'super' }, documentToInsert)
    expect(tested.statusCode).toBe(constants.HTTP_STATUS_BAD_REQUEST)

    const entrepriseDocumentsCall = await restCall(dbPool, '/rest/entreprises/:entrepriseId/documents', { entrepriseId }, { ...testBlankUser, role: 'super' })
    expect(entrepriseDocumentsCall.statusCode).toBe(constants.HTTP_STATUS_OK)
    expect(entrepriseDocumentsCall.body).toMatchInlineSnapshot('[]')
  })

  test('peut ajouter un document', async () => {
    const entrepriseId = newEntrepriseId('entreprise-id')
    await entrepriseUpsert({ id: entrepriseId, nom: entrepriseId })

    const fileName = `existing_temp_file_${idGenerate()}`
    mkdirSync(dir, { recursive: true })
    writeFileSync(`${dir}/${fileName}`, 'Hey there!')
    const documentToInsert: EntrepriseDocumentInput = {
      typeId: 'kbi',
      date: toCaminoDate('2023-05-16'),
      description: 'desc',
      tempDocumentName: tempDocumentNameValidator.parse(fileName),
    }

    const tested = await restPostCall(dbPool, '/rest/entreprises/:entrepriseId/documents', { entrepriseId }, { ...testBlankUser, role: 'super' }, documentToInsert)
    expect(tested.statusCode).toBe(constants.HTTP_STATUS_OK)

    const entrepriseDocumentsCall = await restCall(dbPool, '/rest/entreprises/:entrepriseId/documents', { entrepriseId }, { ...testBlankUser, role: 'super' })
    expect(entrepriseDocumentsCall.statusCode).toBe(constants.HTTP_STATUS_OK)
    expect(entrepriseDocumentsCall.body).toHaveLength(1)
    expect(entrepriseDocumentsCall.body[0]).toMatchObject({
      can_delete_document: true,
      date: '2023-05-16',
      description: 'desc',
      id: expect.any(String),
      entreprise_document_type_id: 'kbi',
    })
  })
})
describe('getEntrepriseDocument', () => {
  test("peut récupérer les documents d'entreprise et ne peut pas supprimer les documents liés à des étapes (super)", async () => {
    const entrepriseId = newEntrepriseId('get-entreprise-document-entreprise-id')
    await entrepriseUpsert({ id: entrepriseId, nom: entrepriseId })

    const titre = await titreCreate(
      {
        nom: '',
        typeId: 'arm',
        titreStatutId: 'ind',
        slug: 'arm-slug',
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
        ordre: 1,
      },
      userSuper,
      titre.id
    )

    const fileName = `existing_temp_file_${idGenerate()}`
    mkdirSync(dir, { recursive: true })
    writeFileSync(`${dir}/${fileName}`, 'Hey there!')
    const documentToInsert: EntrepriseDocumentInput = {
      typeId: 'atf',
      date: toCaminoDate('2023-01-12'),
      description: 'desc',
      tempDocumentName: tempDocumentNameValidator.parse(fileName),
    }

    const documentCall = await restPostCall(dbPool, '/rest/entreprises/:entrepriseId/documents', { entrepriseId }, { ...testBlankUser, role: 'super' }, documentToInsert)
    expect(documentCall.statusCode).toBe(constants.HTTP_STATUS_OK)

    mkdirSync(dir, { recursive: true })
    writeFileSync(`${dir}/${fileName}`, 'Hey there!')
    const secondDocumentToInsert: EntrepriseDocumentInput = {
      typeId: 'kbi',
      date: toCaminoDate('2023-02-12'),
      description: 'descSecondDocument',
      tempDocumentName: tempDocumentNameValidator.parse(fileName),
    }

    const secondDocumentCall = await restPostCall(dbPool, '/rest/entreprises/:entrepriseId/documents', { entrepriseId }, { ...testBlankUser, role: 'super' }, secondDocumentToInsert)
    expect(secondDocumentCall.statusCode).toBe(constants.HTTP_STATUS_OK)

    const entrepriseDocumentId = entrepriseDocumentIdValidator.parse(documentCall.body)
    await dbQueryAndValidate(insertTitreEtapeEntrepriseDocument, { entreprise_document_id: entrepriseDocumentId, titre_etape_id: titreEtape.id }, dbPool, z.void())

    const tested = await restCall(dbPool, '/rest/entreprises/:entrepriseId/documents', { entrepriseId }, { ...testBlankUser, role: 'super' })
    expect(tested.statusCode).toBe(constants.HTTP_STATUS_OK)
    expect(tested.body).toHaveLength(2)
    expect(tested.body[0]).toMatchObject({
      can_delete_document: false,
      date: '2023-01-12',
      description: 'desc',
      id: documentCall.body,
      entreprise_document_type_id: 'atf',
    })
    expect(tested.body[1]).toMatchObject({
      can_delete_document: true,
      date: '2023-02-12',
      description: 'descSecondDocument',
      id: secondDocumentCall.body,
      entreprise_document_type_id: 'kbi',
    })

    const deletePossible = await restDeleteCall(
      dbPool,
      '/rest/entreprises/:entrepriseId/documents/:entrepriseDocumentId',
      { entrepriseId, entrepriseDocumentId: secondDocumentCall.body },
      { ...testBlankUser, role: 'super' }
    )

    expect(deletePossible.statusCode).toBe(constants.HTTP_STATUS_NO_CONTENT)

    const deleteNotPossible = await restDeleteCall(
      dbPool,
      '/rest/entreprises/:entrepriseId/documents/:entrepriseDocumentId',
      { entrepriseId, entrepriseDocumentId: documentCall.body },
      { ...testBlankUser, role: 'super' }
    )

    expect(deleteNotPossible.statusCode).toBe(constants.HTTP_STATUS_FORBIDDEN)
  })
})
