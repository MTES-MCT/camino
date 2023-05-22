import { graphQLCall, queryImport } from '../../../tests/_utils/index.js'
import { documentCreate, documentGet } from '../../database/queries/documents.js'
import { entrepriseUpsert } from '../../database/queries/entreprises.js'
import { titreCreate } from '../../database/queries/titres.js'
import { titreEtapeCreate } from '../../database/queries/titres-etapes.js'
import { userSuper } from '../../database/user-super.js'
import { dbManager } from '../../../tests/db-manager.js'
import { titreDemarcheCreate } from '../../database/queries/titres-demarches.js'
import { getCurrent, toCaminoDate } from 'camino-common/src/date.js'
import { newEntrepriseId } from 'camino-common/src/entreprise.js'

import { afterAll, afterEach, beforeAll, describe, test, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import { newDocumentId } from '../../database/models/_format/id-create.js'

console.info = vi.fn()
console.error = vi.fn()

let dbPool: Pool
beforeAll(async () => {
  const { pool } = await dbManager.populateDb()
  dbPool = pool
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
    const res = await graphQLCall(dbPool, documentSupprimerQuery, { id: 'toto' }, undefined)

    expect(res.body.errors[0].message).toBe('droits insuffisants')
  })

  test('ne peut pas supprimer un document inexistant (utilisateur super)', async () => {
    const res = await graphQLCall(dbPool, documentSupprimerQuery, { id: 'toto' }, { role: 'super' })

    expect(res.body.errors[0].message).toBe('aucun document avec cette id')
  })

  test('ne peut pas supprimer un document d’entreprise (utilisateur super)', async () => {
    const entrepriseId = newEntrepriseId('entreprise-id')
    await entrepriseUpsert({ id: entrepriseId, nom: entrepriseId })

    const documentId = newDocumentId(getCurrent(), 'fac')
    await documentCreate({
      id: documentId,
      typeId: 'fac',
      date: toCaminoDate('2023-01-12'),
      entrepriseId,
    })

    const res = await graphQLCall(dbPool, documentSupprimerQuery, { id: documentId }, { role: 'super' })

    expect(res.body.errors[0].message).toBe(`impossible de gérer les justificatifs d'entreprise`)
  })

  test('peut supprimer un document d’étape (utilisateur super)', async () => {
    const entrepriseId = newEntrepriseId('entreprise-id')
    await entrepriseUpsert({ id: entrepriseId, nom: entrepriseId })

    const titre = await titreCreate(
      {
        nom: '',
        slug: 'slug-arm-2',
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
        statutId: 'aco',
        titreDemarcheId: titreDemarche.id,
        date: toCaminoDate('2021-01-01'),
      },
      userSuper,
      titre.id
    )

    const documentId = newDocumentId(getCurrent(), 'fac')
    await documentCreate({
      id: documentId,
      typeId: 'fac',
      date: toCaminoDate('2023-01-12'),
      entrepriseId,
      titreEtapeId: titreEtape.id,
    })

    const res = await graphQLCall(dbPool, documentSupprimerQuery, { id: documentId }, { role: 'super' })

    expect(res.body.errors).toBeUndefined()
    expect(res.body.data.documentSupprimer).toBeTruthy()
    expect(await documentGet(documentId, {}, userSuper)).toBeUndefined()
  })
})
