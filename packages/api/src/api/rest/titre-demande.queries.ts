/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { DbQueryAccessError, Redefine, effectDbQueryAndValidate } from '../../pg-database.js'
import { z } from 'zod'
import { Pool } from 'pg'
import { User } from 'camino-common/src/roles.js'
import { canCreateTitre } from 'camino-common/src/permissions/titres.js'
import { TitreId, TitreSlug } from 'camino-common/src/validators/titres.js'
import { Effect } from 'effect'
import { ZodUnparseable } from '../../tools/fp-tools.js'
import { newDemarcheId, newDemarcheSlug, newTitreId, newTitreSlug } from '../../database/models/_format/id-create.js'
import { CaminoError } from 'camino-common/src/zod-tools.js'
import { ICreateTitreDemarcheInternalQuery, ICreateTitreInternalQuery } from './titre-demande.queries.types.js'
import { TitreDemande } from 'camino-common/src/titres.js'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'
import { DemarcheId, DemarcheSlug } from 'camino-common/src/demarche.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'

type CreateTitreInput = Omit<TitreDemande, 'titreFromIds' | 'entrepriseId'>

const creationTitreImpossible = 'Création du titre impossible' as const
export type CreateTitreErrors = DbQueryAccessError | ZodUnparseable | 'Accès interdit' | typeof creationTitreImpossible
export const createTitre = (pool: Pool, user: DeepReadonly<User>, titreInput: DeepReadonly<CreateTitreInput>): Effect.Effect<TitreId, CaminoError<CreateTitreErrors>> =>
  Effect.Do.pipe(
    Effect.filterOrFail(
      () => canCreateTitre(user, titreInput.titreTypeId),
      () => ({ message: 'Accès interdit' as const })
    ),
    Effect.bind('id', () => Effect.succeed(newTitreId())),
    Effect.bind('slug', () =>
      Effect.try({
        try: () => newTitreSlug(titreInput.titreTypeId, titreInput.nom),
        catch: unknown => ({ message: creationTitreImpossible, extra: unknown }),
      })
    ),
    Effect.bind('result', ({ id, slug }) => {
      return effectDbQueryAndValidate(createTitreInternal, { ...titreInput, id, slug, references: JSON.stringify(titreInput.references) }, pool, z.void())
    }),
    Effect.map(({ id }) => id)
  )

const createTitreInternal = sql<Redefine<ICreateTitreInternalQuery, DeepReadonly<{ id: TitreId; slug: TitreSlug; references: string } & Omit<CreateTitreInput, 'references'>>, void>>`
INSERT INTO titres (id, slug, nom, type_id, "references")
    VALUES ($ id !, $slug!, $ nom !, $ titreTypeId!, $references!)
`

const creationDemarcheImpossible = 'Création de la démarche impossible' as const
export type CreateDemarcheErrors = DbQueryAccessError | ZodUnparseable | 'Accès interdit' | typeof creationDemarcheImpossible
export const createDemarche = (pool: Pool, titreId: TitreId, demarcheTypeId: DemarcheTypeId): Effect.Effect<DemarcheId, CaminoError<CreateDemarcheErrors>> => {
  return Effect.Do.pipe(
    Effect.bind('id', () => Effect.succeed(newDemarcheId())),
    Effect.bind('slug', () =>
      Effect.try({
        try: () => newDemarcheSlug(titreId, demarcheTypeId),
        catch: unknown => ({ message: creationDemarcheImpossible, extra: unknown }),
      })
    ),
    Effect.bind('result', ({ id, slug }) => {
      return effectDbQueryAndValidate(createTitreDemarcheInternal, { id, slug, titre_id: titreId, demarcheTypeId }, pool, z.void())
    }),
    Effect.map(({ id }) => id)
  )
}
const createTitreDemarcheInternal = sql<Redefine<ICreateTitreDemarcheInternalQuery, DeepReadonly<{ id: DemarcheId; slug: DemarcheSlug; titre_id: TitreId; demarcheTypeId: DemarcheTypeId }>, void>>`
INSERT INTO titres_demarches (id, slug, titre_id, type_id)
    VALUES ($ id !, $slug!, $ titre_id !, $demarcheTypeId)
`
