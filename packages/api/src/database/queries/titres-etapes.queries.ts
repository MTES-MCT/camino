import { sql } from '@pgtyped/runtime'
import { dbQueryAndValidate, effectDbQueryAndValidate, EffectDbQueryAndValidateErrors, Redefine } from '../../pg-database'
import {
  IDeleteTitreEtapeEntrepriseDocumentInternalQuery,
  IGetEntrepriseDocumentIdsByEtapeIdQueryQuery,
  IGetEntrepriseDocumentLargeObjectIdsByEtapeIdQueryQuery,
  IInsertTitreEtapeEntrepriseDocumentInternalQuery,
  IGetDocumentsByEtapeIdQueryQuery,
  IInsertEtapeDocumentDbQuery,
  IDeleteEtapeDocumentsDbQuery,
  IUpdateEtapeDocumentFileDbQuery,
  IUpdateEtapeDocumentInfoDbQuery,
  IInsertEtapeAvisDbQuery,
  IGetAvisByEtapeIdQueryQuery,
  IGetLargeobjectIdByEtapeAvisIdInternalQuery,
  IUpdateEtapeAvisInfoDbQuery,
  IUpdateEtapeAvisFileDbQuery,
  IDeleteEtapeAvisDbQuery,
  IGetEtapesWithAutomaticStatutDbQuery,
  IUpdateEtapeStatutDbQuery,
  IUpdateEtapeFondamentaleIdDbQuery,
} from './titres-etapes.queries.types'
import {
  autreEtapeAvisValidator,
  ETAPE_IS_BROUILLON,
  EtapeAvisId,
  etapeAvisIdValidator,
  EtapeAvisModification,
  EtapeAvisWithFileModification,
  EtapeBrouillon,
  EtapeDocument,
  etapeDocumentDescriptionObligatoireValidator,
  etapeDocumentDescriptionOptionnelleValidator,
  EtapeDocumentId,
  EtapeDocumentModification,
  etapeDocumentValidator,
  EtapeDocumentWithFileModification,
  EtapeId,
  etapeIdValidator,
  regularEtapeAvisValidator,
  TempEtapeAvis,
  TempEtapeDocument,
} from 'camino-common/src/etape'
import { EntrepriseDocument, EntrepriseDocumentId, entrepriseDocumentValidator, EntrepriseId, EtapeEntrepriseDocument, etapeEntrepriseDocumentValidator } from 'camino-common/src/entreprise'
import { Pool } from 'pg'
import { User } from 'camino-common/src/roles'
import { canSeeEntrepriseDocuments } from 'camino-common/src/permissions/entreprises'
import { z } from 'zod'
import { entrepriseDocumentLargeObjectIdValidator } from '../../api/rest/entreprises.queries'
import { canReadDocument } from '../../api/rest/permissions/documents'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { ETAPES_WITH_AUTOMATIC_STATUTS, EtapeTypeId, etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes'
import { TitreTypeId, titreTypeIdValidator } from 'camino-common/src/static/titresTypes'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, SimplePromiseFn } from 'camino-common/src/typescript-tools'
import { CanReadDemarche } from '../../api/rest/permissions/demarches'
import { newEtapeAvisId, newEtapeDocumentId } from '../models/_format/id-create'
import { caminoDateValidator, FirstEtapeDate, getCurrent } from 'camino-common/src/date'
import { createLargeObject, LargeObjectId, largeObjectIdValidator } from '../largeobjects'
import { avisStatutIdValidator, avisVisibilityIdValidator } from 'camino-common/src/static/avisTypes'
import { canReadAvis } from '../../api/rest/permissions/avis'
import { getEtapeDataForEdition } from '../../api/rest/etapes.queries'
import { etapeAvisStepIsComplete } from 'camino-common/src/permissions/etape-form'
import { CommuneId } from 'camino-common/src/static/communes'
import { EtapeStatutId, etapeStatutIdValidator } from 'camino-common/src/static/etapesStatuts'
import { contenuValidator, heritageContenuValidator } from 'camino-common/src/etape-form'
import { DemarcheTypeId, demarcheTypeIdValidator } from 'camino-common/src/static/demarchesTypes'
import { Effect, Option, pipe } from 'effect'
import { CaminoError } from 'camino-common/src/zod-tools'
import { shortCircuitError } from '../../tools/fp-tools'
import { TempDocumentName } from 'camino-common/src/document'
import { DemarcheId } from 'camino-common/src/demarche'

