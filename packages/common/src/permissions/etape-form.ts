import { EntrepriseDocumentId, EntrepriseId } from '../entreprise.js'
import { FlattenEtape } from '../etape-form.js'
import { DocumentComplementaireAslEtapeDocumentModification, DocumentComplementaireDaeEtapeDocumentModification, EtapeDocument, TempEtapeDocument, needAslAndDae } from '../etape.js'
import { User } from '../roles.js'
import { DemarcheTypeId } from '../static/demarchesTypes.js'
import { EntrepriseDocumentTypeId } from '../static/documentsTypes.js'
import { ETAPES_TYPES, EtapeTypeId, EtapesTypes } from '../static/etapesTypes.js'
import { SDOMZoneId } from '../static/sdom.js'
import { TitreTypeId } from '../static/titresTypes.js'
import { getDocuments } from '../static/titresTypes_demarchesTypes_etapesTypes/documents.js'
import { getEntrepriseDocuments } from '../static/titresTypes_demarchesTypes_etapesTypes/entrepriseDocuments.js'
import { documentTypeIdsBySdomZonesGet } from '../static/titresTypes_demarchesTypes_etapesTypes/sdom.js'
import { getSections, getSectionsWithValue } from '../static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { isNotNullNorUndefinedNorEmpty, isNotNullNorUndefined, DeepReadonly, onlyUnique } from '../typescript-tools.js'
import { sectionsWithValueCompleteValidate } from './sections.js'
import { dureeOptionalCheck } from './titres-etapes.js'

export const fondamentaleStepIsVisible = (etapeTypeId: EtapeTypeId): boolean => {
  return EtapesTypes[etapeTypeId].fondamentale
}

export const fondamentaleStepIsComplete = (flattened: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'duree' | 'substances'>>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  if (!fondamentaleStepIsVisible(flattened.typeId)) {
    return true
  }

  return (
    flattened.typeId !== ETAPES_TYPES.demande ||
    (isNotNullNorUndefinedNorEmpty(flattened.substances.value) &&
      (dureeOptionalCheck(flattened.typeId, demarcheTypeId, titreTypeId) || (isNotNullNorUndefined(flattened.duree.value) && flattened.duree.value > 0)))
  )
}

export const sectionsStepIsVisible = (etape: Pick<FlattenEtape, 'typeId'>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  return getSections(titreTypeId, demarcheTypeId, etape.typeId).length > 0
}
export const sectionsStepIsComplete = (etape: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'contenu'>>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  if (!sectionsStepIsVisible(etape, demarcheTypeId, titreTypeId)) {
    return true
  }

  const sections = getSections(titreTypeId, demarcheTypeId, etape.typeId)
  const sectionsWithValue = getSectionsWithValue(sections, etape.contenu)

  return sectionsWithValueCompleteValidate(sectionsWithValue).length === 0
}

export const perimetreStepIsVisible = (etape: Pick<FlattenEtape, 'typeId'>): boolean => {
  return EtapesTypes[etape.typeId].fondamentale
}
export const perimetreStepIsComplete = (etape: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'perimetre'>>): boolean => {
  if (!perimetreStepIsVisible(etape)) {
    return true
  }

  return etape.typeId !== 'mfr' || isNotNullNorUndefined(etape.perimetre.value?.geojson4326Perimetre)
}

export const getDocumentsTypes = (
  etape: DeepReadonly<Pick<FlattenEtape, 'typeId'>>,
  demarcheTypeId: DemarcheTypeId,
  titreTypeId: TitreTypeId,
  sdomZoneIds: DeepReadonly<SDOMZoneId[]>,
  isArmMecanise: boolean
) => {
  const dts = getDocuments(titreTypeId, demarcheTypeId, etape.typeId)

  // si la démarche est mécanisée il faut ajouter des documents obligatoires
  if (isArmMecanise) {
    for (const documentType of dts) {
      if (['doe', 'dep'].includes(documentType.id)) {
        documentType.optionnel = false
      }
    }
  }

  const sdomZonesDocumentTypeIds = documentTypeIdsBySdomZonesGet(sdomZoneIds, titreTypeId, demarcheTypeId, etape.typeId)
  if (isNotNullNorUndefinedNorEmpty(sdomZonesDocumentTypeIds)) {
    for (const documentType of dts) {
      if (sdomZonesDocumentTypeIds.includes(documentType.id)) {
        documentType.optionnel = false
      }
    }
  }

  return dts
}

export const etapeDocumentsStepIsVisible = (etape: Pick<FlattenEtape, 'typeId'>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  return getDocuments(titreTypeId, demarcheTypeId, etape.typeId).length > 0
}
export const etapeDocumentsStepIsComplete = (
  etape: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'contenu' | 'isBrouillon'>>,
  demarcheTypeId: DemarcheTypeId,
  titreTypeId: TitreTypeId,
  etapeDocuments: DeepReadonly<(EtapeDocument | TempEtapeDocument)[]>,
  sdomZoneIds: DeepReadonly<SDOMZoneId[]>,
  daeDocument: DeepReadonly<DocumentComplementaireDaeEtapeDocumentModification> | null,
  aslDocument: DeepReadonly<DocumentComplementaireAslEtapeDocumentModification> | null,
  user: User
): boolean => {
  if (!etapeDocumentsStepIsVisible(etape, demarcheTypeId, titreTypeId)) {
    return true
  }

  const documentTypes = getDocumentsTypes({ typeId: etape.typeId }, demarcheTypeId, titreTypeId, sdomZoneIds, etape.contenu?.arm?.mecanise?.value === true)

  if (documentTypes.every(({ optionnel, id }) => optionnel || etapeDocuments.some(({ etape_document_type_id }) => etape_document_type_id === id))) {
    if (needAslAndDae({ etapeTypeId: etape.typeId, demarcheTypeId, titreTypeId }, etape.isBrouillon, user)) {
      return isNotNullNorUndefined(daeDocument) && isNotNullNorUndefined(aslDocument)
    }

    return true
  }

  return false
}

export const entrepriseDocumentsStepIsVisible = (etape: Pick<FlattenEtape, 'typeId'>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  return getEntrepriseDocuments(titreTypeId, demarcheTypeId, etape.typeId).length > 0
}
export const entrepriseDocumentsStepIsComplete = (
  etape: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'contenu' | 'titulaires' | 'amodiataires'>>,
  demarcheTypeId: DemarcheTypeId,
  titreTypeId: TitreTypeId,
  entreprisesDocuments: DeepReadonly<SelectedEntrepriseDocument[]>
): boolean => {
  if (!entrepriseDocumentsStepIsVisible(etape, demarcheTypeId, titreTypeId)) {
    return true
  }

  const documentTypes = getEntrepriseDocuments(titreTypeId, demarcheTypeId, etape.typeId)

  const entrepriseIds = [...etape.titulaires.value, ...etape.amodiataires.value].filter(onlyUnique)

  return entrepriseIds.every(eId =>
    documentTypes.every(({ optionnel, id }) => optionnel || entreprisesDocuments.some(({ documentTypeId, entrepriseId }) => documentTypeId === id && entrepriseId === eId))
  )
}

export type SelectedEntrepriseDocument = {
  id: EntrepriseDocumentId
  entrepriseId: EntrepriseId
  documentTypeId: EntrepriseDocumentTypeId
}
