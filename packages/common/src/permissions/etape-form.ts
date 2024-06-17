import { EntrepriseDocumentId, EntrepriseId } from '../entreprise.js'
import { FlattenEtape } from '../etape-form.js'
import {
  DocumentComplementaireAslEtapeDocumentModification,
  DocumentComplementaireDaeEtapeDocumentModification,
  EtapeAvis,
  EtapeDocument,
  TempEtapeAvis,
  TempEtapeDocument,
  needAslAndDae,
} from '../etape.js'
import { User, isAdministrationAdmin, isAdministrationEditeur, isSuper } from '../roles.js'
import { AvisTypeId, AvisTypes } from '../static/avisTypes.js'
import { CommuneId } from '../static/communes'
import { DemarcheTypeId } from '../static/demarchesTypes.js'
import { DEPARTEMENT_IDS, toDepartementId } from '../static/departement.js'
import { DocumentsTypes, EntrepriseDocumentTypeId } from '../static/documentsTypes.js'
import { ETAPES_TYPES, EtapeTypeId, EtapesTypes } from '../static/etapesTypes.js'
import { SDOMZoneId } from '../static/sdom.js'
import { TitreTypeId, TitresTypes } from '../static/titresTypes.js'
import { TITRES_TYPES_TYPES_IDS } from '../static/titresTypesTypes.js'
import { getDocuments } from '../static/titresTypes_demarchesTypes_etapesTypes/documents.js'
import { getEntrepriseDocuments } from '../static/titresTypes_demarchesTypes_etapesTypes/entrepriseDocuments.js'
import { documentTypeIdsBySdomZonesGet } from '../static/titresTypes_demarchesTypes_etapesTypes/sdom.js'
import { getSections, getSectionsWithValue } from '../static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { isNotNullNorUndefinedNorEmpty, DeepReadonly, onlyUnique, NonEmptyArray, isNonEmptyArray, isNullOrUndefinedOrEmpty, isNullOrUndefined, Nullable } from '../typescript-tools.js'
import { sectionsWithValueCompleteValidate } from './sections.js'
import { isDureeOptional } from './titres-etapes.js'

type ValidReturn = { valid: true } | { valid: false; errors: NonEmptyArray<string> }

export const dateTypeStepIsVisible = (user: User): boolean => {
  return isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)
}
export const dateTypeStepIsComplete = (etape: DeepReadonly<Nullable<Pick<FlattenEtape, 'typeId' | 'date' | 'statutId'>>>, user: User): ValidReturn => {
  if (!dateTypeStepIsVisible(user)) {
    return { valid: true }
  }

  const errors: string[] = []
  if (isNullOrUndefined(etape.date)) {
    errors.push("La date de l'étape est obligatoire")
  }

  if (isNullOrUndefined(etape.typeId)) {
    errors.push("Le type de l'étape est obligatoire")
  }

  if (isNullOrUndefined(etape.statutId)) {
    errors.push("Le statut de l'étape est obligatoire")
  }

  if (isNonEmptyArray(errors)) {
    return { valid: false, errors }
  }

  return { valid: true }
}

export const dateTypeStepIsEnregistrable = (etape: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'date' | 'statutId'>>, user: User): boolean => {
  return dateTypeStepIsComplete(etape, user).valid
}

export const fondamentaleStepIsVisible = (etapeTypeId: EtapeTypeId): boolean => {
  return EtapesTypes[etapeTypeId].fondamentale
}

export const fondamentaleStepIsComplete = (flattened: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'duree' | 'substances'>>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): ValidReturn => {
  if (!fondamentaleStepIsVisible(flattened.typeId)) {
    return { valid: true }
  }
  const errors: string[] = []

  if (flattened.typeId !== ETAPES_TYPES.demande) {
    return { valid: true }
  }

  if (isNullOrUndefinedOrEmpty(flattened.substances.value)) {
    errors.push('Les substances sont obligatoires')
  }

  if (!isDureeOptional(flattened.typeId, demarcheTypeId, titreTypeId) && (isNullOrUndefined(flattened.duree.value) || flattened.duree.value === 0)) {
    errors.push('la durée est obligatoire')
  }

  if (isNonEmptyArray(errors)) {
    return { valid: false, errors }
  }

  return { valid: true }
}

