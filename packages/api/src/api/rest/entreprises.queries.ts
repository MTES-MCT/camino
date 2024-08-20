import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../pg-database'
import {
  ICheckEntreprisesExistQueryQuery,
  IDeleteEntrepriseDocumentQueryQuery,
  IGetEntrepriseDbQuery,
  IGetEntrepriseDocumentsInternalQuery,
  IGetEntrepriseUtilisateursDbQuery,
  IGetEntreprisesDbQuery,
  IGetLargeobjectIdByEntrepriseDocumentIdInternalQuery,
  IInsertEntrepriseDocumentInternalQuery,
} from './entreprises.queries.types'
import {
  EntrepriseDocument,
  EntrepriseDocumentId,
  EntrepriseId,
  entrepriseDocumentIdValidator,
  entrepriseDocumentValidator,
  entrepriseIdValidator,
  entrepriseValidator,
} from 'camino-common/src/entreprise'
import { EntrepriseDocumentTypeId } from 'camino-common/src/static/documentsTypes'
import { CaminoDate } from 'camino-common/src/date'
import { DeepReadonly, NonEmptyArray, isNonEmptyArray, onlyUnique } from 'camino-common/src/typescript-tools'
import { Pool } from 'pg'
import { canSeeEntrepriseDocuments } from 'camino-common/src/permissions/entreprises'
import { roleValidator, User } from 'camino-common/src/roles'
import { z } from 'zod'

const dummy = ['dummy'] as const
export const getEntrepriseDocuments = async (entrepriseDocumentIds: EntrepriseDocumentId[], entrepriseIds: EntrepriseId[], pool: Pool, user: User) => {
  const result = await dbQueryAndValidate(
    getEntrepriseDocumentsInternal,
    {
      entrepriseDocumentIds: isNonEmptyArray(entrepriseDocumentIds) ? entrepriseDocumentIds : dummy,
      entrepriseIds: isNonEmptyArray(entrepriseIds) ? entrepriseIds : dummy,
    },
    pool,
    entrepriseDocumentValidator
  )

  return result.filter(r => canSeeEntrepriseDocuments(user, r.entreprise_id))
}

const getEntrepriseDocumentsInternal = sql<
  Redefine<
    IGetEntrepriseDocumentsInternalQuery,
    { entrepriseDocumentIds: NonEmptyArray<EntrepriseDocumentId> | typeof dummy; entrepriseIds: NonEmptyArray<EntrepriseId> | typeof dummy },
    EntrepriseDocument
  >
>`
select
    d.id,
    d.description,
    d.date,
    d.entreprise_document_type_id,
    d.entreprise_id,
    not exists (
        select
            *
        from
            titres_etapes_entreprises_documents tej
        where
            tej.entreprise_document_id = d.id) as can_delete_document
from
    entreprises_documents d
where ('dummy' in $$ entrepriseDocumentIds
    OR d.id in $$ entrepriseDocumentIds)
AND ('dummy' in $$ entrepriseIds
    OR d.entreprise_id in $$ entrepriseIds)
`

export const entrepriseDocumentLargeObjectIdValidator = z.number().brand('EntrepriseDocumentLargeObjectId')
type EntrepriseDocumentLargeObjectId = z.infer<typeof entrepriseDocumentLargeObjectIdValidator>
const loidByEntrepriseDocumentIdValidator = z.object({ largeobject_id: entrepriseDocumentLargeObjectIdValidator, entreprise_id: entrepriseIdValidator })

export const getLargeobjectIdByEntrepriseDocumentId = async (entrepriseDocumentId: EntrepriseDocumentId, pool: Pool, user: User): Promise<EntrepriseDocumentLargeObjectId | null> => {
  const result = await dbQueryAndValidate(
    getLargeobjectIdByEntrepriseDocumentIdInternal,
    {
      entrepriseDocumentId,
    },
    pool,
    loidByEntrepriseDocumentIdValidator
  )

  if (result.length === 1 && canSeeEntrepriseDocuments(user, result[0].entreprise_id)) {
    return result[0].largeobject_id
  }

  return null
}
const getLargeobjectIdByEntrepriseDocumentIdInternal = sql<
  Redefine<IGetLargeobjectIdByEntrepriseDocumentIdInternalQuery, { entrepriseDocumentId: EntrepriseDocumentId }, z.infer<typeof loidByEntrepriseDocumentIdValidator>>
>`
select
    d.largeobject_id,
    d.entreprise_id
from
    entreprises_documents d
where
    d.id = $ entrepriseDocumentId !
LIMIT 1
`

export const insertEntrepriseDocument = async (
  pool: Pool,
  params: {
    id: EntrepriseDocumentId
    entreprise_document_type_id: EntrepriseDocumentTypeId
    date: CaminoDate
    entreprise_id: EntrepriseId
    description: string
    largeobject_id: number
  }
) => dbQueryAndValidate(insertEntrepriseDocumentInternal, params, pool, z.object({ id: entrepriseDocumentIdValidator }))
const insertEntrepriseDocumentInternal = sql<
  Redefine<
    IInsertEntrepriseDocumentInternalQuery,
    {
      id: EntrepriseDocumentId
      entreprise_document_type_id: EntrepriseDocumentTypeId
      date: CaminoDate
      entreprise_id: EntrepriseId
      description: string
      largeobject_id: number
    },
    { id: EntrepriseDocumentId }
  >
