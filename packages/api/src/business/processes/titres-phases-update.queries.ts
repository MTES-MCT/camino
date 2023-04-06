import { sql } from '@pgtyped/runtime'
import { CaminoDate } from 'camino-common/src/date.js'
import { DemarcheId } from 'camino-common/src/demarche.js'
import { Redefine } from '../../pg-database.js'
import { IUpdateDatesDemarcheDbQuery } from './titres-phases-update.queries.types.js'

export const updateDatesDemarcheDb = sql<
  Redefine<IUpdateDatesDemarcheDbQuery, { newDateDebut: CaminoDate | null; newDateFin: CaminoDate | null; demarcheId: DemarcheId }, void>
>`update titres_demarches set demarche_date_debut = $newDateDebut, demarche_date_fin = $newDateFin where id = $demarcheId;`
