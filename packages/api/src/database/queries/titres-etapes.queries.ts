/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { dbQueryAndValidate, Redefine } from '../../pg-database.js'
import {
  IDeleteTitreEtapeEntrepriseDocumentInternalQuery,
  IGetEntrepriseDocumentIdsByEtapeIdQueryQuery,
  IGetEntrepriseDocumentLargeObjectIdsByEtapeIdQueryQuery,
  IGetTitulairesByEtapeIdQueryDbQuery,
  IGetAmodiatairesByEtapeIdQueryDbQuery,
  IInsertTitreEtapeEntrepriseDocumentInternalQuery,
  IGetDocumentsByEtapeIdQueryQuery,
  IInsertEtapeDocumentDbQuery,
  IDeleteEtapeDocumentsDbQuery,
  IUpdateEtapeDocumentFileDbQuery,
  IUpdateEtapeDocumentInfoDbQuery,
} from './titres-etapes.queries.types.js'
import { EtapeDocument, EtapeDocumentId, EtapeDocumentModification, etapeDocumentValidator, EtapeDocumentWithFileModification, EtapeId, TempEtapeDocument } from 'camino-common/src/etape.js'
import { EntrepriseDocumentId, entrepriseDocumentValidator, EntrepriseId, EtapeEntrepriseDocument, etapeEntrepriseDocumentValidator } from 'camino-common/src/entreprise.js'
import { EntreprisesByEtapeId, entreprisesByEtapeIdValidator } from 'camino-common/src/demarche.js'
import { Pool } from 'pg'
import { User } from 'camino-common/src/roles.js'
import { canSeeEntrepriseDocuments } from 'camino-common/src/permissions/entreprises.js'
import { z } from 'zod'
import { entrepriseDocumentLargeObjectIdValidator } from '../../api/rest/entreprises.queries.js'
import { canReadDocument } from '../../api/rest/permissions/documents.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, SimplePromiseFn } from 'camino-common/src/typescript-tools.js'
import { CanReadDemarche } from '../../api/rest/permissions/demarches.js'
import { newEtapeDocumentId } from '../models/_format/id-create.js'
import { getCurrent } from 'camino-common/src/date.js'
import { createLargeObject, LargeObjectId } from '../largeobjects.js'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts.js'
import { canDeleteEtapeDocument } from 'camino-common/src/permissions/titres-etapes.js'

export const insertTitreEtapeEntrepriseDocument = async (pool: Pool, params: { titre_etape_id: EtapeId; entreprise_document_id: EntrepriseDocumentId }) =>
  dbQueryAndValidate(insertTitreEtapeEntrepriseDocumentInternal, params, pool, z.void())

const insertTitreEtapeEntrepriseDocumentInternal = sql<Redefine<IInsertTitreEtapeEntrepriseDocumentInternalQuery, { titre_etape_id: EtapeId; entreprise_document_id: EntrepriseDocumentId }, void>>`
insert into titres_etapes_entreprises_documents (titre_etape_id, entreprise_document_id)
    values ($ titre_etape_id, $ entreprise_document_id)
`
export const deleteTitreEtapeEntrepriseDocument = async (pool: Pool, params: { titre_etape_id: EtapeId }) => dbQueryAndValidate(deleteTitreEtapeEntrepriseDocumentInternal, params, pool, z.void())

const deleteTitreEtapeEntrepriseDocumentInternal = sql<Redefine<IDeleteTitreEtapeEntrepriseDocumentInternalQuery, { titre_etape_id: EtapeId }, void>>`
delete from titres_etapes_entreprises_documents
where titre_etape_id = $ titre_etape_id
`

const getEntrepriseDocumentIdsByEtapeIdQuery = sql<Redefine<IGetEntrepriseDocumentIdsByEtapeIdQueryQuery, { titre_etape_id: EtapeId }, EtapeEntrepriseDocument>>`
select
    teed.entreprise_document_id as id,
    ed.entreprise_document_type_id,
    ed.entreprise_id,
    ed.date,
    ed.description
from
    titres_etapes_entreprises_documents teed
    join entreprises_documents ed on ed.id = teed.entreprise_document_id
where
    teed.titre_etape_id = $ titre_etape_id
`

