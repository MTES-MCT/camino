import { sql } from '@pgtyped/runtime'
import { EffectDbQueryAndValidateErrors, Redefine, effectDbQueryAndValidate } from '../../pg-database'
import { IGetEntrepriseEtablissementsDbQuery } from './entreprises-etablissements.queries.types'
import { EntrepriseId, entrepriseEtablissementValidator } from 'camino-common/src/entreprise'
import { Pool } from 'pg'
import { z } from 'zod'
import { Effect } from 'effect'
import { CaminoError } from 'camino-common/src/zod-tools'

type GetEntrepriseEtablissement = z.infer<typeof entrepriseEtablissementValidator>

export const getEntrepriseEtablissements = (pool: Pool, entreprise_id: EntrepriseId): Effect.Effect<GetEntrepriseEtablissement[] | null, CaminoError<EffectDbQueryAndValidateErrors>> =>
  effectDbQueryAndValidate(getEntrepriseEtablissementsDb, { entreprise_id }, pool, entrepriseEtablissementValidator)

const getEntrepriseEtablissementsDb = sql<Redefine<IGetEntrepriseEtablissementsDbQuery, { entreprise_id: EntrepriseId }, GetEntrepriseEtablissement>>`
select
    id,
    date_debut,
    date_fin,
    nom
from
    entreprises_etablissements
where
    entreprise_id = $ entreprise_id !
`
