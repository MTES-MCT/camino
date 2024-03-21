/* eslint-disable no-restricted-syntax */
import { EtapeId, EtapeIdOrSlug, etapeIdValidator } from 'camino-common/src/etape.js'
import { etapeTypeIdValidator } from 'camino-common/src/static/etapesTypes.js'
import { Pool } from 'pg'
import { z } from 'zod'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { sql } from '@pgtyped/runtime'
import { IGetAdministrationsLocalesByEtapeIdQuery, IGetEtapeByIdDbQuery, IGetEtapeDataForEditionDbQuery, IGetEtapeDocumentsDbQuery, IGetTitulairesAmodiatairesTitreEtapeQuery } from './etapes.queries.types.js'
import { demarcheIdValidator } from 'camino-common/src/demarche.js'
import { sdomZoneIdValidator } from 'camino-common/src/static/sdom.js'
import { multiPolygonValidator } from 'camino-common/src/perimetre.js'
import { documentTypeIdValidator } from 'camino-common/src/static/documentsTypes.js'
import { etapeDocumentIdValidator } from 'camino-common/src/etape.js'
import { IGetTitresModifiesByMonthDbQuery } from './journal.queries.types.js'
import { demarcheTypeIdValidator } from 'camino-common/src/static/demarchesTypes.js'
import { titreTypeIdValidator } from 'camino-common/src/static/titresTypes.js'
import { AdministrationId, administrationIdValidator } from 'camino-common/src/static/administrations.js'
import { EntrepriseId, entrepriseIdValidator } from 'camino-common/src/entreprise.js'

const getEtapeByIdValidator = z.object({
  etape_id: etapeIdValidator,
  etape_type_id: etapeTypeIdValidator,
  demarche_id: demarcheIdValidator,
  geojson4326_perimetre: multiPolygonValidator.nullable(),
  sdom_zones: z.array(sdomZoneIdValidator).nullable(),
})
type GetEtapeByIdValidator = z.infer<typeof getEtapeByIdValidator>

export const getEtapeById = async (pool: Pool, etapeId: EtapeIdOrSlug): Promise<z.infer<typeof getEtapeByIdValidator>> => {
  return (await dbQueryAndValidate(getEtapeByIdDb, { etapeId }, pool, getEtapeByIdValidator))[0]
}

const getEtapeByIdDb = sql<Redefine<IGetEtapeByIdDbQuery, { etapeId: EtapeIdOrSlug }, GetEtapeByIdValidator>>`
select
    id as etape_id,
    type_id as etape_type_id,
    titre_demarche_id as demarche_id,
    ST_AsGeoJSON (geojson4326_perimetre, 40)::json as geojson4326_perimetre,
    sdom_zones
from
    titres_etapes
where (id = $ etapeId !
    or slug = $ etapeId !)
and archive is false
`


const etapeDocumentValidator = z.object({
  id: etapeDocumentIdValidator,
  description: z.string(),
  etape_id: etapeIdValidator,
  etape_document_type_id: documentTypeIdValidator
})

type EtapeDocument = z.infer<typeof etapeDocumentValidator>
export const getEtapeDocuments = async (pool: Pool): Promise<EtapeDocument[]> => {
  return dbQueryAndValidate(
    getEtapeDocumentsDb,
    undefined,
    pool,
    etapeDocumentValidator
  )
}

const getEtapeDocumentsDb = sql<Redefine<IGetEtapeDocumentsDbQuery, undefined, EtapeDocument>>`
select
    d.id,
    d.description,
    d.etape_id,
    d.etape_document_type_id
from
    etapes_documents d
`


export const getEtapeDataForEdition = async (pool: Pool, etapeId: EtapeId) => {
  return (await dbQueryAndValidate(getEtapeDataForEditionDb, { etapeId }, pool, getEtapeDataForEditionValidator))[0]
}

const getEtapeDataForEditionValidator = z.object({
  etape_type_id: etapeTypeIdValidator,
  demarche_type_id: demarcheTypeIdValidator,
  titre_type_id: titreTypeIdValidator,
  demarche_public_lecture: z.boolean(),
  demarche_entreprises_lecture: z.boolean(),
  titre_public_lecture: z.boolean(),
})


const getEtapeDataForEditionDb = sql<Redefine<IGetEtapeDataForEditionDbQuery, {etapeId: EtapeId}, z.infer<typeof getEtapeDataForEditionValidator>>>`
select
    te.type_id as etape_type_id,
    td.type_id as demarche_type_id,
    t.type_id as titre_type_id,
    td.public_lecture as demarche_public_lecture,
    td.entreprises_lecture as demarche_entreprises_lecture,
    t.public_lecture as titre_public_lecture
from
    titres_etapes te
    join titres_demarches td on td.id = te.titre_demarche_id
    join titres t on t.id = td.titre_id
where te.id = $etapeId!
`

export const administrationsLocalesByEtapeId = async (etapeId: EtapeId, pool: Pool): Promise<AdministrationId[]> => {
  const admins = await dbQueryAndValidate(getAdministrationsLocalesByEtapeId, { etapeId }, pool, administrationsLocalesValidator)
  if (admins.length > 1) {
    throw new Error(`Trop d'administrations locales trouvées pour l'etape ${etapeId}`)
  }
  if (admins.length === 0) {
    return []
  }

  return admins[0].administrations_locales
}

const administrationsLocalesValidator = z.object({ administrations_locales: z.array(administrationIdValidator) })
const getAdministrationsLocalesByEtapeId = sql<Redefine<IGetAdministrationsLocalesByEtapeIdQuery, { etapeId: EtapeId }, z.infer<typeof administrationsLocalesValidator>>>`
select
tepoints.administrations_locales
from
    titres_etapes te
    join titres_demarches td on td.id = te.titre_demarche_id
    join titres t on t.id = td.titre_id
    left join titres_etapes tepoints on tepoints.id = t.props_titre_etapes_ids ->> 'points'
where
    te.id = $ etapeId !
`


export const entreprisesTitulairesOuAmoditairesByEtapeId = async (etapeId: EtapeId, pool: Pool): Promise<EntrepriseId[]> => {
  const entreprises = await dbQueryAndValidate(getTitulairesAmodiatairesTitreEtape, { etapeId }, pool, entrepriseIdObjectValidator)

  return entreprises.map(({ id }) => id)
}

const entrepriseIdObjectValidator = z.object({ id: entrepriseIdValidator })
const getTitulairesAmodiatairesTitreEtape = sql<Redefine<IGetTitulairesAmodiatairesTitreEtapeQuery, { etapeId: EtapeId }, z.infer<typeof entrepriseIdObjectValidator>>>`
select distinct
    e.id
from
    entreprises e,
    titres_etapes te
    join titres_demarches td on td.id = te.titre_demarche_id
    join titres t on t.id = td.titre_id
    left join titres_titulaires tt on tt.titre_etape_id = t.props_titre_etapes_ids ->> 'titulaires'
    left join titres_amodiataires tta on tta.titre_etape_id = t.props_titre_etapes_ids ->> 'amodiataires'
where te.id = $ etapeId !
and (tt.entreprise_id = e.id
    or tta.entreprise_id = e.id)
`