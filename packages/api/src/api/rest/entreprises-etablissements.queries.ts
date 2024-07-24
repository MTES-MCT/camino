/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { Redefine, dbQueryAndValidate } from '../../pg-database'
import { IGetEntrepriseEtablissementsDbQuery } from './entreprises-etablissements.queries.types'
import { EntrepriseId, entrepriseEtablissementValidator } from 'camino-common/src/entreprise'
import { Pool } from 'pg'
import { z } from 'zod'

type GetEntrepriseEtablissement = z.infer<typeof entrepriseEtablissementValidator>

export const getEntrepriseEtablissements = async (pool: Pool, entreprise_id: EntrepriseId): Promise<GetEntrepriseEtablissement[] | null> => {
  return dbQueryAndValidate(getEntrepriseEtablissementsDb, { entreprise_id }, pool, entrepriseEtablissementValidator)
}

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