export const insertTitreEtapeEntrepriseDocuments = (
  pool: Pool,
  titre_etape_id: EtapeId,
  entreprise_documents: Pick<EntrepriseDocument, 'id'>[]
): Effect.Effect<true, CaminoError<EffectDbQueryAndValidateErrors>> =>
  Effect.Do.pipe(
    Effect.flatMap(() => Effect.forEach(entreprise_documents, entreprise_document => insertTitreEtapeEntrepriseDocument(pool, { titre_etape_id, entreprise_document_id: entreprise_document.id }))),
    Effect.map(() => true as const)
  )

export const insertTitreEtapeEntrepriseDocument = (
  pool: Pool,
  params: { titre_etape_id: EtapeId; entreprise_document_id: EntrepriseDocumentId }
): Effect.Effect<void[], CaminoError<EffectDbQueryAndValidateErrors>> => effectDbQueryAndValidate(insertTitreEtapeEntrepriseDocumentInternal, params, pool, z.void())

const insertTitreEtapeEntrepriseDocumentInternal = sql<Redefine<IInsertTitreEtapeEntrepriseDocumentInternalQuery, { titre_etape_id: EtapeId; entreprise_document_id: EntrepriseDocumentId }, void>>`
insert into titres_etapes_entreprises_documents (titre_etape_id, entreprise_document_id)
    values ($ titre_etape_id, $ entreprise_document_id)
`
export const deleteTitreEtapeEntrepriseDocument = (pool: Pool, params: { titre_etape_id: EtapeId }): Effect.Effect<Option.Option<never>, CaminoError<EffectDbQueryAndValidateErrors>> =>
  effectDbQueryAndValidate(deleteTitreEtapeEntrepriseDocumentInternal, params, pool, z.void()).pipe(Effect.map(() => Option.none()))

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