export const fondamentaleStepIsEnregistrable = (flattened: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'duree' | 'substances'>>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  return fondamentaleStepIsComplete(flattened, demarcheTypeId, titreTypeId).valid
}

export const sectionsStepIsVisible = (etape: Pick<FlattenEtape, 'typeId'>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  return getSections(titreTypeId, demarcheTypeId, etape.typeId).length > 0
}
export const sectionsStepIsComplete = (etape: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'contenu'>>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): ValidReturn => {
  if (!sectionsStepIsVisible(etape, demarcheTypeId, titreTypeId)) {
    return { valid: true }
  }

  const sections = getSections(titreTypeId, demarcheTypeId, etape.typeId)
  const sectionsWithValue = getSectionsWithValue(sections, etape.contenu)
  const errors: string[] = sectionsWithValueCompleteValidate(sectionsWithValue)

  if (isNonEmptyArray(errors)) {
    return { valid: false, errors }
  }

  return { valid: true }
}

export const sectionsStepIsEnregistrable = (etape: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'contenu'>>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  return sectionsStepIsComplete(etape, demarcheTypeId, titreTypeId).valid
}

export const perimetreStepIsVisible = (etape: Pick<FlattenEtape, 'typeId'>): boolean => {
  return EtapesTypes[etape.typeId].fondamentale
}
export const perimetreStepIsComplete = (etape: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'perimetre'>>): ValidReturn => {
  if (!perimetreStepIsVisible(etape)) {
    return { valid: true }
  }

  const errors: string[] = []
  if (etape.typeId === 'mfr' && isNullOrUndefined(etape.perimetre.value?.geojson4326Perimetre)) {
    errors.push('Le périmètre est obligatoire')
  }

  if (isNonEmptyArray(errors)) {
    return { valid: false, errors }
  }

  return { valid: true }
}

