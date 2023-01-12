import { graphQLCall, queryImport } from '../../../tests/_utils/index.js'
import { ITitreEtapeJustificatif } from '../../types.js'
import {
  documentCreate,
  documentGet
} from '../../database/queries/documents.js'
import { entrepriseUpsert } from '../../database/queries/entreprises.js'
import { titreCreate } from '../../database/queries/titres.js'
import {
  titreEtapeCreate,
  titresEtapesJustificatifsUpsert
} from '../../database/queries/titres-etapes.js'
import { userSuper } from '../../database/user-super.js'
import { dbManager } from '../../../tests/db-manager.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { newEntrepriseId } from 'camino-common/src/entreprise.js'

import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  test,
  expect,
  vi
} from 'vitest'

console.info = vi.fn()
console.error = vi.fn()

beforeAll(async () => {
  await dbManager.populateDb()
})

afterEach(async () => {
  await dbManager.reseedDb()
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('documentSupprimer', () => {
  const documentSupprimerQuery = queryImport('documents-supprimer')

  test('ne peut pas supprimer un document (utilisateur anonyme)', async () => {
    const res = await graphQLCall(
      documentSupprimerQuery,
      { id: 'toto' },
      undefined
    )

    expect(res.body.errors[0].message).toBe('droits insuffisants')
  })

  test('ne peut pas supprimer un document inexistant (utilisateur super)', async () => {
    const res = await graphQLCall(
      documentSupprimerQuery,
      { id: 'toto' },
      'super'
    )

    expect(res.body.errors[0].message).toBe('aucun document avec cette id')
  })

  test('peut supprimer un document d’entreprise (utilisateur super)', async () => {
    const entrepriseId = newEntrepriseId('entreprise-id')
    await entrepriseUpsert({ id: entrepriseId, nom: entrepriseId })

    const documentId = 'document-id'
    await documentCreate({
      id: documentId,
      typeId: 'fac',
      date: toCaminoDate('2023-01-12'),
      entrepriseId
    })

    const res = await graphQLCall(
      documentSupprimerQuery,
      { id: documentId },
      'super'
    )

    expect(res.body.errors).toBeUndefined()
    expect(res.body.data.documentSupprimer).toBeTruthy()
    expect(await documentGet(documentId, {}, userSuper)).toBeUndefined()
  })

  test('ne peut pas supprimer un document d’entreprise lié à une étape (utilisateur super)', async () => {
    const entrepriseId = newEntrepriseId('entreprise-id')
    await entrepriseUpsert({ id: entrepriseId, nom: entrepriseId })

    const titre = await titreCreate(
      {
        nom: '',
        typeId: 'arm',
        propsTitreEtapesIds: {},
        domaineId: 'm'
      },
      {}
    )
    const titreDemarche = await titreDemarcheCreate({
      titreId: titre.id,
      typeId: 'oct'
    })

    const titreEtape = await titreEtapeCreate(
      {
        typeId: 'mfr',
        statutId: 'fai',
        titreDemarcheId: titreDemarche.id,
        date: toCaminoDate('2022-01-01')
      },
      userSuper,
      titre.id
    )

    const documentId = 'document-id'
    await documentCreate({
      id: documentId,
      typeId: 'fac',
      date: toCaminoDate('2023-01-12'),
      entrepriseId
    })

    await titresEtapesJustificatifsUpsert([
      {
        documentId,
        titreEtapeId: titreEtape.id
      } as ITitreEtapeJustificatif
    ])

    const res = await graphQLCall(
      documentSupprimerQuery,
      { id: documentId },
      'super'
    )

    expect(res.body.errors[0].message).toBe(
      `impossible de supprimer ce document lié à l’étape ${titreEtape.id}`
    )
  })

  test('peut supprimer un document d’étape (utilisateur super)', async () => {
    const entrepriseId = newEntrepriseId('entreprise-id')
    await entrepriseUpsert({ id: entrepriseId, nom: entrepriseId })

    const titre = await titreCreate(
      {
        nom: '',
        typeId: 'arm',
        propsTitreEtapesIds: {},
        domaineId: 'm'
      },
      {}
    )

    const titreDemarche = await titreDemarcheCreate({
      titreId: titre.id,
      typeId: 'oct'
    })

    const titreEtape = await titreEtapeCreate(
      {
        typeId: 'mfr',
        statutId: 'aco',
        titreDemarcheId: titreDemarche.id,
        date: toCaminoDate('2021-01-01')
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
      titreEtapeId: titreEtape.id
    })

    const res = await graphQLCall(
      documentSupprimerQuery,
      { id: documentId },
      'super'
    )

    expect(res.body.errors).toBeUndefined()
    expect(res.body.data.documentSupprimer).toBeTruthy()
    expect(await documentGet(documentId, {}, userSuper)).toBeUndefined()
  })
})
