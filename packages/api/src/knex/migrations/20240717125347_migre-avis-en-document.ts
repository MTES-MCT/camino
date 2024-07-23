/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */
import { CaminoDate, dateFormat } from 'camino-common/src/date'
import { EtapeId } from 'camino-common/src/etape'
import { AvisVisibilityId } from 'camino-common/src/static/avisTypes'
import { Knex } from 'knex'
import { LargeObjectId, largeObjectIdValidator } from '../../database/largeobjects'
import { DOCUMENTS_TYPES_IDS } from 'camino-common/src/static/documentsTypes'

export const up = async (knex: Knex) => {
  const result: { rows: { id: string; avis_visibility_id: AvisVisibilityId; etape_id: EtapeId; description: string; date: CaminoDate; largeobject_id: LargeObjectId | null }[] } = await knex.raw(
    "select * from etape_avis where avis_type_id = 'lettreDeSaisineDesServices'"
  )

  for (const avis of result.rows) {
    // 152743 est l'id d'un fichier pdf vide enregistré en production spécialement pour les cas ci-dessous
    const loId: LargeObjectId = avis.largeobject_id ?? largeObjectIdValidator.parse(152743)

    const public_lecture: boolean = avis.avis_visibility_id === 'Public'
    const entreprises_lecture: boolean = public_lecture || avis.avis_visibility_id === 'TitulairesEtAdministrations'

    const description: string = `Document en date du : ${dateFormat(avis.date)}\n${avis.description}`

    await knex.raw(
      `insert into etapes_documents (id, etape_document_type_id, etape_id, description, public_lecture, entreprises_lecture, largeobject_id) values ('${avis.id}', '${DOCUMENTS_TYPES_IDS.lettreDeSaisineDesServicesCivilsEtMilitaires}', '${avis.etape_id}', '${description}', ${public_lecture}, ${entreprises_lecture}, ${loId})`
    )
  }

  await knex.raw("delete from etape_avis where avis_type_id = 'lettreDeSaisineDesServices'")
}

export const down = () => ({})
