import { sql } from "@pgtyped/runtime";
import {z} from 'zod'
import { Redefine, dbQueryAndValidate } from "../pg-database.js";
import { Pool } from "pg";
import { IGetJorfDocumentsQuery } from "./jorf-scan.queries.types.js";
import { caminoDateValidator } from "camino-common/src/date.js";

const getJorfDocumentsValidator = z.object({
  jorf: z.string(),
  nor: z.string(),
  titre_nom: z.string(),
  date: caminoDateValidator
})


type JorfDocument = z.infer<typeof getJorfDocumentsValidator>

const getJorfDocuments = sql<Redefine<IGetJorfDocumentsQuery, {}, JorfDocument>>`
SELECT 
  doc.jorf,
  doc.nor,
  t.nom as titre_nom,
  doc.date
FROM
  documents doc
  join titres_etapes te on te.id = doc.titre_etape_id
  join titres_demarches d on d.id = te.titre_demarche_id
  join titres t on t.id = d.titre_id
WHERE
  jorf is not null
  and nor is not null
`

export const getAllJorfDocuments = async (pool: Pool): Promise<JorfDocument[]> => {
  return dbQueryAndValidate(getJorfDocuments, {}, pool, getJorfDocumentsValidator)
}