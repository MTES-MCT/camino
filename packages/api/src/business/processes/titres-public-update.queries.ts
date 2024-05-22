/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { Pool } from 'pg'
import { z } from 'zod'
import { TitreId, titreIdValidator } from 'camino-common/src/validators/titres.js'
import { IGetTitrePublicUpdateDataDbQuery, IUpdateTitrePublicLectureDbQuery } from './titres-public-update.queries.types.js'
import { titreTypeIdValidator } from 'camino-common/src/static/titresTypes.js'
import { titreStatutIdValidator } from 'camino-common/src/static/titresStatuts.js'
import { NonEmptyArray } from 'camino-common/src/typescript-tools.js'

const getTitrePublicUpdateDataDbValidator = z.object({
  titre_type_id: titreTypeIdValidator,
  titre_statut_id: titreStatutIdValidator,
  id: titreIdValidator,
  public_lecture: z.boolean(),
  has_demarche_public: z
    .boolean()
    .nullable()
    .transform(v => (v === null ? false : v)),
})

export const getTitrePublicUpdateData = async (pool: Pool, titreIds: NonEmptyArray<TitreId> | null) => {
  return dbQueryAndValidate(getTitrePublicUpdateDataDb, { titreIds: titreIds ?? (['all'] as const) }, pool, getTitrePublicUpdateDataDbValidator)
}

const getTitrePublicUpdateDataDb = sql<Redefine<IGetTitrePublicUpdateDataDbQuery, { titreIds: NonEmptyArray<TitreId> | Readonly<['all']> }, z.infer<typeof getTitrePublicUpdateDataDbValidator>>>`
select
    titre.id,
    titre.public_lecture,
    titre.type_id as titre_type_id,
    titre_statut_id,
    d.public_lecture as has_demarche_public
from
    titres titre
    left join titres_demarches d on (d.titre_id = titre.id
            and d.public_lecture is true
            and d.archive is false)
where ('all' in $$ titreIds
    OR titre.id in $$ titreIds)
and titre.archive is false
`

export const updateTitrePublicLecture = async (pool: Pool, titreId: TitreId, publicLecture: boolean) => dbQueryAndValidate(updateTitrePublicLectureDb, { titreId, publicLecture }, pool, z.void())

const updateTitrePublicLectureDb = sql<
  Redefine<IUpdateTitrePublicLectureDbQuery, { titreId: TitreId; publicLecture: boolean }, void>
>`update titres set public_lecture = $publicLecture! where id = $titreId!`