export const perimetreStepIsEnregistrable = (etape: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'perimetre'>>): boolean => {
  return perimetreStepIsComplete(etape).valid
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

export const getAvisTypes = (etapeTypeId: EtapeTypeId, titreTypeId: TitreTypeId, communeIds: DeepReadonly<CommuneId[]>): { id: AvisTypeId; optionnel: boolean }[] => {
  const avis = []
  if (etapeTypeId === ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives) {
    avis.push(
      ...[
        { ...AvisTypes.lettreDeSaisineDesServices, optionnel: false },
        { ...AvisTypes.avisDirectionRegionaleDesAffairesCulturelles, optionnel: true },
        { ...AvisTypes.avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques, optionnel: true },
        { ...AvisTypes.avisDirectionsRégionalesEconomieEmploiTravailSolidarités, optionnel: true },
        { ...AvisTypes.avisDirectionRegionaleFinancesPubliques, optionnel: true },
        { ...AvisTypes.avisGendarmerieNationale, optionnel: true },
        { ...AvisTypes.avisIFREMER, optionnel: true },
        { ...AvisTypes.avisInstitutNationalOrigineQualite, optionnel: true },
        { ...AvisTypes.avisServiceAdministratifLocal, optionnel: true },
        { ...AvisTypes.avisAutoriteMilitaire, optionnel: true },
        { ...AvisTypes.avisParcNational, optionnel: true },
        { ...AvisTypes.avisDirectionDepartementaleTerritoiresMer, optionnel: true },
        { ...AvisTypes.avisAgenceRegionaleSante, optionnel: true },
        { ...AvisTypes.avisCaisseGeneraleSecuriteSociale, optionnel: true },
        { ...AvisTypes.autreAvis, optionnel: true },
        { ...AvisTypes.avisOfficeNationalDesForets, optionnel: false },
        { ...AvisTypes.expertiseOfficeNationalDesForets, optionnel: true },
        // TODO 2024-05-14: rendre obligatoire pour les PNMs quand ces derniers seront implémentés
        { ...AvisTypes.avisParcNaturelMarin, optionnel: true },
      ]
    )

    if (communeIds.some(id => toDepartementId(id) === DEPARTEMENT_IDS.Guyane)) {
      avis.push(
        ...[
          { ...AvisTypes.avisDirectionAlimentationAgricultureForet, optionnel: true },
          { ...AvisTypes.avisEtatMajorOrpaillagePecheIllicite, optionnel: true },
        ]
      )
    }

    // FIXME Obligatoire si avis propriétaire du sol est favorable avec réserve ... On garde ça ?! On peut le mettre tout le temps optionnel pour le moment
    if (TitresTypes[titreTypeId].typeId === TITRES_TYPES_TYPES_IDS.AUTORISATION_D_EXPLOITATION) {
      avis.push({ ...AvisTypes.confirmationAccordProprietaireDuSol, optionnel: false })
    }
  }

  return avis
}

export const etapeDocumentsStepIsVisible = (etape: Pick<FlattenEtape, 'typeId'>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  return getDocuments(titreTypeId, demarcheTypeId, etape.typeId).length > 0
}
export const etapeDocumentsStepIsComplete = (
  etape: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'contenu' | 'isBrouillon'>>,
  demarcheTypeId: DemarcheTypeId,
  titreTypeId: TitreTypeId,
  etapeDocuments: DeepReadonly<Pick<EtapeDocument | TempEtapeDocument, 'etape_document_type_id'>[]>,
  sdomZoneIds: DeepReadonly<SDOMZoneId[]>,
  daeDocument: DeepReadonly<Omit<DocumentComplementaireDaeEtapeDocumentModification, 'id'>> | null,
  aslDocument: DeepReadonly<Omit<DocumentComplementaireAslEtapeDocumentModification, 'id'>> | null,
  user: User
): ValidReturn => {
  if (!etapeDocumentsStepIsVisible(etape, demarcheTypeId, titreTypeId)) {
    return { valid: true }
  }

  const errors: string[] = []
  const documentTypes = getDocumentsTypes({ typeId: etape.typeId }, demarcheTypeId, titreTypeId, sdomZoneIds, etape.contenu?.arm?.mecanise?.value === true)

  errors.push(
    ...documentTypes
      .filter(({ optionnel, id }) => !optionnel && etapeDocuments.every(({ etape_document_type_id }) => etape_document_type_id !== id))
      .map(({ id }) => `le document "${DocumentsTypes[id].nom}" (${id}) est obligatoire`)
  )

  if (needAslAndDae({ etapeTypeId: etape.typeId, demarcheTypeId, titreTypeId }, etape.isBrouillon, user)) {
    if (isNullOrUndefined(daeDocument)) {
      errors.push('L’arrêté préfectoral de la mission autorité environnementale est obligatoire')
    }
    if (isNullOrUndefined(aslDocument)) {
      errors.push('La lettre de décision du propriétaire du sol est obligatoire')
    }
  }

  if (isNonEmptyArray(errors)) {
    return { valid: false, errors }
  }

  return { valid: true }
}

export const etapeDocumentsStepIsEnregistrable = (
  etape: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'contenu' | 'isBrouillon'>>,
  demarcheTypeId: DemarcheTypeId,
  titreTypeId: TitreTypeId,
  etapeDocuments: DeepReadonly<(EtapeDocument | TempEtapeDocument)[]>,
  sdomZoneIds: DeepReadonly<SDOMZoneId[]>,
  daeDocument: DeepReadonly<DocumentComplementaireDaeEtapeDocumentModification> | null,
  aslDocument: DeepReadonly<DocumentComplementaireAslEtapeDocumentModification> | null,
  user: User
): boolean => {
  return etapeDocumentsStepIsComplete(etape, demarcheTypeId, titreTypeId, etapeDocuments, sdomZoneIds, daeDocument, aslDocument, user).valid
}

export const etapeAvisStepIsVisible = (etape: Pick<FlattenEtape, 'typeId'>, titreTypeId: TitreTypeId, communeIds: DeepReadonly<CommuneId[]>): boolean => {
  return getAvisTypes(etape.typeId, titreTypeId, communeIds).length > 0
}

export const etapeAvisStepIsComplete = (
  etape: DeepReadonly<Pick<FlattenEtape, 'typeId'>>,
  etapeAvis: DeepReadonly<Pick<EtapeAvis | TempEtapeAvis, 'avis_type_id'>[]>,
  titreTypeId: TitreTypeId,
  communeIds: DeepReadonly<CommuneId[]>
): ValidReturn => {
  if (!etapeAvisStepIsVisible(etape, titreTypeId, communeIds)) {
    return { valid: true }
  }

  const avisTypes = getAvisTypes(etape.typeId, titreTypeId, communeIds)
  if (avisTypes.some(avisType => !avisType.optionnel && etapeAvis.every(avis => avis.avis_type_id !== avisType.id))) {
    return { valid: false, errors: ['Il manque des avis obligatoires'] }
  }

  return { valid: true }
}

export const etapeAvisStepIsEnregistrable = (): boolean => {
  // TODO 2024-05-14 --> Si l'étape est complète à un moment, est-ce qu'on interdit le nouvel enregistrement ?
  return true
}

export const entrepriseDocumentsStepIsVisible = (etape: Pick<FlattenEtape, 'typeId'>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  return getEntrepriseDocuments(titreTypeId, demarcheTypeId, etape.typeId).length > 0
}
export const entrepriseDocumentsStepIsComplete = (
  etape: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'contenu' | 'titulaires' | 'amodiataires'>>,
  demarcheTypeId: DemarcheTypeId,
  titreTypeId: TitreTypeId,
  entreprisesDocuments: DeepReadonly<Pick<SelectedEntrepriseDocument, 'documentTypeId' | 'entrepriseId'>[]>
): ValidReturn => {
  if (!entrepriseDocumentsStepIsVisible(etape, demarcheTypeId, titreTypeId)) {
    return { valid: true }
  }

  const documentTypes = getEntrepriseDocuments(titreTypeId, demarcheTypeId, etape.typeId)

  const entrepriseIds = [...etape.titulaires.value, ...etape.amodiataires.value].filter(onlyUnique)

  if (
    entrepriseIds.some(eId => documentTypes.some(({ optionnel, id }) => !optionnel && entreprisesDocuments.every(({ documentTypeId, entrepriseId }) => documentTypeId !== id || entrepriseId !== eId)))
  ) {
    return { valid: false, errors: ["Il manque des documents d'entreprise obligatoires"] }
  }

  return { valid: true }
}

export const entrepriseDocumentsStepIsEnregistrable = (
  etape: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'contenu' | 'titulaires' | 'amodiataires'>>,
  demarcheTypeId: DemarcheTypeId,
  titreTypeId: TitreTypeId,
  entreprisesDocuments: DeepReadonly<Pick<SelectedEntrepriseDocument, 'documentTypeId' | 'entrepriseId'>[]>
): ValidReturn => {
  if (!entrepriseDocumentsStepIsVisible(etape, demarcheTypeId, titreTypeId)) {
    return { valid: true }
  }

  const documentTypes = getEntrepriseDocuments(titreTypeId, demarcheTypeId, etape.typeId)

  const entrepriseIds = [...etape.titulaires.value, ...etape.amodiataires.value].filter(onlyUnique)

  if (
    entrepriseIds.some(eId => documentTypes.some(({ optionnel, id }) => !optionnel && entreprisesDocuments.every(({ documentTypeId, entrepriseId }) => documentTypeId !== id || entrepriseId !== eId)))
  ) {
    return { valid: false, errors: ["Il manque des documents d'entreprise obligatoires"] }
  }

  return { valid: true }
}

export type SelectedEntrepriseDocument = {
  id: EntrepriseDocumentId
  entrepriseId: EntrepriseId
  documentTypeId: EntrepriseDocumentTypeId
}