export const getEntrepriseDocumentIdsByEtapeId = async (params: { titre_etape_id: EtapeId }, pool: Pool, user: User): Promise<EtapeEntrepriseDocument[]> => {
  const result = await dbQueryAndValidate(getEntrepriseDocumentIdsByEtapeIdQuery, params, pool, etapeEntrepriseDocumentValidator)

  return result.filter(r => canSeeEntrepriseDocuments(user, r.entreprise_id))
}

const entrepriseDocumentLargeObjectIdsValidator = entrepriseDocumentValidator
  .pick({ id: true, entreprise_id: true, entreprise_document_type_id: true })
  .extend({ largeobject_id: entrepriseDocumentLargeObjectIdValidator })
type EntrepriseDocumentLargeObjectId = z.infer<typeof entrepriseDocumentLargeObjectIdsValidator>

const getEntrepriseDocumentLargeObjectIdsByEtapeIdQuery = sql<Redefine<IGetEntrepriseDocumentLargeObjectIdsByEtapeIdQueryQuery, { titre_etape_id: EtapeId }, EntrepriseDocumentLargeObjectId>>`
select
    ed.id,
    ed.entreprise_id,
    ed.largeobject_id,
    ed.entreprise_document_type_id
from
    titres_etapes_entreprises_documents teed
    join entreprises_documents ed on ed.id = teed.entreprise_document_id
where
    teed.titre_etape_id = $ titre_etape_id
`

export const getEntrepriseDocumentLargeObjectIdsByEtapeId = async (params: { titre_etape_id: EtapeId }, pool: Pool, user: User): Promise<EntrepriseDocumentLargeObjectId[]> => {
  const result = await dbQueryAndValidate(getEntrepriseDocumentLargeObjectIdsByEtapeIdQuery, params, pool, entrepriseDocumentLargeObjectIdsValidator)

  return result.filter(r => canSeeEntrepriseDocuments(user, r.entreprise_id))
}

export const updateEtapeDocuments = async (pool: Pool, user: User, titre_etape_id: EtapeId, etapeStatutId: EtapeStatutId, etapeDocuments: EtapeDocumentModification[]) => {
  const documentsInDb = await dbQueryAndValidate(getDocumentsByEtapeIdQuery, { titre_etape_id }, pool, etapeDocumentValidator)

  const etapeDocumentToUpdate = etapeDocuments.filter((document): document is EtapeDocumentWithFileModification => 'id' in document)
  const etapeDocumentIdsToUpdate = etapeDocumentToUpdate.map(({ id }) => id)
  const toDeleteDocuments = documentsInDb.filter(({ id }) => !etapeDocumentIdsToUpdate.includes(id))
  const toInsertDocuments = etapeDocuments.filter((document): document is TempEtapeDocument => !('id' in document))

  if (isNotNullNorUndefinedNorEmpty(etapeDocumentToUpdate)) {
    for (const documentToUpdate of etapeDocumentToUpdate) {
      if (isNotNullNorUndefined(documentToUpdate.temp_document_name)) {
        const largeobject_id = await createLargeObject(pool, documentToUpdate.temp_document_name)
        await dbQueryAndValidate(updateEtapeDocumentFileDb, { id: documentToUpdate.id, largeobject_id }, pool, z.void())
      }
      await dbQueryAndValidate(
        updateEtapeDocumentInfoDb,
        { id: documentToUpdate.id, public_lecture: documentToUpdate.public_lecture, entreprises_lecture: documentToUpdate.entreprises_lecture, description: documentToUpdate.description },
        pool,
        z.void()
      )
    }
  }
  if (isNotNullNorUndefinedNorEmpty(toInsertDocuments)) {
    await insertEtapeDocuments(pool, titre_etape_id, toInsertDocuments)
  }
  if (isNotNullNorUndefinedNorEmpty(toDeleteDocuments)) {
    if (!canDeleteEtapeDocument(etapeStatutId)) {
      throw new Error('Impossible de supprimer les documents')
    }

    await dbQueryAndValidate(deleteEtapeDocumentsDb, { ids: toDeleteDocuments.map(({ id }) => id) }, pool, z.void())
  }
}
const updateEtapeDocumentFileDb = sql<Redefine<IUpdateEtapeDocumentFileDbQuery, { id: EtapeDocumentId; largeobject_id: LargeObjectId }, void>>`
update
    etapes_documents
set
    largeobject_id = $ largeobject_id !
where
    id = $ id !
`
const updateEtapeDocumentInfoDb = sql<Redefine<IUpdateEtapeDocumentInfoDbQuery, { id: EtapeDocumentId; public_lecture: boolean; entreprises_lecture: boolean; description: string | null }, void>>`
update
    etapes_documents
set
    public_lecture = $ public_lecture !,
    entreprises_lecture = $ entreprises_lecture !,
    description = $ description
where
    id = $ id !
`
const deleteEtapeDocumentsDb = sql<Redefine<IDeleteEtapeDocumentsDbQuery, { ids: EtapeDocumentId[] }, void>>`
delete from etapes_documents
where id in $$ ids !
`

