import { CaminoRequest, CustomResponse } from './express-type.js'
import { constants } from 'http2'
import { Pool } from 'pg'
import { Activite, activiteDocumentIdValidator, activiteEditionValidator, activiteIdOrSlugValidator } from 'camino-common/src/activite.js'
import {
  Contenu,
  administrationsLocalesByActiviteId,
  deleteActiviteDocument,
  entreprisesTitulairesOuAmoditairesByActiviteId,
  getActiviteById,
  getActiviteDocumentsByActiviteId,
  getLargeobjectIdByActiviteDocumentId,
  insertActiviteDocument,
  titreTypeIdByActiviteId,
  updateActiviteQuery,
} from './activites.queries.js'
import { NewDownload } from './fichiers.js'
import { DeepReadonly, isNonEmptyArray, isNullOrUndefined, memoize } from 'camino-common/src/typescript-tools.js'
import { canEditActivite, isActiviteDeposable } from 'camino-common/src/permissions/activites.js'
import { SectionWithValue } from 'camino-common/src/titres.js'
import { Section, getSectionsWithValue } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { createLargeObject } from './entreprises.js'
import { newActiviteDocumentId } from '../../database/models/_format/id-create.js'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts.js'
import { Unites } from 'camino-common/src/static/unites.js'

const extractContenuFromSectionWithValue = (sections: DeepReadonly<Section[]>, sectionsWithValue: SectionWithValue[]): Contenu => {
  const contenu: Contenu = {}
  sections.forEach(section => {
    const currentContent: Record<string, unknown> = {}
    section.elements.forEach(element => {
      const newSection = sectionsWithValue.find(newSection => newSection.id === section.id)
      if (newSection !== undefined) {
        const newElement = newSection.elements.find(newElement => newElement.id === element.id)
        if (newElement !== undefined) {
          let value = newElement.value
          if (section.id === 'substancesFiscales' && 'uniteId' in element && element.uniteId !== undefined && newElement.value !== null) {
            const ratio = Unites[element.uniteId].referenceUniteRatio
            if (ratio) {
              value = (newElement.value as number) * ratio
            }
          }
          currentContent[element.id] = value
        }
      }
    })
    contenu[section.id] = currentContent
  })

  return contenu
}

export const updateActivite =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<void>): Promise<void> => {
    const activiteIdParsed = activiteIdOrSlugValidator.safeParse(req.params.activiteId)
    const user = req.auth

    if (!activiteIdParsed.success) {
      res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST)
    } else if (isNullOrUndefined(user)) {
      res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST)
    } else {
      try {
        const titreTypeId = memoize(() => titreTypeIdByActiviteId(activiteIdParsed.data, pool))
        const administrationsLocales = memoize(() => administrationsLocalesByActiviteId(activiteIdParsed.data, pool))
        const entreprisesTitulairesOuAmodiataires = memoize(() => entreprisesTitulairesOuAmoditairesByActiviteId(activiteIdParsed.data, pool))

        const result = await getActiviteById(activiteIdParsed.data, pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires)

        if (result === null || !canEditActivite(user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, result.activite_statut_id)) {
          res.sendStatus(constants.HTTP_STATUS_FORBIDDEN)
        } else {
          const parsed = activiteEditionValidator.safeParse(req.body)

          if (!parsed.success) {
            res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST)
          } else {
            const contenu = extractContenuFromSectionWithValue(result.sections, parsed.data.sectionsWithValue)
            await updateActiviteQuery(pool, user, result.id, contenu, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires)

            const activiteDocumentsToCreate = parsed.data.newTempDocuments
            const alreadyExistingDocumentIds = parsed.data.activiteDocumentIds
            const oldActiviteDocuments = await getActiviteDocumentsByActiviteId(result.id, pool)

            if (isNonEmptyArray(oldActiviteDocuments)) {
              // supprime les anciens documents ou ceux qui n'ont pas de fichier
              for (const oldActiviteDocument of oldActiviteDocuments) {
                const documentId = alreadyExistingDocumentIds.find(id => id === oldActiviteDocument.id)

                if (!documentId) {
                  await deleteActiviteDocument(oldActiviteDocument.id, oldActiviteDocument.activite_document_type_id, result.type_id, ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION, pool)
                }
              }
            }

            for (const document of activiteDocumentsToCreate) {
              const loid = await createLargeObject(pool, document.tempDocumentName)

              await insertActiviteDocument(pool, {
                id: newActiviteDocumentId(document.date, document.activite_document_type_id),
                activite_document_type_id: document.activite_document_type_id,
                description: document.description ?? '',
                date: document.date,
                largeobject_id: loid,
                activite_id: result.id,
              })
            }

            // parsed.data
            res.sendStatus(constants.HTTP_STATUS_OK)
          }
        }
      } catch (e: any) {
        console.error(e)
        res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      }
    }
  }

export const getActivite =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<Activite>): Promise<void> => {
    const activiteIdParsed = activiteIdOrSlugValidator.safeParse(req.params.activiteId)
    const user = req.auth

    if (!activiteIdParsed.success) {
      res.sendStatus(constants.HTTP_STATUS_BAD_REQUEST)
    } else {
      try {
        const titreTypeId = memoize(() => titreTypeIdByActiviteId(activiteIdParsed.data, pool))
        const administrationsLocales = memoize(() => administrationsLocalesByActiviteId(activiteIdParsed.data, pool))
        const entreprisesTitulairesOuAmodiataires = memoize(() => entreprisesTitulairesOuAmoditairesByActiviteId(activiteIdParsed.data, pool))

        const result = await getActiviteById(activiteIdParsed.data, pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires)

        if (result !== null) {
          const sectionsWithValue: SectionWithValue[] = getSectionsWithValue(result.sections, result.contenu)

          const activiteDocuments = await getActiviteDocumentsByActiviteId(result.id, pool)
          const deposable = await isActiviteDeposable(
            user,
            titreTypeId,
            administrationsLocales,
            entreprisesTitulairesOuAmodiataires,
            { ...result, sections_with_value: sectionsWithValue },
            activiteDocuments
          )
          const modification = await canEditActivite(user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, result.activite_statut_id)

          const activite: Activite = {
            id: result.id,
            slug: result.slug,
            activite_statut_id: result.activite_statut_id,
            type_id: result.type_id,
            annee: result.annee,
            date_saisie: result.date_saisie,
            date: result.date,
            periode_id: result.periode_id,
            suppression: result.suppression,
            deposable,
            modification,
            sections_with_value: sectionsWithValue,
            titre: {
              nom: result.titre_nom,
              slug: result.titre_slug,
            },
            activite_documents: activiteDocuments,
          }
          res.json(activite)
        } else {
          res.sendStatus(constants.HTTP_STATUS_NOT_FOUND)
        }
      } catch (e) {
        res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        console.error(e)
      }
    }
  }

export const activiteDocumentDownload: NewDownload = async (params, user, pool) => {
  const activiteDocumentId = activiteDocumentIdValidator.parse(params.documentId)
  const activiteDocumentLargeObjectId = await getLargeobjectIdByActiviteDocumentId(activiteDocumentId, pool, user)

  return { loid: activiteDocumentLargeObjectId, fileName: activiteDocumentId }
}
