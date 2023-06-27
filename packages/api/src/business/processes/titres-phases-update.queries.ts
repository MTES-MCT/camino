/* eslint-disable no-restricted-syntax */
import { sql } from '@pgtyped/runtime'
import { CaminoDate } from 'camino-common/src/date.js'
import { DemarcheId } from 'camino-common/src/demarche.js'
import { Redefine, dbQueryAndValidate } from '../../pg-database.js'
import { IUpdateDatesDemarcheDbQuery } from './titres-phases-update.queries.types.js'
import { Pool } from 'pg'
import { z } from 'zod'

export const updateDatesDemarche = async (pool: Pool, params: { newDateDebut: CaminoDate | null; newDateFin: CaminoDate | null; demarcheId: DemarcheId }) =>
  dbQueryAndValidate(updateDatesDemarcheDb, params, pool, z.void())
const updateDatesDemarcheDb = sql<
  Redefine<IUpdateDatesDemarcheDbQuery, { newDateDebut: CaminoDate | null; newDateFin: CaminoDate | null; demarcheId: DemarcheId }, void>
>`update titres_demarches set demarche_date_debut = $newDateDebut, demarche_date_fin = $newDateFin where id = $demarcheId;`
