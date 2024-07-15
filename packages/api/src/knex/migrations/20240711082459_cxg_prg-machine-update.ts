import { DEMARCHES_TYPES_IDS, DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { Knex } from 'knex'

const demarcheTypeIdsCxPr_G: DemarcheTypeId[] = [
  DEMARCHES_TYPES_IDS.Mutation,
  DEMARCHES_TYPES_IDS.Amodiation,
  DEMARCHES_TYPES_IDS.Cession,
  DEMARCHES_TYPES_IDS.Conversion,
  DEMARCHES_TYPES_IDS.Decheance,
  DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation,
  DEMARCHES_TYPES_IDS.DeplacementDePerimetre,
  DEMARCHES_TYPES_IDS.Fusion,
  DEMARCHES_TYPES_IDS.MutationPartielle,
  DEMARCHES_TYPES_IDS.Renonciation,
  DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation,
  DEMARCHES_TYPES_IDS.Retrait,
]

export const up = async (knex: Knex) => {
  for (const demarcheTypeId of demarcheTypeIdsCxPr_G) {
    await knex.raw(
      `UPDATE titres_etapes te SET statut_id = 'fai' WHERE (select td.type_id  from titres_demarches td where td.id = te.titre_demarche_id) = '${demarcheTypeId}' and type_id = 'dpu' AND slug like 'g-cx-%'`
    )
    await knex.raw(
      `UPDATE titres_etapes te SET statut_id = 'fai' WHERE (select td.type_id  from titres_demarches td where td.id = te.titre_demarche_id) = '${demarcheTypeId}' and type_id = 'dpu' AND slug like 'g-pr-%'`
    )
  }
}

export const down = () => ({})