const erreurLargeObject = 'Impossible de créer le document en base' as const
export type UpdateEtapeDocumentsErrors = EffectDbQueryAndValidateErrors | InsertEtapeDocumentsErrors | typeof erreurLargeObject
export const updateEtapeDocuments = (
  pool: Pool,
  titre_etape_id: EtapeId,
  etapeDocuments: EtapeDocumentModification[]
): Effect.Effect<Option.Option<never>, CaminoError<UpdateEtapeDocumentsErrors>> => {
  return Effect.Do.pipe(
    Effect.bind('documentsInDb', () => effectDbQueryAndValidate(getDocumentsByEtapeIdQuery, { titre_etape_id }, pool, getDocumentsByEtapeIdQueryValidator)),
    Effect.let('etapeDocumentToUpdate', () => etapeDocuments.filter((document): document is EtapeDocumentWithFileModification => 'id' in document)),
    Effect.tap(({ etapeDocumentToUpdate }) =>
      Effect.forEach(etapeDocumentToUpdate, documentToUpdate => {
        return Effect.Do.pipe(
          Effect.map(() => documentToUpdate),
          Effect.filterOrFail(
            (document): document is EtapeDocumentWithFileModification & { temp_document_name: TempDocumentName } => isNotNullNorUndefined(document.temp_document_name),
            () => shortCircuitError('pas de document' as const)
          ),
          Effect.flatMap(document =>
            Effect.tryPromise({
              try: () => createLargeObject(pool, document.temp_document_name),
              catch: e => ({ message: erreurLargeObject, extra: e }),
            })
          ),
          Effect.tap(largeobject_id => effectDbQueryAndValidate(updateEtapeDocumentFileDb, { id: documentToUpdate.id, largeobject_id }, pool, z.void())),
          Effect.catchTag('pas de document', _ => Effect.succeed(null)),
          Effect.tap(() =>
            effectDbQueryAndValidate(
              updateEtapeDocumentInfoDb,
              { id: documentToUpdate.id, public_lecture: documentToUpdate.public_lecture, entreprises_lecture: documentToUpdate.entreprises_lecture, description: documentToUpdate.description },
              pool,
              z.void()
            )
          )
        )
      })
    ),
    Effect.tap(() => {
      const toInsertDocuments = etapeDocuments.filter((document): document is TempEtapeDocument => !('id' in document))
      if (isNotNullNorUndefinedNorEmpty(toInsertDocuments)) {
        return insertEtapeDocuments(pool, titre_etape_id, toInsertDocuments)
      }
      return Effect.succeed(null)
    }),
    Effect.tap(({ documentsInDb, etapeDocumentToUpdate }) => {
      const etapeDocumentIdsToUpdate = etapeDocumentToUpdate.map(({ id }) => id)
      const toDeleteDocuments = documentsInDb.filter(({ id }) => !etapeDocumentIdsToUpdate.includes(id))
      if (isNotNullNorUndefinedNorEmpty(toDeleteDocuments)) {
        return effectDbQueryAndValidate(deleteEtapeDocumentsDb, { ids: toDeleteDocuments.map(({ id }) => id) }, pool, z.void())
      }
      return Effect.succeed(null)
    }),
    Effect.map(() => Option.none())
  )
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

const largeObjectIdError = 'impossible de récupérer un large object id' as const
export type InsertEtapeDocumentsErrors = EffectDbQueryAndValidateErrors | typeof largeObjectIdError
export const insertEtapeDocuments = (pool: Pool, titre_etape_id: EtapeId, etapeDocuments: TempEtapeDocument[]): Effect.Effect<true, CaminoError<InsertEtapeDocumentsErrors>> => {
  return Effect.Do.pipe(
    Effect.flatMap(() =>
      Effect.forEach(etapeDocuments, document => {
        const id = newEtapeDocumentId(getCurrent(), document.etape_document_type_id)
        return pipe(
          Effect.tryPromise({
            try: () => createLargeObject(pool, document.temp_document_name),
            catch: () => ({ message: largeObjectIdError }),
          }),
          Effect.flatMap(largeobject_id => effectDbQueryAndValidate(insertEtapeDocumentDb, { ...document, etape_id: titre_etape_id, id, largeobject_id }, pool, z.void()))
        )
      })
    ),
    Effect.map(() => true)
  )
}

const insertEtapeDocumentDb = sql<
  Redefine<IInsertEtapeDocumentDbQuery, { etape_id: EtapeId; id: EtapeDocumentId; largeobject_id: LargeObjectId } & Omit<TempEtapeDocument, 'temp_document_name'>, void>
>`
insert into etapes_documents (id, etape_document_type_id, etape_id, description, public_lecture, entreprises_lecture, largeobject_id)
    values ($ id !, $ etape_document_type_id !, $ etape_id !, $ description, $ public_lecture !, $ entreprises_lecture !, $ largeobject_id !)
`
const impossibleDeCreerUnLargeObjectId = 'impossible de créer un large object id' as const
export type InsertEtapeAvisErrors = EffectDbQueryAndValidateErrors | typeof impossibleDeCreerUnLargeObjectId
export const insertEtapeAvis = (pool: Pool, titre_etape_id: EtapeId, etapeAvis: TempEtapeAvis[]): Effect.Effect<true, CaminoError<InsertEtapeAvisErrors>> =>
  Effect.Do.pipe(
    Effect.flatMap(() =>
      Effect.forEach(etapeAvis, avis => {
        const id = newEtapeAvisId(avis.avis_type_id)
        return pipe(
          Effect.tryPromise({
            try: async () => (isNotNullNorUndefined(avis.temp_document_name) ? createLargeObject(pool, avis.temp_document_name) : null),
            catch: e => ({ message: impossibleDeCreerUnLargeObjectId, extra: e }),
          }),
          Effect.flatMap(largeobject_id => insertEtapeAvisWithLargeObjectId(pool, titre_etape_id, avis, id, largeobject_id))
        )
      })
    ),
    Effect.map(() => true as const)
  )

const updateEtapeAvisFileDb = sql<Redefine<IUpdateEtapeAvisFileDbQuery, { id: EtapeAvisId; largeobject_id: LargeObjectId }, void>>`
update
    etape_avis
set
    largeobject_id = $ largeobject_id !
where
    id = $ id !
`
const updateEtapeAvisInfoDb = sql<Redefine<IUpdateEtapeAvisInfoDbQuery, Omit<EtapeAvisWithFileModification, 'has_file' | 'temp_document_name'>, void>>`
update
    etape_avis
set
    avis_statut_id = $ avis_statut_id !,
    avis_visibility_id = $ avis_visibility_id !,
    date = $ date !,
    avis_type_id = $ avis_type_id !,
    description = $ description
where
    id = $ id !
`
const deleteEtapeAvisDb = sql<Redefine<IDeleteEtapeAvisDbQuery, { ids: EtapeAvisId[] }, void>>`
delete from etape_avis
where id in $$ ids !
`
const avisIncomplets = 'Impossible de mettre à jour les avis, car ils ne sont pas complets' as const
export type UpdateEtapeAvisErrors = EffectDbQueryAndValidateErrors | typeof avisIncomplets | typeof erreurLargeObject | InsertEtapeAvisErrors
export const updateEtapeAvis = (
  pool: Pool,
  titre_etape_id: EtapeId,
  isBrouillon: EtapeBrouillon,
  etapeAvis: EtapeAvisModification[],
  etapeTypeId: EtapeTypeId,
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  demarcheId: DemarcheId,
  firstEtapeDate: FirstEtapeDate,
  communeIds: CommuneId[]
): Effect.Effect<Option.Option<never>, CaminoError<UpdateEtapeAvisErrors>> => {
  return Effect.Do.pipe(
    Effect.filterOrFail(
      () => isBrouillon === ETAPE_IS_BROUILLON || etapeAvisStepIsComplete({ typeId: etapeTypeId }, etapeAvis, titreTypeId, demarcheTypeId, demarcheId, firstEtapeDate, communeIds).valid,
      () => ({ message: avisIncomplets })
    ),
    Effect.bind('avisInDb', () => effectDbQueryAndValidate(getAvisByEtapeIdQuery, { titre_etape_id }, pool, etapeAvisDbValidator)),
    Effect.let('avisListToUpdate', () => etapeAvis.filter((avis): avis is EtapeAvisWithFileModification => 'id' in avis)),
    Effect.let('etapeDocumentIdsToUpdate', ({ avisListToUpdate }) => avisListToUpdate.map(({ id }) => id)),
    Effect.let('toDeleteAvis', ({ avisInDb, etapeDocumentIdsToUpdate }) => avisInDb.filter(({ id }) => !etapeDocumentIdsToUpdate.includes(id))),
    Effect.let('toInsertAvis', () => etapeAvis.filter((avis): avis is TempEtapeAvis => !('id' in avis))),
    Effect.tap(({ toDeleteAvis }) => {
      if (isNotNullNorUndefinedNorEmpty(toDeleteAvis)) {
        return effectDbQueryAndValidate(deleteEtapeAvisDb, { ids: toDeleteAvis.map(({ id }) => id) }, pool, z.void())
      }
      return Effect.succeed(null)
    }),
    Effect.tap(({ avisListToUpdate }) =>
      Effect.forEach(avisListToUpdate, avisToUpdate => {
        return Effect.Do.pipe(
          Effect.map(() => avisToUpdate),
          Effect.filterOrFail(
            (avis): avis is EtapeAvisWithFileModification & { temp_document_name: TempDocumentName } => isNotNullNorUndefined(avis.temp_document_name),
            () => shortCircuitError('pas de document' as const)
          ),
          Effect.flatMap(avis =>
            Effect.tryPromise({
              try: () => createLargeObject(pool, avis.temp_document_name),
              catch: e => ({ message: erreurLargeObject, extra: e }),
            })
          ),
          Effect.tap(largeobject_id => effectDbQueryAndValidate(updateEtapeAvisFileDb, { id: avisToUpdate.id, largeobject_id }, pool, z.void())),
          Effect.catchTag('pas de document', _ => Effect.succeed(null)),
          Effect.tap(() => effectDbQueryAndValidate(updateEtapeAvisInfoDb, avisToUpdate, pool, z.void()))
        )
      })
    ),
    Effect.tap(({ toInsertAvis }) => {
      if (isNotNullNorUndefinedNorEmpty(toInsertAvis)) {
        return insertEtapeAvis(pool, titre_etape_id, toInsertAvis)
      }
      return Effect.succeed(null)
    }),
    Effect.map(() => Option.none())
  )
}

// VISIBLE FOR TEST
export const insertEtapeAvisWithLargeObjectId = (
  pool: Pool,
  titre_etape_id: EtapeId,
  avis: TempEtapeAvis,
  id: EtapeAvisId,
  largeobject_id: LargeObjectId | null
): Effect.Effect<true, CaminoError<EffectDbQueryAndValidateErrors>> =>
  pipe(
    effectDbQueryAndValidate(insertEtapeAvisDb, { ...avis, etape_id: titre_etape_id, id, largeobject_id }, pool, z.void()),
    Effect.map(() => true)
  )

const insertEtapeAvisDb = sql<Redefine<IInsertEtapeAvisDbQuery, { etape_id: EtapeId; id: EtapeAvisId; largeobject_id: LargeObjectId | null } & Omit<TempEtapeAvis, 'temp_document_name'>, void>>`
insert into etape_avis (id, avis_type_id, etape_id, description, avis_statut_id, date, avis_visibility_id, largeobject_id)
    values ($ id !, $ avis_type_id !, $ etape_id !, $ description !, $ avis_statut_id !, $ date !, $ avis_visibility_id !, $ largeobject_id !)
`

const etapeDocumentLargeObjectIdValidator = z.number().brand('EtapeDocumentLargeObjectId')

const getDocumentsByEtapeIdQueryValidator = z.union([
  etapeDocumentDescriptionObligatoireValidator.extend({ largeobject_id: etapeDocumentLargeObjectIdValidator }),
  etapeDocumentDescriptionOptionnelleValidator.extend({ largeobject_id: etapeDocumentLargeObjectIdValidator }),
])
type GetDocumentsByEtapeIdQuery = z.infer<typeof getDocumentsByEtapeIdQueryValidator>

const getDocumentsByEtapeIdQuery = sql<Redefine<IGetDocumentsByEtapeIdQueryQuery, { titre_etape_id: EtapeId }, GetDocumentsByEtapeIdQuery>>`
select
    d.id,
    d.etape_document_type_id,
    d.description,
    d.public_lecture,
    d.entreprises_lecture,
    d.largeobject_id
from
    etapes_documents d
where
    d.etape_id = $ titre_etape_id !
`
export const getEtapeDocumentLargeObjectIdsByEtapeId = async (
  titre_etape_id: EtapeId,
  pool: Pool,
  user: User,
  titreTypeId: SimplePromiseFn<TitreTypeId>,
  titresAdministrationsLocales: SimplePromiseFn<AdministrationId[]>,
  entreprisesTitulairesOuAmodiataires: SimplePromiseFn<EntrepriseId[]>,
  etapeTypeId: EtapeTypeId,
  demarche: CanReadDemarche
): Promise<GetDocumentsByEtapeIdQuery[]> => {
  const result = await dbQueryAndValidate(getDocumentsByEtapeIdQuery, { titre_etape_id }, pool, getDocumentsByEtapeIdQueryValidator)

  const filteredDocuments: GetDocumentsByEtapeIdQuery[] = []

  for (const document of result) {
    if (await canReadDocument(document, user, titreTypeId, titresAdministrationsLocales, entreprisesTitulairesOuAmodiataires, etapeTypeId, demarche)) {
      filteredDocuments.push(document)
    }
  }

  return filteredDocuments
}
const etapeAvisDbValidator = z
  .discriminatedUnion('avis_type_id', [regularEtapeAvisValidator.pick({ avis_type_id: true, description: true }), autreEtapeAvisValidator.pick({ avis_type_id: true, description: true })])
  .and(
    z.object({
      id: etapeAvisIdValidator,
      avis_statut_id: avisStatutIdValidator,
      largeobject_id: largeObjectIdValidator.nullable(),
      date: caminoDateValidator,
      avis_visibility_id: avisVisibilityIdValidator,
    })
  )
type EtapeAvisDb = z.infer<typeof etapeAvisDbValidator>
const getAvisByEtapeIdQuery = sql<Redefine<IGetAvisByEtapeIdQueryQuery, { titre_etape_id: EtapeId }, EtapeAvisDb>>`
select
    a.id,
    a.description,
    a.avis_type_id,
    a.avis_statut_id,
    a.largeobject_id,
    a.date,
    a.avis_visibility_id
from
    etape_avis a
where
    a.etape_id = $ titre_etape_id !
`
export const getEtapeAvisLargeObjectIdsByEtapeId = async (
  titre_etape_id: EtapeId,
  pool: Pool,
  user: User,
  titreTypeId: SimplePromiseFn<TitreTypeId>,
  titresAdministrationsLocales: SimplePromiseFn<AdministrationId[]>,
  entreprisesTitulairesOuAmodiataires: SimplePromiseFn<EntrepriseId[]>,
  etapeTypeId: EtapeTypeId,
  demarche: CanReadDemarche
): Promise<EtapeAvisDb[]> => {
  const result = await dbQueryAndValidate(getAvisByEtapeIdQuery, { titre_etape_id }, pool, etapeAvisDbValidator)

  const filteredAvis: EtapeAvisDb[] = []

  for (const avis of result) {
    if (await canReadAvis(avis, user, titreTypeId, titresAdministrationsLocales, entreprisesTitulairesOuAmodiataires, etapeTypeId, demarche)) {
      filteredAvis.push(avis)
    }
  }

  return filteredAvis
}
const loidByEtapeAvisIdValidator = z.object({
  largeobject_id: largeObjectIdValidator,
  etape_id: etapeIdValidator,
  avis_visibility_id: avisVisibilityIdValidator,
})
export const getLargeobjectIdByEtapeAvisId = async (pool: Pool, user: User, etapeAvisId: EtapeAvisId): Promise<LargeObjectId | null> => {
  const result = await dbQueryAndValidate(
    getLargeobjectIdByEtapeAvisIdInternal,
    {
      etapeAvisId,
    },
    pool,
    loidByEtapeAvisIdValidator
  )

  if (result.length === 1) {
    const etapeAvis = result[0]
    const { etapeData, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires } = await getEtapeDataForEdition(pool, etapeAvis.etape_id)

    if (
      await canReadAvis(etapeAvis, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, etapeData.etape_type_id, {
        demarche_type_id: etapeData.demarche_type_id,
        entreprises_lecture: etapeData.demarche_entreprises_lecture,
        public_lecture: etapeData.demarche_public_lecture,
        titre_public_lecture: etapeData.titre_public_lecture,
      })
    ) {
      return etapeAvis.largeobject_id
    }
  }

  return null
}
const getLargeobjectIdByEtapeAvisIdInternal = sql<Redefine<IGetLargeobjectIdByEtapeAvisIdInternalQuery, { etapeAvisId: EtapeAvisId }, z.infer<typeof loidByEtapeAvisIdValidator>>>`
select
    d.largeobject_id,
    d.etape_id,
    d.avis_visibility_id
from
    etape_avis d
where
    d.id = $ etapeAvisId !
LIMIT 1
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
  const result = await getEtapeDocumentLargeObjectIdsByEtapeId(titre_etape_id, pool, user, titreTypeId, titresAdministrationsLocales, entreprisesTitulairesOuAmodiataires, etapeTypeId, demarche)

  return z.array(etapeDocumentValidator).parse(result)
}

const getEtapesWithAutomaticStatutValidator = z.object({
  id: etapeIdValidator,
  type_id: etapeTypeIdValidator,
  date: caminoDateValidator,
  etape_statut_id: etapeStatutIdValidator,
  contenu: contenuValidator,
  heritage_contenu: heritageContenuValidator,
  titre_type_id: titreTypeIdValidator,
  demarche_type_id: demarcheTypeIdValidator,
})

type GetEtapesWithAutomaticStatutQuery = z.infer<typeof getEtapesWithAutomaticStatutValidator>
export const getEtapesWithAutomaticStatut = async (pool: Pool): Promise<GetEtapesWithAutomaticStatutQuery[]> => {
  return dbQueryAndValidate(getEtapesWithAutomaticStatutDb, { etapeWithAutomaticStatuts: ETAPES_WITH_AUTOMATIC_STATUTS }, pool, getEtapesWithAutomaticStatutValidator)
}

const getEtapesWithAutomaticStatutDb = sql<Redefine<IGetEtapesWithAutomaticStatutDbQuery, { etapeWithAutomaticStatuts: Readonly<EtapeTypeId[]> }, GetEtapesWithAutomaticStatutQuery>>`
  select
    te.id,
    te.type_id,
    te.contenu,
    te.heritage_contenu,
    te.statut_id as etape_statut_id,
    te.date,
    t.type_id as titre_type_id,
    td.type_id as demarche_type_id
  from titres_etapes te
  join titres_demarches td on te.titre_demarche_id = td.id
  join titres t on td.titre_id = t.id
  where
  te.type_id = ANY($etapeWithAutomaticStatuts!) and
  te.archive is false and
  td.archive is false and
  t.archive is false
  `

export const updateEtapeStatut = async (pool: Pool, etapeId: EtapeId, newStatut: EtapeStatutId): Promise<void> => {
  await dbQueryAndValidate(updateEtapeStatutDb, { etapeId, newStatut }, pool, z.void())
}

const updateEtapeStatutDb = sql<Redefine<IUpdateEtapeStatutDbQuery, { newStatut: EtapeStatutId; etapeId: EtapeId }, void>>`
  UPDATE titres_etapes SET statut_id = $ newStatut ! where id = $ etapeId !
`

export const updateEtapeFondamentaleId = (pool: Pool, etapeId: EtapeId, etapeFondamentaleId: EtapeId): Effect.Effect<true, CaminoError<EffectDbQueryAndValidateErrors>> =>
  effectDbQueryAndValidate(updateEtapeFondamentaleIdDb, { etapeId, etapeFondamentaleId }, pool, z.void()).pipe(Effect.map(() => true))

const updateEtapeFondamentaleIdDb = sql<Redefine<IUpdateEtapeFondamentaleIdDbQuery, { etapeFondamentaleId: EtapeId; etapeId: EtapeId }, void>>`
  UPDATE titres_etapes SET etape_fondamentale_id = $ etapeFondamentaleId ! where id = $ etapeId !
`
