/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { TitreGet, TitreId, titreGetValidator } from 'camino-common/src/titres.js'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import {
  IGetAdministrationsLocalesByTitreIdDbQuery,
  IGetLastJournalInternalQuery,
  IGetTitreCommunesInternalQuery,
  IGetTitreInternalQuery,
  IGetTitreTypeIdByTitreIdDbQuery,
  IGetTitulairesAmodiatairesByTitreIdDbQuery,
} from './titres.queries.types.js'
import { caminoDateValidator } from 'camino-common/src/date.js'
import { z } from 'zod'
import { Commune, communeValidator } from 'camino-common/src/static/communes.js'
import { Pool } from 'pg'
import { titreTypeIdValidator } from 'camino-common/src/static/titresTypes.js'
import { administrationIdValidator } from 'camino-common/src/static/administrations.js'
import { entrepriseIdValidator } from 'camino-common/src/entreprise.js'

export const getTitre = async (pool: Pool, params: { id: TitreId }) => dbQueryAndValidate(getTitreInternal, params, pool, titreGetValidator)

const getTitreInternal = sql<Redefine<IGetTitreInternalQuery, { id: TitreId }, TitreGet>>`
select
    t.id,
    t.nom,
    t.slug,
    t.titre_statut_id,
    t.type_id,
    coalesce(te.administrations_locales, '[]'::jsonb) as administrations_locales
from
    titres t
    left join titres_etapes te on (te.id = t.props_titre_etapes_ids ->> 'points')
where
    t.id = $ id
LIMIT 1
`

export const lastJournalGetValidator = z.object({ date: caminoDateValidator })
type LastJournalGet = z.infer<typeof lastJournalGetValidator>

export const getLastJournal = async (pool: Pool, params: { titreId: TitreId }) => dbQueryAndValidate(getLastJournalInternal, params, pool, lastJournalGetValidator)

const getLastJournalInternal = sql<Redefine<IGetLastJournalInternalQuery, { titreId: TitreId }, LastJournalGet>>`
select
    to_date(date::text, 'yyyy-mm-dd')::text as date
from
    journaux
where
    titre_id = $ titreId
order by
    date desc
LIMIT 1
`

export const getTitreCommunes = async (pool: Pool, params: { id: TitreId }) => dbQueryAndValidate(getTitreCommunesInternal, params, pool, communeValidator)

const getTitreCommunesInternal = sql<Redefine<IGetTitreCommunesInternalQuery, { id: TitreId }, Commune>>`
select
    c.id,
    c.nom
from
    titres t
    join titres_etapes te on te.id = t.props_titre_etapes_ids ->> 'points'
    join jsonb_array_elements(te.communes) as etapes_communes on true
    join communes c on c.id = etapes_communes ->> 'id'
where
    t.id = $ id
`

export const getTitreTypeIdByTitreIdQuery = async (titreId: TitreId, pool: Pool) => {
  const typeIds = await dbQueryAndValidate(getTitreTypeIdByTitreIdDb, { titreId }, pool, titreTypeIdObjectValidator)
  if (typeIds.length === 0) {
    throw new Error(`Pas de type de titre trouvé pour le titre '${titreId}'`)
  }

  return typeIds[0].titre_type_id
}

export const titreTypeIdObjectValidator = z.object({ titre_type_id: titreTypeIdValidator })
const getTitreTypeIdByTitreIdDb = sql<Redefine<IGetTitreTypeIdByTitreIdDbQuery, { titreId: TitreId }, z.infer<typeof titreTypeIdObjectValidator>>>`
select
    t.type_id as titre_type_id
from
    titres t
where
    t.id = $ titreId !
`

export const getAdministrationsLocalesByTitreIdQuery = async (titreId: TitreId, pool: Pool) => {
  const admins = await dbQueryAndValidate(getAdministrationsLocalesByTitreIdDb, { titreId }, pool, administrationsLocalesValidator)
  if (admins.length > 1) {
    throw new Error(`Trop d'administrations locales trouvées pour l'activité ${titreId}`)
  }
  if (admins.length === 0) {
    return []
  }

  return admins[0].administrations_locales
}

export const administrationsLocalesValidator = z.object({ administrations_locales: z.array(administrationIdValidator) })

const getAdministrationsLocalesByTitreIdDb = sql<Redefine<IGetAdministrationsLocalesByTitreIdDbQuery, { titreId: TitreId }, z.infer<typeof administrationsLocalesValidator>>>`
select
    te.administrations_locales
from
    titres t
    left join titres_etapes te on te.id = t.props_titre_etapes_ids ->> 'points'
where
    t.id = $ titreId !
`

export const getTitulairesAmodiatairesByTitreIdQuery = async (titreId: TitreId, pool: Pool) => {
  const entreprises = await dbQueryAndValidate(getTitulairesAmodiatairesByTitreIdDb, { titreId }, pool, entrepriseIdObjectValidator)

  return entreprises.map(({ id }) => id)
}

export const entrepriseIdObjectValidator = z.object({ id: entrepriseIdValidator })
const getTitulairesAmodiatairesByTitreIdDb = sql<Redefine<IGetTitulairesAmodiatairesByTitreIdDbQuery, { titreId: TitreId }, z.infer<typeof entrepriseIdObjectValidator>>>`
select distinct
    e.id
from
    entreprises e,
    titres t
    left join titres_titulaires tt on tt.titre_etape_id = t.props_titre_etapes_ids ->> 'titulaires'
    left join titres_amodiataires tta on tta.titre_etape_id = t.props_titre_etapes_ids ->> 'amodiataires'
where
    t.id = $ titreId !
    and (tt.entreprise_id = e.id
        or tta.entreprise_id = e.id)
`
