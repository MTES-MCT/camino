import { dbManager } from '../../../../tests/db-manager.js'

import { userSuper } from '../../user-super.js'

import TitresEtapes from '../../models/titres-etapes.js'
import TitresActivites from '../../models/titres-activites.js'
import Document from '../../models/documents.js'

import { documentCreate, documentGet } from '../documents.js'
import { Knex } from 'knex'
import { newDemarcheId, newDocumentId, newEtapeId, newTitreId } from '../../models/_format/id-create.js'
import { getCurrent, toCaminoDate } from 'camino-common/src/date.js'
import { expect, test, describe, afterAll, beforeAll, vi } from 'vitest'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { ActivitesStatutId } from 'camino-common/src/static/activitesStatuts.js'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes.js'
import { DocumentTypeId } from 'camino-common/src/static/documentsTypes.js'

console.info = vi.fn()
console.error = vi.fn()
let knex: Knex<any, unknown[]>
beforeAll(async () => {
  const { knex: knexInstance } = await dbManager.populateDb()
  knex = knexInstance
})

afterAll(async () => {
  await dbManager.closeKnex()
})

describe('documentSupprimer', () => {
  test.each<[EtapeStatutId, boolean]>([
    ['aco', true],
    ['fai', false],
  ])('vérifie la possibilité de supprimer un document optionnel ou non d’une étape (utilisateur super)', async (statutId, suppression) => {
    // suppression de la clé étrangère sur la démarche pour ne pas avoir à tout créer
    await TitresEtapes.query().delete()
    await Document.query().delete()
    await knex.schema.alterTable(TitresEtapes.tableName, table => {
      table.dropColumns('titreDemarcheId')
    })

    await knex.schema.alterTable(TitresEtapes.tableName, table => {
      table.string('titreDemarcheId').index().notNullable()
    })

    await TitresEtapes.query().insertGraph({
      id: newEtapeId('titreEtapeId'),
      typeId: 'dpu',
      titreDemarcheId: newDemarcheId('titreDemarcheId'),
      date: toCaminoDate('2022-01-01'),
      statutId,
    })

    const documentId = newDocumentId(toCaminoDate('2023-01-12'), 'dec')
    await documentCreate({
      id: documentId,
      typeId: 'dec',
      date: toCaminoDate('2023-01-12'),
      titreEtapeId: newEtapeId('titreEtapeId'),
    })

    const documentRes = await documentGet(documentId, {}, userSuper)

    expect(documentRes.suppression).toBe(suppression)
  })

  test.each<[DocumentTypeId, ActivitesStatutId, ActivitesTypesId, boolean]>([
    ['rie', 'enc', 'pma', true],
    ['rgr', 'enc', 'wrp', true],
    ['rie', 'dep', 'pma', true],
    ['rgr', 'dep', 'wrp', false],
  ])('vérifie la possibilité de supprimer un document optionnel ou non d’une activité (utilisateur super)', async (documentTypeId, activiteStatutId, activiteTypeId, suppression) => {
    // suppression de la clé étrangère sur le titre pour ne pas avoir à tout créer
    await TitresActivites.query().delete()
    await Document.query().delete()
    await knex.schema.alterTable(TitresActivites.tableName, table => {
      table.dropColumns('titreId')
    })

    await knex.schema.alterTable(TitresActivites.tableName, table => {
      table.string('titreId').index().notNullable()
    })

    await TitresActivites.query().insertGraph({
      id: 'titreActiviteId',
      typeId: activiteTypeId,
      titreId: newTitreId(''),
      date: getCurrent(),
      activiteStatutId,
      periodeId: 1,
      annee: 2000,
    })

    const documentId = newDocumentId(toCaminoDate('2023-01-12'), 'dec')
    await documentCreate({
      id: documentId,
      typeId: documentTypeId,
      date: toCaminoDate('2023-01-12'),
      titreActiviteId: 'titreActiviteId',
    })

    const documentRes = await documentGet(documentId, {}, userSuper)

    expect(documentRes.suppression).toBe(suppression)
  })
})
