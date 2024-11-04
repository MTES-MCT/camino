import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeId } from 'camino-common/src/etape'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  const menEtapes: { rows: { titre_demarche_id: DemarcheId }[] } = await knex.raw("SELECT titre_demarche_id from titres_etapes where type_id = 'men' and archive is false")

  const demarchesWithMen = new Set(menEtapes.rows.map(({ titre_demarche_id }) => titre_demarche_id))
  const mdpEtapes: { rows: { id: EtapeId; typeId: EtapeTypeId; titre_demarche_id: DemarcheId }[] } = await knex.raw("SELECT * from titres_etapes where type_id = 'mdp'")

  const mdpToDelete: EtapeId[] = []
  const mdpToUpdate: EtapeId[] = []
  for (const etape of mdpEtapes.rows) {
    if (demarchesWithMen.has(etape.titre_demarche_id)) {
      mdpToDelete.push(etape.id)
    } else {
      mdpToUpdate.push(etape.id)
    }
  }

  await knex.raw('DELETE FROM titres_etapes WHERE id = ANY(?)', [mdpToDelete])
  await knex.raw("UPDATE titres_etapes set type_id = 'men' WHERE id = ANY(?)", [mdpToUpdate])
}

export const down = (): void => {}
