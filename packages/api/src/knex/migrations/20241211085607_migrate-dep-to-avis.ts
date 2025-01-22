/* eslint-disable sql/no-unsafe-query */
import { CaminoDate } from 'camino-common/src/date'
import { etapeAvisIdValidator, EtapeDocumentId, EtapeId } from 'camino-common/src/etape'
import { DATE_DEBUT_PROCEDURE_SPECIFIQUE_AXM_ARM } from 'camino-common/src/machines'
import { AVIS_TYPES, AvisVisibilityIds } from 'camino-common/src/static/avisTypes'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'
import { Knex } from 'knex'
import { EtapeAvisDb } from '../../database/queries/titres-etapes.queries'
import { LargeObjectId } from '../../database/largeobjects'
import { DOCUMENTS_TYPES_IDS } from 'camino-common/src/static/documentsTypes'

export const up = async (knex: Knex): Promise<void> => {
  const etapes: { rows: { id: EtapeId; date: CaminoDate }[] } = await knex.raw(`SELECT te.id, te.date FROM titres_etapes te
    JOIN titres_demarches td on te.titre_demarche_id = td.id
    JOIN titres t on td.titre_id = t.id
    WHERE te.type_id = '${ETAPES_TYPES.demande}'
    AND date >= '${DATE_DEBUT_PROCEDURE_SPECIFIQUE_AXM_ARM}'
    AND te.archive is false
    AND td.archive is false
    AND t.type_id='${TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX}'`)

  for (const etape of etapes.rows) {
    const documents: { rows: { id: EtapeDocumentId; public_lecture: boolean; entreprises_lecture: boolean; description: string; largeobject_id: LargeObjectId }[] } = await knex.raw(
      `SELECT id, public_lecture, entreprises_lecture, description, largeobject_id FROM etapes_documents WHERE etape_id = :etapeId AND etape_document_type_id = '${DOCUMENTS_TYPES_IDS.decisionCasParCas}'`,
      { etapeId: etape.id }
    )
    for (const document of documents.rows) {
      const avis: EtapeAvisDb & { etape_id: EtapeId } = {
        id: etapeAvisIdValidator.parse(document.id),
        etape_id: etape.id,
        avis_type_id: AVIS_TYPES.avisCasParCas,
        avis_statut_id: 'Exempté',
        avis_visibility_id: document.public_lecture ? AvisVisibilityIds.Public : document.entreprises_lecture ? AvisVisibilityIds.TitulairesEtAdministrations : AvisVisibilityIds.Administrations,
        description: document.description,
        date: etape.date,
        largeobject_id: document.largeobject_id,
      }
      await knex.raw(
        'INSERT INTO etape_avis (id, avis_type_id, avis_statut_id, avis_visibility_id, etape_id, description, date, largeobject_id) VALUES(:id, :avis_type_id, :avis_statut_id, :avis_visibility_id, :etape_id, :description, :date, :largeobject_id)',
        avis
      )
      await knex.raw('DELETE FROM etapes_documents WHERE id = :id', { id: document.id })
    }
  }
}

export const down = (): void => {}