export const insertEtapeDocuments = async (pool: Pool, titre_etape_id: EtapeId, etapeDocuments: TempEtapeDocument[]) => {
  for (const document of etapeDocuments) {
    const id = newEtapeDocumentId(getCurrent(), document.etape_document_type_id)
    const largeobject_id = await createLargeObject(pool, document.temp_document_name)
    await dbQueryAndValidate(insertEtapeDocumentDb, { ...document, etape_id: titre_etape_id, id, largeobject_id }, pool, z.void())
  }
}

const insertEtapeDocumentDb = sql<
  Redefine<IInsertEtapeDocumentDbQuery, { etape_id: EtapeId; id: EtapeDocumentId; largeobject_id: LargeObjectId } & Omit<TempEtapeDocument, 'temp_document_name'>, void>
>`
insert into etapes_documents (id, etape_document_type_id, etape_id, description, public_lecture, entreprises_lecture, largeobject_id)
    values ($ id !, $ etape_document_type_id !, $ etape_id !, $ description, $ public_lecture !, $ entreprises_lecture !, $ largeobject_id !)
`

export const getTitulairesByEtapeIdQuery = async (etapeId: EtapeId, pool: Pool): Promise<EntreprisesByEtapeId[]> => {
  return dbQueryAndValidate(getTitulairesByEtapeIdQueryDb, { etapeId }, pool, entreprisesByEtapeIdValidator)
}

const getTitulairesByEtapeIdQueryDb = sql<Redefine<IGetTitulairesByEtapeIdQueryDbQuery, { etapeId: EtapeId }, EntreprisesByEtapeId>>`
select
    e.id,
    e.nom,
    tt.operateur
from
    titres_titulaires tt
    join entreprises e on e.id = tt.entreprise_id
where
    tt.titre_etape_id = $ etapeId !
`

export const getAmodiatairesByEtapeIdQuery = async (etapeId: EtapeId, pool: Pool): Promise<EntreprisesByEtapeId[]> => {
  return dbQueryAndValidate(getAmodiatairesByEtapeIdQueryDb, { etapeId }, pool, entreprisesByEtapeIdValidator)
}

const getAmodiatairesByEtapeIdQueryDb = sql<Redefine<IGetAmodiatairesByEtapeIdQueryDbQuery, { etapeId: EtapeId }, EntreprisesByEtapeId>>`
select
    e.id,
    e.nom,
    tt.operateur
from
    titres_amodiataires tt
    join entreprises e on e.id = tt.entreprise_id
where
    tt.titre_etape_id = $ etapeId !
`

const getDocumentsByEtapeIdQuery = sql<Redefine<IGetDocumentsByEtapeIdQueryQuery, { titre_etape_id: EtapeId }, EtapeDocument>>`
select
    d.id,
    d.etape_document_type_id,
    d.description,
    public_lecture,
    entreprises_lecture
from
    etapes_documents d
where
    d.etape_id = $ titre_etape_id !
`

export const getDocumentsByEtapeId = async (
  titre_etape_id: EtapeId,
  pool: Pool,
  user: User,
  titreTypeId: SimplePromiseFn<TitreTypeId>,
  titresAdministrationsLocales: SimplePromiseFn<AdministrationId[]>,
  entreprisesTitulairesOuAmodiataires: SimplePromiseFn<EntrepriseId[]>,
  etapeTypeId: EtapeTypeId,
  demarche: CanReadDemarche
): Promise<EtapeDocument[]> => {
  const result = await dbQueryAndValidate(getDocumentsByEtapeIdQuery, { titre_etape_id }, pool, etapeDocumentValidator)

  const filteredDocuments: EtapeDocument[] = []

  for (const document of result) {
    if (await canReadDocument(document, user, titreTypeId, titresAdministrationsLocales, entreprisesTitulairesOuAmodiataires, etapeTypeId, demarche)) {
      filteredDocuments.push(document)
    }
  }

  return filteredDocuments
}
