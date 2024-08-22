/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */

import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeDocumentId, EtapeId } from 'camino-common/src/etape'
import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  const etapes: { rows: { id: EtapeId, titre_demarche_id: DemarcheId }[] } = await knex.raw(
    `SELECT id, titre_demarche_id FROM titres_etapes WHERE type_id IN ('wap', 'apw', 'ccs')`
  )
  if (etapes.rows.length === 0) {
    return
  }

  const documents: { rows: { id: EtapeDocumentId }[] } = await knex.raw(
    `SELECT id FROM etapes_documents WHERE etapeId = ANY(?)`,
    [etapes.rows.map(({ id }) => id)]
  )

  const avisDesServices: { rows: { id: EtapeId, titre_demarche_id: DemarcheId }[] } = await knex.raw(
    `SELECT id, titre_demarche_id FROM titres_etapes WHERE titre_demarche_id = ANY(?)`,
    [etapes.rows.map(({ titre_demarche_id }) => titre_demarche_id)]
  )
  const ascParDemarche = avisDesServices.rows.reduce<Record<DemarcheId, { etapeId: EtapeId, isNew: false }>>((acc, row) => {
    acc[row.titre_demarche_id] = { etapeId: row.id, isNew: false }

    return acc
  }, {})

  // FIXME: terminer la migration
  // - pour les démarches qui n'ont pas d'asc, créer l'asc pour y rattacher les avis
  // - transformer les documents en avis rattachés à l'asc
  // - supprimer les anciennes étapes
}

export const down = (): void => {}