>`
insert into entreprises_documents (id, entreprise_document_type_id, date, entreprise_id, description, largeobject_id)
    values ($ id, $ entreprise_document_type_id, $ date, $ entreprise_id, $ description, $ largeobject_id !)
RETURNING
    id;
`

export const deleteEntrepriseDocument = async (pool: Pool, params: { id: EntrepriseDocumentId; entrepriseId: EntrepriseId }) =>
  dbQueryAndValidate(deleteEntrepriseDocumentQuery, params, pool, z.void())
const deleteEntrepriseDocumentQuery = sql<Redefine<IDeleteEntrepriseDocumentQueryQuery, { id: EntrepriseDocumentId; entrepriseId: EntrepriseId }, void>>`
delete from entreprises_documents
where id = $ id
    and entreprise_id = $ entrepriseId !
`

// TODO 2024-04-25 supprimer archive de la table entreprises et mettre un autocomplete pour sélectionner le titulaire lors de la création d’un titre
const getEntreprisesValidor = entrepriseValidator.extend({
  adresse: z.string().nullable(),
  legal_etranger: z.string().nullable(),
  code_postal: z.string().nullable(),
  commune: z.string().nullable(),
  categorie: z.string().nullable(),
})
const getEntrepriseValidor = getEntreprisesValidor.extend({
  telephone: z.string().nullable(),
  email: z.string().nullable(),
  url: z.string().nullable(),
  legal_forme: z.string().nullable(),
  archive: z.boolean(),
})

export type GetEntreprises = z.infer<typeof getEntreprisesValidor>
type GetEntreprise = z.infer<typeof getEntrepriseValidor>

export const getEntreprise = async (pool: Pool, entreprise_id: EntrepriseId): Promise<GetEntreprise | null> => {
  const result = await dbQueryAndValidate(getEntrepriseDb, { entreprise_id }, pool, getEntrepriseValidor)
  if (result.length === 1) {
    return result[0]
  }

  return null
}

const getEntrepriseDb = sql<Redefine<IGetEntrepriseDbQuery, { entreprise_id: EntrepriseId }, GetEntreprise>>`
select
    id,
    nom,
    legal_siren,
    adresse,
    legal_etranger,
    code_postal,
    commune,
    categorie,
    telephone,
    email,
    url,
    legal_forme,
    archive
from
    entreprises
where
    id = $ entreprise_id !
`

export const getEntreprises = async (pool: Pool): Promise<GetEntreprises[]> => {
  return dbQueryAndValidate(getEntreprisesDb, undefined, pool, getEntreprisesValidor)
}

const getEntreprisesDb = sql<Redefine<IGetEntreprisesDbQuery, void, GetEntreprises>>`
select
    id,
    nom,
    legal_siren,
    adresse,
    legal_etranger,
    code_postal,
    commune,
    categorie
from
    entreprises
order by
    nom
`

const getEntrepriseUtilisateursValidator = z.object({
  email: z.string().nullable(),
  role: roleValidator,
})
export type GetEntrepriseUtilisateurs = z.infer<typeof getEntrepriseUtilisateursValidator>
export const getEntrepriseUtilisateurs = async (pool: Pool, entreprise_id: EntrepriseId) => {
  return dbQueryAndValidate(getEntrepriseUtilisateursDb, { entreprise_id }, pool, getEntrepriseUtilisateursValidator)
}

const getEntrepriseUtilisateursDb = sql<Redefine<IGetEntrepriseUtilisateursDbQuery, { entreprise_id: EntrepriseId }, GetEntrepriseUtilisateurs>>`
select
    u.email,
    u.role
from
    utilisateurs__entreprises ue
    join utilisateurs u on u.id = ue.utilisateur_id
where
    ue.entreprise_id = $ entreprise_id !
`

const checkEntreprisesExistValidator = z.object({ id: entrepriseIdValidator })
export const checkEntreprisesExist = async (pool: Pool, entrepriseIds: DeepReadonly<EntrepriseId[]>): Promise<boolean> => {
  if (entrepriseIds.length === 0) {
    return true
  }

  const unique = [...entrepriseIds].filter(onlyUnique)
  const result = await dbQueryAndValidate(checkEntreprisesExistQuery, { entrepriseIds: unique }, pool, checkEntreprisesExistValidator)

  return result.length === unique.length
}

const checkEntreprisesExistQuery = sql<Redefine<ICheckEntreprisesExistQueryQuery, { entrepriseIds: EntrepriseId[] }, z.infer<typeof checkEntreprisesExistValidator>>>`
SELECT
    id
FROM
    entreprises
WHERE
    id IN $$ entrepriseIds
`
