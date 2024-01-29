import { EtapeIdOrSlug, etapeIdValidator } from "camino-common/src/etape.js"
import { etapeTypeIdValidator } from "camino-common/src/static/etapesTypes.js"
import { Pool } from "pg"
import { z } from "zod"
import { Redefine, dbQueryAndValidate } from "../../pg-database.js"
import { sql } from "@pgtyped/runtime"
import { IGetEtapeByIdDbQuery } from "./etapes.queries.types.js"
import { demarcheIdValidator } from "camino-common/src/demarche.js"
import { sdomZoneIdValidator } from "camino-common/src/static/sdom.js"
import { multiPolygonValidator } from "camino-common/src/perimetre.js"


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
     ST_AsGeoJSON(geojson4326_perimetre)::json as geojson4326_perimetre,
     sdom_zones
 from
     titres_etapes
 where (id = $etapeId! or slug = $etapeId!)
 and archive is false
 `
 