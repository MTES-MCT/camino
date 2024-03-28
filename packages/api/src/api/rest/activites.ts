import { CaminoRequest, CustomResponse } from './express-type.js'
import { HTTP_STATUS } from 'camino-common/src/http.js'
import { Pool } from 'pg'
import { Activite, activiteDocumentIdValidator, activiteEditionValidator, activiteIdOrSlugValidator, activiteIdValidator } from 'camino-common/src/activite.js'
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
  DbActivite,
  activiteDeleteQuery,
} from './activites.queries.js'
import { NewDownload } from './fichiers.js'
import { DeepReadonly, SimplePromiseFn, isNonEmptyArray, isNullOrUndefined, memoize } from 'camino-common/src/typescript-tools.js'
import { canEditActivite, isActiviteDeposable } from 'camino-common/src/permissions/activites.js'
import { SectionWithValue } from 'camino-common/src/sections.js'
import { Section, getSectionsWithValue } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { newActiviteDocumentId } from '../../database/models/_format/id-create.js'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts.js'
import { Unites } from 'camino-common/src/static/unites.js'
import { User } from 'camino-common/src/roles.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { EntrepriseId } from 'camino-common/src/entreprise.js'
import { getCurrent } from 'camino-common/src/date.js'
import { createLargeObject } from '../../database/largeobjects.js'

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
            if (ratio !== null) {
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
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
    } else if (isNullOrUndefined(user)) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
    } else {
      try {
        const titreTypeId = memoize(() => titreTypeIdByActiviteId(activiteIdParsed.data, pool))
        const administrationsLocales = memoize(() => administrationsLocalesByActiviteId(activiteIdParsed.data, pool))
        const entreprisesTitulairesOuAmodiataires = memoize(() => entreprisesTitulairesOuAmoditairesByActiviteId(activiteIdParsed.data, pool))

        const result = await getActiviteById(activiteIdParsed.data, pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires)

        if (result === null || !(await canEditActivite(user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, result.activite_statut_id))) {
          res.sendStatus(HTTP_STATUS.HTTP_STATUS_FORBIDDEN)
        } else {
          const parsed = activiteEditionValidator.safeParse(req.body)

          if (!parsed.success) {
            res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
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

              const date = getCurrent()

              await insertActiviteDocument(pool, {
                id: newActiviteDocumentId(date, document.activite_document_type_id),
                activite_document_type_id: document.activite_document_type_id,
                description: document.description ?? '',
                date,
                largeobject_id: loid,
                activite_id: result.id,
              })
            }

            res.sendStatus(HTTP_STATUS.HTTP_STATUS_NO_CONTENT)
          }
        }
      } catch (e: any) {
        console.error(e)
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      }
    }
  }

const formatActivite = async (
  dbActivite: DbActivite,
  pool: Pool,
  user: User,
  titreTypeId: SimplePromiseFn<TitreTypeId>,
  administrationsLocales: SimplePromiseFn<AdministrationId[]>,
  entreprisesTitulairesOuAmodiataires: SimplePromiseFn<EntrepriseId[]>
): Promise<Activite> => {
  const sectionsWithValue: SectionWithValue[] = getSectionsWithValue(dbActivite.sections, dbActivite.contenu)

  const activiteDocuments = await getActiviteDocumentsByActiviteId(dbActivite.id, pool)
  const deposable = await isActiviteDeposable(
    user,
    titreTypeId,
    administrationsLocales,
    entreprisesTitulairesOuAmodiataires,
    { ...dbActivite, sections_with_value: sectionsWithValue },
    activiteDocuments
  )
  const modification = await canEditActivite(user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires, dbActivite.activite_statut_id)

  return {
    id: dbActivite.id,
    slug: dbActivite.slug,
    activite_statut_id: dbActivite.activite_statut_id,
    type_id: dbActivite.type_id,
    annee: dbActivite.annee,
    date_saisie: dbActivite.date_saisie,
    date: dbActivite.date,
    periode_id: dbActivite.periode_id,
    suppression: dbActivite.suppression,
    deposable,
    modification,
    sections_with_value: sectionsWithValue,
    titre: {
      nom: dbActivite.titre_nom,
      slug: dbActivite.titre_slug,
    },
    activite_documents: activiteDocuments,
  }
}
export const getActivite =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<Activite>): Promise<void> => {
    const activiteIdParsed = activiteIdOrSlugValidator.safeParse(req.params.activiteId)
    const user = req.auth

    if (!activiteIdParsed.success) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
    } else {
      try {
        const titreTypeId = memoize(() => titreTypeIdByActiviteId(activiteIdParsed.data, pool))
        const administrationsLocales = memoize(() => administrationsLocalesByActiviteId(activiteIdParsed.data, pool))
        const entreprisesTitulairesOuAmodiataires = memoize(() => entreprisesTitulairesOuAmoditairesByActiviteId(activiteIdParsed.data, pool))

        const result = await getActiviteById(activiteIdParsed.data, pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires)

        if (result !== null) {
          const activite = await formatActivite(result, pool, user, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires)
          res.json(activite)
        } else {
          res.sendStatus(HTTP_STATUS.HTTP_STATUS_NOT_FOUND)
        }
      } catch (e) {
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        console.error(e)
      }
    }
  }

export const deleteActivite =
  (pool: Pool) =>
  async (req: CaminoRequest, res: CustomResponse<void>): Promise<void> => {
    const activiteIdParsed = activiteIdValidator.safeParse(req.params.activiteId)
    if (!activiteIdParsed.success) {
      res.sendStatus(HTTP_STATUS.HTTP_STATUS_BAD_REQUEST)
    } else {
      const id = activiteIdParsed.data
      const titreTypeId = memoize(() => titreTypeIdByActiviteId(id, pool))
      const administrationsLocales = memoize(() => administrationsLocalesByActiviteId(id, pool))
      const entreprisesTitulairesOuAmodiataires = memoize(() => entreprisesTitulairesOuAmoditairesByActiviteId(id, pool))

      const isOk = await activiteDeleteQuery(id, pool, req.auth, titreTypeId, administrationsLocales, entreprisesTitulairesOuAmodiataires)
      if (isOk) {
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_NO_CONTENT)
      } else {
        res.sendStatus(HTTP_STATUS.HTTP_STATUS_NOT_FOUND)
      }
    }
  }

export const activiteDocumentDownload: NewDownload = async (params, user, pool) => {
  const activiteDocumentId = activiteDocumentIdValidator.parse(params.documentId)
  const activiteDocumentLargeObjectId = await getLargeobjectIdByActiviteDocumentId(activiteDocumentId, pool, user)

  return { loid: activiteDocumentLargeObjectId, fileName: activiteDocumentId }
}
