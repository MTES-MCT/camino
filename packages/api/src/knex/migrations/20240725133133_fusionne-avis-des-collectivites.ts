/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */
import { DemarcheId } from 'camino-common/src/demarche'
import { EtapeDocumentId, EtapeId } from 'camino-common/src/etape'
import { AvisStatutId, AvisTypeId, AvisVisibilityId, AvisVisibilityIds } from 'camino-common/src/static/avisTypes'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { Knex } from 'knex'
import { LargeObjectId } from '../../database/largeobjects'
import { newEtapeAvisId } from '../../database/models/_format/id-create'
import { CaminoDate } from 'camino-common/src/date'
import { Contenu } from 'camino-common/src/permissions/sections'

const ETAPE_TYPE_ID_TO_AVIS_TYPE_ID: { [key in string]?: string } = {
  acl: 'avisDUneCollectivite',
  aep: 'avisDUneCollectivite',
  ama: 'avisDUneCollectivite',
} as const
const getVisibilityId = (etapeDocument: Pick<DocumentFromDb, 'public_lecture' | 'entreprises_lecture'>): AvisVisibilityId => {
  if (etapeDocument.public_lecture) {
    return AvisVisibilityIds.Public
  }

  if (etapeDocument.entreprises_lecture) {
    return AvisVisibilityIds.TitulairesEtAdministrations
  }

  return AvisVisibilityIds.Administrations
}
const etapeTypesToDelete = Object.keys(ETAPE_TYPE_ID_TO_AVIS_TYPE_ID)
const ETAPE_STATUT_ID_TO_AVIS_STATUT_ID: { [key in EtapeStatutId]?: AvisStatutId } = {
  fav: 'Favorable',
  def: 'Défavorable',
  fre: 'Favorable avec réserves',
  fai: 'Favorable',
  dre: 'Défavorable',
} as const
type EtapeFromDb = { id: EtapeId; date: CaminoDate; titre_demarche_id: DemarcheId; type_id: EtapeTypeId | 'eof' | 'aof'; statut_id: EtapeStatutId; contenu: Contenu }
type DocumentFromDb = { id: EtapeDocumentId; largeobject_id: LargeObjectId; description: string; public_lecture: boolean; entreprises_lecture: boolean }

export const up = async (knex: Knex): Promise<void> => {
  await knex.raw(`DELETE FROM etapes_documents where etape_id in (select id FROM titres_etapes where archive is true and type_id in (${etapeTypesToDelete.map(_ => '?').join(',')}))`, [
    ...etapeTypesToDelete,
  ])
  await knex.raw(`DELETE FROM titres_etapes where archive is true and type_id in (${etapeTypesToDelete.map(_ => '?').join(',')})`, [...etapeTypesToDelete])

  const allEtapesDb: { rows: EtapeFromDb[] } = await knex.raw(
    `SELECT * FROM titres_etapes
     WHERE titres_etapes.type_id IN (${etapeTypesToDelete.map(_ => '?').join(',')})
     ORDER BY titres_etapes.ordre ASC`,
    [...etapeTypesToDelete]
  )

  const etapesByDemarcheId = allEtapesDb.rows.reduce<Record<DemarcheId, EtapeFromDb[]>>((acc, etape) => {
    if (acc[etape.titre_demarche_id] === undefined) {
      acc[etape.titre_demarche_id] = []
    }
    acc[etape.titre_demarche_id].push(etape)

    return acc
  }, {})

  for (const etapes of Object.values(etapesByDemarcheId)) {
    const etapePivotId = etapes[0].id

    for (let index = 0; index < etapes.length; index++) {
      const etape = etapes[index]

      // documents et avis vide
      const documents: { rows: DocumentFromDb[] } = await knex.raw(`SELECT * from etapes_documents where etape_id= :id`, { id: etape.id })
      const avisTypeId = ETAPE_TYPE_ID_TO_AVIS_TYPE_ID[etape.type_id]
      const avisStatutId = ETAPE_STATUT_ID_TO_AVIS_STATUT_ID[etape.statut_id]
      if (isNullOrUndefined(avisTypeId) || isNullOrUndefined(avisStatutId)) {
        console.error('une étape type id ou statut non prise en compte', etape)
      } else {
        for (let i = 0; i < documents.rows.length; i++) {
          const document = documents.rows[i]

          const row = {
            id: document.id,
            avis_type_id: avisTypeId,
            etape_id: etapePivotId,

            description: document.description ?? '',
            avis_statut_id: avisStatutId,
            date: etape.date,
            largeobject_id: document.largeobject_id,
            avis_visibility_id: getVisibilityId(document),
          }
          await knex.raw(
            'INSERT INTO etape_avis(id, avis_type_id, etape_id, description, avis_statut_id, date, largeobject_id, avis_visibility_id) VALUES(:id, :avis_type_id, :etape_id, :description, :avis_statut_id, :date, :largeobject_id, :avis_visibility_id)',
            { ...row, etape_id: etapePivotId }
          )
          await knex.raw('DELETE FROM etapes_documents WHERE id = :id', { id: row.id })
        }
        if (documents.rows.length === 0) {
          const row = {
            id: newEtapeAvisId(avisTypeId as AvisTypeId),
            avis_type_id: avisTypeId,
            etape_id: etapePivotId,
            description: '',
            avis_statut_id: avisStatutId,
            date: etape.date,
            largeobject_id: null,
            avis_visibility_id: 'Administrations',
          }
          await knex.raw(
            'INSERT INTO etape_avis(id, avis_type_id, etape_id, description, avis_statut_id, date, largeobject_id, avis_visibility_id) VALUES(:id, :avis_type_id, :etape_id, :description, :avis_statut_id, :date, :largeobject_id, :avis_visibility_id)',
            { ...row, etape_id: etapePivotId }
          )
        }
      }

      if (etapePivotId === etape.id) {
        await knex.raw(`UPDATE titres_etapes SET type_id = 'adc', statut_id='fai' WHERE id = :id`, {
          id: etape.id,
        })
      } else {
        await knex.raw(`DELETE FROM titres_etapes WHERE id = :id`, {
          id: etape.id,
        })
      }
    }
  }
}

export const down = (): void => {}
