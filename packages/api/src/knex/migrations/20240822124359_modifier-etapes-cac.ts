/* eslint-disable no-restricted-syntax */
/* eslint-disable sql/no-unsafe-query */

import { EtapeDocumentId, EtapeId } from 'camino-common/src/etape'
import { DOCUMENTS_TYPES_IDS, DocumentTypeId, DocumentsTypes } from 'camino-common/src/static/documentsTypes'
import { Knex } from 'knex'
import { LargeObjectId } from '../../database/largeobjects'
import { isNullOrUndefined, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { CaminoDate } from 'camino-common/src/date'
import { AvisStatutId, AvisTypeId, AvisTypes, AvisVisibilityId } from 'camino-common/src/static/avisTypes'

export const up = async (knex: Knex): Promise<void> => {
  // on récupère toutes les étapes concernées
  const etapes: {
    rows: {
      id: EtapeId
      date: CaminoDate
    }[]
  } = await knex.raw(`SELECT id, date FROM titres_etapes WHERE type_id = 'cac'`)
  if (etapes.rows.length === 0) {
    return
  }

  // on récupère leurs documents qu'on regroupe par étape dans un index
  type DocumentRow = {
    id: EtapeDocumentId
    etape_document_type_id: DocumentTypeId
    etape_id: EtapeId
    description?: string
    public_lecture: boolean
    entreprises_lecture: boolean
    largeobject_id: LargeObjectId
  }
  const documents: {
    rows: DocumentRow[]
  } = await knex.raw(
    `
      SELECT id, etape_document_type_id, etape_id, description, public_lecture, entreprises_lecture, largeobject_id
      FROM etapes_documents
      WHERE etape_id = ANY(?)
    `,
    [etapes.rows.map(({ id }) => id)]
  )

  const documentsByEtapeId = documents.rows.reduce<Record<EtapeId, DocumentRow[]>>((acc, row) => {
    if (isNullOrUndefined(acc[row.etape_id])) {
      acc[row.etape_id] = []
    }

    acc[row.etape_id].push(row)

    return acc
  }, {})

  // on met à jour chaque étape et ses documents
  await Promise.all(
    etapes.rows
      .map<Promise<Knex.RawBuilder>[]>(etape => {
        const promises: Promise<Knex.RawBuilder>[] = []

        // on initialise le doc obligatoire avec la première lettre de saisine de l'administration centrale disponible
        const documents = documentsByEtapeId[etape.id] ?? []
        const indexOfFirstLettreDeSaisineDeLAdminCentrale = documents.findIndex(row => row.etape_document_type_id === DOCUMENTS_TYPES_IDS.lettreDeSaisineDesServicesDeLAdministrationCentrale)

        // si on ne peut pas initialiser le doc obligatoire, on passe l'étape en brouillon
        if (indexOfFirstLettreDeSaisineDeLAdminCentrale === -1) {
          promises.push(knex.raw(`UPDATE titres_etapes SET is_brouillon = TRUE WHERE id = ?`, [etape.id]))
        } else {
          // le doc obligatoire est renommé "lettre de saisine des services civils et militaires"
          const lettreDeSaisine = documents.splice(indexOfFirstLettreDeSaisineDeLAdminCentrale, 1)[0]
          promises.push(knex.raw(`UPDATE etapes_documents SET etape_document_type_id = ? WHERE id = ?`, [DOCUMENTS_TYPES_IDS.lettreDeSaisineDesServicesCivilsEtMilitaires, lettreDeSaisine.id]))
        }

        // on transforme tous les documents restants en avis de type 'autreAvis'
        if (documents.length > 0) {
          promises.push(
            ...documents
              .map<Promise<Knex.RawBuilder>[]>(doc => {
                const avis: {
                  id: EtapeDocumentId
                  avis_type_id: AvisTypeId
                  avis_statut_id: AvisStatutId
                  avis_visibility_id: AvisVisibilityId
                  etape_id: EtapeId
                  description?: string
                  date: CaminoDate
                  largeobject_id: LargeObjectId
                } = {
                  id: doc.id,
                  avis_type_id: AvisTypes.autreAvis.id,
                  avis_statut_id: 'Non renseigné',
                  avis_visibility_id: 'Administrations',
                  etape_id: etape.id,
                  description: doc.description,
                  date: etape.date,
                  largeobject_id: doc.largeobject_id,
                }

                if (doc.etape_document_type_id === DOCUMENTS_TYPES_IDS.avis) {
                  return [
                    knex.raw(`INSERT INTO etape_avis(id, avis_type_id, avis_statut_id, avis_visibility_id, etape_id, description, date, largeobject_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                      avis.id,
                      avis.avis_type_id,
                      avis.avis_statut_id,
                      avis.avis_visibility_id,
                      avis.etape_id,
                      avis.description,
                      avis.date,
                      avis.largeobject_id,
                    ]),
                    knex.raw(`DELETE FROM etapes_documents WHERE id = ?`, [doc.id]),
                  ]
                } else {
                  return [
                    knex.raw(`UPDATE etapes_documents SET etape_document_type_id = ?, description = ? WHERE id = ?`, [
                      DOCUMENTS_TYPES_IDS.autreDocument,
                      `${DocumentsTypes[doc.etape_document_type_id].nom}${isNullOrUndefinedOrEmpty(doc.description) ? '' : ` - ${doc.description}`}`,
                      doc.id,
                    ]),
                  ]
                }
              })
              .flat()
          )
        }

        return promises
      })
      .flat()
  )
}

export const down = (): void => {}
