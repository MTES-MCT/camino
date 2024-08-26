/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */

import { CaminoDate } from 'camino-common/src/date'
import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeDocumentId, EtapeId } from 'camino-common/src/etape'
import { AvisStatutId, AvisTypes, AvisVisibilityIds } from 'camino-common/src/static/avisTypes'
import { isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { Knex } from 'knex'
import { LargeObjectId } from '../../database/largeobjects'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'

type DocumentFromDb = { id: EtapeDocumentId; largeobject_id: LargeObjectId; description: string; public_lecture: boolean; entreprises_lecture: boolean }

export const up = async (knex: Knex): Promise<void> => {
  const etapes: { rows: { id: EtapeId; titre_demarche_id: DemarcheId; date: CaminoDate; type_id: EtapeTypeId }[] } = await knex.raw(
    `SELECT id, titre_demarche_id, type_id, date FROM titres_etapes WHERE type_id IN ('wap', 'apw', 'ccs')`
  )

  for (const etape of etapes.rows) {
    const documents: { rows: DocumentFromDb[] } = await knex.raw(`SELECT * FROM etapes_documents WHERE etape_id = ?`, [etape.id])
    const avisDesServices: { rows: { id: EtapeId; titre_demarche_id: DemarcheId }[] } = await knex.raw(
      `SELECT id, titre_demarche_id FROM titres_etapes WHERE titre_demarche_id = ? AND type_id = 'asc'`,
      [etape.titre_demarche_id]
    )
    if (isNullOrUndefinedOrEmpty(avisDesServices.rows)) {
      throw new Error('Un avis des services est obligatoire')
    }

    const nonRenseigneAvis: AvisStatutId = 'Non renseigné'
    for (const document of documents.rows) {
      const row = {
        id: document.id,
        avis_type_id: AvisTypes.autreAvis.id,
        etape_id: avisDesServices.rows[0].id,
        description: 'avis du préfet maritime',
        avis_statut_id: nonRenseigneAvis,
        date: etape.date,
        largeobject_id: document.largeobject_id,
        avis_visibility_id: AvisVisibilityIds.Administrations,
      }
      await knex.raw(
        'INSERT INTO etape_avis(id, avis_type_id, etape_id, description, avis_statut_id, date, largeobject_id, avis_visibility_id) VALUES(:id, :avis_type_id, :etape_id, :description, :avis_statut_id, :date, :largeobject_id, :avis_visibility_id)',
        { ...row }
      )
      await knex.raw('DELETE FROM etapes_documents WHERE id = :id', { id: row.id })
    }
  }

  await knex.raw('DELETE FROM titres_etapes WHERE id = ANY(?)', [etapes.rows.map(({ id }) => id)])
}

export const down = (): void => {}
