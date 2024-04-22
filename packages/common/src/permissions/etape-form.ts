import { EntrepriseDocumentId, EntrepriseId } from '../entreprise.js'
import { DocumentComplementaireAslEtapeDocumentModification, DocumentComplementaireDaeEtapeDocumentModification, EtapeDocument, EtapeWithHeritage, TempEtapeDocument, needAslAndDae } from '../etape.js'
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

export const fondamentaleStepIsComplete = (flattened: DeepReadonly<Pick<EtapeWithHeritage, 'typeId' | 'duree' | 'substances'>>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  if (!fondamentaleStepIsVisible(flattened.typeId)) {
    return true
  }

  return (
    flattened.typeId !== ETAPES_TYPES.demande ||
    (isNotNullNorUndefinedNorEmpty(flattened.substances) && (dureeOptionalCheck(flattened.typeId, demarcheTypeId, titreTypeId) || (isNotNullNorUndefined(flattened.duree) && flattened.duree > 0)))
  )
}

export const sectionsStepIsVisible = (etape: Pick<EtapeWithHeritage, 'typeId'>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  return getSections(titreTypeId, demarcheTypeId, etape.typeId).length > 0
}
export const sectionsStepIsComplete = (etape: DeepReadonly<Pick<EtapeWithHeritage, 'typeId' | 'contenu'>>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  if (!sectionsStepIsVisible(etape, demarcheTypeId, titreTypeId)) {
    return true
  }

  const sections = getSections(titreTypeId, demarcheTypeId, etape.typeId)
  const sectionsWithValue = getSectionsWithValue(sections, etape.contenu)
  
return sectionsWithValueCompleteValidate(sectionsWithValue).length === 0
}

export const perimetreStepIsVisible = (etape: Pick<EtapeWithHeritage, 'typeId'>): boolean => {
  return EtapesTypes[etape.typeId].fondamentale
}
export const perimetreStepIsComplete = (etape: DeepReadonly<Pick<EtapeWithHeritage, 'typeId' | 'geojson4326Perimetre' | 'heritageProps'>>): boolean => {
  if (!perimetreStepIsVisible(etape)) {
    return true
  }

  const geojson4326Perimetre = etape.heritageProps.perimetre.actif ? etape.heritageProps.perimetre.etape?.geojson4326Perimetre : etape.geojson4326Perimetre
  
return etape.typeId !== 'mfr' || isNotNullNorUndefined(geojson4326Perimetre)
}

export const getDocumentsTypes = (
  etape: DeepReadonly<Pick<EtapeWithHeritage, 'typeId' | 'contenu'>>,
  demarcheTypeId: DemarcheTypeId,
  titreTypeId: TitreTypeId,
  sdomZoneIds: DeepReadonly<SDOMZoneId[]>
) => {
  const dts = getDocuments(titreTypeId, demarcheTypeId, etape.typeId)

  // si la démarche est mécanisée il faut ajouter des documents obligatoires
  if (isNotNullNorUndefined(etape.contenu) && isNotNullNorUndefined(etape.contenu.arm) && etape.contenu.arm.mecanise === true) {
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

export const etapeDocumentsStepIsVisible = (etape: Pick<EtapeWithHeritage, 'typeId'>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  return getDocuments(titreTypeId, demarcheTypeId, etape.typeId).length > 0
}
export const etapeDocumentsStepIsComplete = (
  etape: DeepReadonly<Pick<EtapeWithHeritage, 'typeId' | 'contenu' | 'statutId'>>,
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

  const documentTypes = getDocumentsTypes({ contenu: etape.contenu, typeId: etape.typeId }, demarcheTypeId, titreTypeId, sdomZoneIds)

  if (documentTypes.every(({ optionnel, id }) => optionnel || etapeDocuments.some(({ etape_document_type_id }) => etape_document_type_id === id))) {
    if (needAslAndDae({ etapeTypeId: etape.typeId, demarcheTypeId, titreTypeId }, etape.statutId, user)) {
      return isNotNullNorUndefined(daeDocument) && isNotNullNorUndefined(aslDocument)
    }

    return true
  }

  return false
}

export const entrepriseDocumentsStepIsVisible = (etape: Pick<EtapeWithHeritage, 'typeId'>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  return isNotNullNorUndefined(etape.typeId) && getEntrepriseDocuments(titreTypeId, demarcheTypeId, etape.typeId).length > 0
}
export const entrepriseDocumentsStepIsComplete = (
  etape: DeepReadonly<Pick<EtapeWithHeritage, 'typeId' | 'contenu' | 'titulaires' | 'amodiataires'>>,
  demarcheTypeId: DemarcheTypeId,
  titreTypeId: TitreTypeId,
  entreprisesDocuments: DeepReadonly<SelectedEntrepriseDocument[]>
): boolean => {
  if (!entrepriseDocumentsStepIsVisible(etape, demarcheTypeId, titreTypeId)) {
    return true
  }

  const documentTypes = getEntrepriseDocuments(titreTypeId, demarcheTypeId, etape.typeId)

  const entrepriseIds = [...etape.titulaires, ...etape.amodiataires].map(({ id }) => id).filter(onlyUnique)

  return entrepriseIds.every(eId =>
    documentTypes.every(({ optionnel, id }) => optionnel || entreprisesDocuments.some(({ documentTypeId, entrepriseId }) => documentTypeId === id && entrepriseId === eId))
  )
}

export type SelectedEntrepriseDocument = {
  id: EntrepriseDocumentId
  entrepriseId: EntrepriseId
  documentTypeId: EntrepriseDocumentTypeId
}
