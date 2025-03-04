import { sql } from '@pgtyped/runtime'
import { EffectDbQueryAndValidateErrors, Redefine, effectDbQueryAndValidate } from '../../pg-database'
import { IGetTitresWithBrouillonsDbQuery, IGetTitreUtilisateurDbQuery } from './titres-utilisateurs.queries.types'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { Pool } from 'pg'
import { z } from 'zod'
import { TitreId, titreIdValidator } from 'camino-common/src/validators/titres'
import { isSuper, User, UtilisateurId, utilisateurIdValidator } from 'camino-common/src/roles'
import { Effect, pipe } from 'effect'
import { CaminoError } from 'camino-common/src/zod-tools'
import { SuperTitre, superTitreValidator } from 'camino-common/src/titres'
export const accesSuperSeulementError = 'Seuls les super peuvent accéder à ces données' as const

export type GetTitresWithBrouillonsErrors = EffectDbQueryAndValidateErrors | typeof accesSuperSeulementError
export const getTitresWithBrouillons = (pool: Pool, user: User): Effect.Effect<SuperTitre[], CaminoError<GetTitresWithBrouillonsErrors>> =>
  Effect.Do.pipe(
    Effect.filterOrFail(
      () => isSuper(user),
      () => ({ message: accesSuperSeulementError })
    ),
    Effect.flatMap(() => effectDbQueryAndValidate(getTitresWithBrouillonsDb, {}, pool, superTitreValidator))
  )

// FIXME pour demain, remonter le type d'étape en brouillon et la démarche ID pour avoir un lien vers la démarche plutôt que vers le titre et le type de démarche
// Tests intégration + tests storybook
const getTitresWithBrouillonsDb = sql<Redefine<IGetTitresWithBrouillonsDbQuery, {}, z.infer<typeof superTitreValidator>>>`
select
    t.nom as titre_nom,
    t.slug as titre_slug,
    t.type_id as titre_type_id,
    t.titre_statut_id,
    td.type_id as demarche_type_id,
    td.slug as demarche_slug,
    te.type_id as etape_type_id,
    te.slug as etape_slug,
    te.date as etape_date
from
  titres t
  join titres_demarches td on td.titre_id=t.id
  join titres_etapes te on te.titre_demarche_id=td.id

where
    t.archive is false
    and td.archive is false
    and te.archive is false
    and te.is_brouillon

order by te.date asc
`

export const getTitreUtilisateur = (pool: Pool, titreId: TitreId, userId: UtilisateurId): Effect.Effect<boolean, CaminoError<EffectDbQueryAndValidateErrors>> =>
  pipe(
    effectDbQueryAndValidate(getTitreUtilisateurDb, { titreId, userId }, pool, getTitreUtilisateurDbValidator),
    Effect.map(value => isNotNullNorUndefinedNorEmpty(value))
  )

const getTitreUtilisateurDbValidator = z.object({ utilisateur_id: utilisateurIdValidator, titre_id: titreIdValidator })
const getTitreUtilisateurDb = sql<Redefine<IGetTitreUtilisateurDbQuery, { titreId: TitreId; userId: UtilisateurId }, z.infer<typeof getTitreUtilisateurDbValidator>>>`
select
    utilisateur_id,
    titre_id
from
    utilisateurs__titres
where
    utilisateur_id = $ userId !
    and titre_id = $ titreId !
`
