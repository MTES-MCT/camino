import { EntrepriseDocumentId, EntrepriseId } from '../entreprise'
import { FlattenedContenu, FlattenEtape } from '../etape-form'
import { EtapeAvis, EtapeDocument, TempEtapeAvis, TempEtapeDocument } from '../etape'
import { User, isAdministrationAdmin, isAdministrationEditeur, isSuper } from '../roles'
import { AvisTypeId, AvisTypes } from '../static/avisTypes'
import { CommuneId } from '../static/communes'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId } from '../static/demarchesTypes'
import { DEPARTEMENT_IDS, toDepartementId } from '../static/departement'
import { AutreDocumentType, DOCUMENTS_TYPES_IDS, DocumentType, DocumentsTypes, EntrepriseDocumentTypeId } from '../static/documentsTypes'
import { ETAPES_TYPES, EtapeTypeId, EtapesTypes } from '../static/etapesTypes'
import { SDOMZoneId } from '../static/sdom'
import { TITRES_TYPES_IDS, TitreTypeId, TitresTypes } from '../static/titresTypes'
import { TITRES_TYPES_TYPES_IDS } from '../static/titresTypesTypes'
import { getDocuments } from '../static/titresTypes_demarchesTypes_etapesTypes/documents'
import { getEntrepriseDocuments } from '../static/titresTypes_demarchesTypes_etapesTypes/entrepriseDocuments'
import { documentTypeIdsBySdomZonesGet } from '../static/titresTypes_demarchesTypes_etapesTypes/sdom'
import { getSections, getSectionsWithValue } from '../static/titresTypes_demarchesTypes_etapesTypes/sections'
import { isNotNullNorUndefinedNorEmpty, onlyUnique, NonEmptyArray, isNonEmptyArray, isNullOrUndefinedOrEmpty, isNullOrUndefined, Nullable } from '../typescript-tools'
import { sectionsWithValueCompleteValidate } from './sections'
import { canEditAmodiataires, canEditDuree, canEditPerimetre, canEditTitulaires } from './titres-etapes'
import { machineIdFind } from '../machines'
import { DemarcheId } from '../demarche'
import { FirstEtapeDate } from '../date'
import { z } from 'zod'
import { SectionWithValue } from '../sections'

type ValidReturn = { valid: true } | { valid: false; errors: NonEmptyArray<string> }

export const dateTypeStepIsVisible = (user: User): boolean => {
  return isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)
}
export const dateTypeStepIsComplete = (etape: Nullable<Pick<FlattenEtape, 'typeId' | 'date' | 'statutId'>>, user: User): ValidReturn => {
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

export const fondamentaleStepIsVisible = (etapeTypeId: EtapeTypeId): boolean => {
  return EtapesTypes[etapeTypeId].fondamentale
}

export const fondamentaleStepIsComplete = (
  flattened: Pick<FlattenEtape, 'typeId' | 'duree' | 'substances' | 'titulaires' | 'amodiataires'>,
  demarcheTypeId: DemarcheTypeId,
  titreTypeId: TitreTypeId,
  user: User
): ValidReturn => {
  if (!fondamentaleStepIsVisible(flattened.typeId)) {
    return { valid: true }
  }
  const errors: string[] = []

  if (isNullOrUndefinedOrEmpty(flattened.substances.value)) {
    errors.push('Les substances sont obligatoires')
  }

  const editDuree = canEditDuree(titreTypeId, demarcheTypeId, user)
  if (editDuree.visibility === 'present' && editDuree.required && (isNullOrUndefined(flattened.duree.value) || flattened.duree.value === 0)) {
    errors.push(editDuree.message)
  }

  const editTitulaires = canEditTitulaires(titreTypeId, demarcheTypeId, user)
  if (editTitulaires.visibility === 'present' && editTitulaires.required && isNullOrUndefinedOrEmpty(flattened.titulaires.value)) {
    errors.push(editTitulaires.message)
  }

  const editAmodiataires = canEditAmodiataires(titreTypeId, demarcheTypeId, user)
  if (editAmodiataires.visibility === 'present' && editAmodiataires.required && isNullOrUndefinedOrEmpty(flattened.amodiataires.value)) {
    errors.push(editAmodiataires.message)
  }

  if (isNonEmptyArray(errors)) {
    return { valid: false, errors }
  }

  return { valid: true }
}

export const sectionsStepIsVisible = (etape: Pick<FlattenEtape, 'typeId'>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  return getSections(titreTypeId, demarcheTypeId, etape.typeId).length > 0
}
export const sectionsStepIsComplete = (etape: Pick<FlattenEtape, 'typeId' | 'contenu'>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): ValidReturn => {
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

export const perimetreStepIsVisible = (etape: Pick<FlattenEtape, 'typeId'>, demarcheTypeId: DemarcheTypeId): boolean => {
  const editPerimetre = canEditPerimetre(demarcheTypeId, etape.typeId)

  return editPerimetre.visibility === 'present'
}
export const perimetreStepIsComplete = (etape: Pick<FlattenEtape, 'typeId' | 'perimetre'>, demarcheTypeId: DemarcheTypeId): ValidReturn => {
  if (!perimetreStepIsVisible(etape, demarcheTypeId)) {
    return { valid: true }
  }

  const errors: string[] = []
  const editPerimetre = canEditPerimetre(demarcheTypeId, etape.typeId)
  if (editPerimetre.visibility === 'present' && editPerimetre.required && isNullOrUndefined(etape.perimetre.value?.geojson4326Perimetre)) {
    errors.push(editPerimetre.message)
  }

  if (isNonEmptyArray(errors)) {
    return { valid: false, errors }
  }

  return { valid: true }
}

const isArmMecaniseValidator = z.boolean().brand('ARM_MECANISE')
type IsArmMecanise = z.infer<typeof isArmMecaniseValidator>

export const IS_ARM_MECANISE = true as const as IsArmMecanise
export const IS_ARM_NON_MECANISE = false as const as IsArmMecanise

export const getDocumentsTypes = (
  etape: Pick<FlattenEtape, 'typeId'>,
  demarcheTypeId: DemarcheTypeId,
  titreTypeId: TitreTypeId,
  demarcheId: DemarcheId,
  sdomZoneIds: SDOMZoneId[],
  isArmMecanise: IsArmMecanise,
  firstEtapeDate: FirstEtapeDate
): (DocumentType | AutreDocumentType)[] => {
  const dts = getDocuments(titreTypeId, demarcheTypeId, etape.typeId)

  const machineId = machineIdFind(titreTypeId, demarcheTypeId, demarcheId, firstEtapeDate)
  if (
    machineId === 'ProcedureSpecifique' &&
    titreTypeId === TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX &&
    demarcheTypeId === DEMARCHES_TYPES_IDS.Octroi &&
    etape.typeId === ETAPES_TYPES.demande
  ) {
    for (const documentType of dts) {
      if ([DOCUMENTS_TYPES_IDS.justificationDExistenceDuGisement].includes(documentType.id)) {
        documentType.optionnel = false
      }
    }
  }
  // si la démarche est mécanisée il faut ajouter des documents obligatoires
  if (isArmMecanise === IS_ARM_MECANISE) {
    for (const documentType of dts) {
      if ([DOCUMENTS_TYPES_IDS.dossierLoiSurLEau, machineId !== 'ProcedureSpecifique' ? DOCUMENTS_TYPES_IDS.decisionCasParCas : null].includes(documentType.id)) {
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

export const getAvisTypes = (
  etapeTypeId: EtapeTypeId,
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  demarcheId: DemarcheId,
  firstEtapeDate: FirstEtapeDate,
  communeIds: CommuneId[],
  isArmMecanise: IsArmMecanise
): { [key in AvisTypeId]?: { id: key; optionnel: boolean } } => {
  const avis: { [key in AvisTypeId]?: { id: key; optionnel: boolean } } = {}
  const machineId = machineIdFind(titreTypeId, demarcheTypeId, demarcheId, firstEtapeDate)

  if (etapeTypeId === ETAPES_TYPES.demande) {
    if (titreTypeId === TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX) {
      avis[AvisTypes.avisProprietaireDuSol.id] = { ...AvisTypes.avisProprietaireDuSol, optionnel: false }
      avis[AvisTypes.avisDeLaMissionAutoriteEnvironnementale.id] = { ...AvisTypes.avisDeLaMissionAutoriteEnvironnementale, optionnel: false }
    } else if (titreTypeId === TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX && machineId === 'ProcedureSpecifique') {
      avis[AvisTypes.avisCasParCas.id] = { ...AvisTypes.avisCasParCas, optionnel: isArmMecanise === IS_ARM_NON_MECANISE }
      avis[AvisTypes.avisProprietaireDuSol.id] = { ...AvisTypes.avisProprietaireDuSol, optionnel: false }
    }
  }

  if (etapeTypeId === ETAPES_TYPES.avisDesCollectivites) {
    avis[AvisTypes.avisDUneCollectivite.id] = { ...AvisTypes.avisDUneCollectivite, optionnel: true }
  } else if (etapeTypeId === ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives) {
    avis[AvisTypes.avisDirectionRegionaleDesAffairesCulturelles.id] = { ...AvisTypes.avisDirectionRegionaleDesAffairesCulturelles, optionnel: true }
    avis[AvisTypes.avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques.id] = { ...AvisTypes.avisConseilDepartementalEnvironnementRisquesSanitairesTechnologiques, optionnel: true }
    avis[AvisTypes.avisDirectionsRégionalesEconomieEmploiTravailSolidarités.id] = { ...AvisTypes.avisDirectionsRégionalesEconomieEmploiTravailSolidarités, optionnel: true }
    avis[AvisTypes.avisDirectionRegionaleFinancesPubliques.id] = { ...AvisTypes.avisDirectionRegionaleFinancesPubliques, optionnel: true }
    avis[AvisTypes.avisGendarmerieNationale.id] = { ...AvisTypes.avisGendarmerieNationale, optionnel: true }
    avis[AvisTypes.avisIFREMER.id] = { ...AvisTypes.avisIFREMER, optionnel: true }
    avis[AvisTypes.avisInstitutNationalOrigineQualite.id] = { ...AvisTypes.avisInstitutNationalOrigineQualite, optionnel: true }
    avis[AvisTypes.avisServiceAdministratifLocal.id] = { ...AvisTypes.avisServiceAdministratifLocal, optionnel: true }
    avis[AvisTypes.avisAutoriteMilitaire.id] = { ...AvisTypes.avisAutoriteMilitaire, optionnel: true }
    avis[AvisTypes.avisParcNational.id] = { ...AvisTypes.avisParcNational, optionnel: true }
    avis[AvisTypes.avisDirectionDepartementaleTerritoiresMer.id] = { ...AvisTypes.avisDirectionDepartementaleTerritoiresMer, optionnel: true }
    avis[AvisTypes.avisAgenceRegionaleSante.id] = { ...AvisTypes.avisAgenceRegionaleSante, optionnel: true }
    avis[AvisTypes.avisCaisseGeneraleSecuriteSociale.id] = { ...AvisTypes.avisCaisseGeneraleSecuriteSociale, optionnel: true }
    avis[AvisTypes.autreAvis.id] = { ...AvisTypes.autreAvis, optionnel: true }
    // L'avis de l'onf est obligatoire que pour les ARM
    avis[AvisTypes.avisOfficeNationalDesForets.id] = { ...AvisTypes.avisOfficeNationalDesForets, optionnel: machineId === 'ProcedureSpecifique' || titreTypeId !== 'arm' }
    avis[AvisTypes.expertiseOfficeNationalDesForets.id] = { ...AvisTypes.expertiseOfficeNationalDesForets, optionnel: true }
    // TODO 2024-05-14: rendre obligatoire pour les PNMs quand ces derniers seront implémentés
    avis[AvisTypes.avisParcNaturelMarin.id] = { ...AvisTypes.avisParcNaturelMarin, optionnel: true }

    if (communeIds.some(id => toDepartementId(id) === DEPARTEMENT_IDS.Guyane)) {
      avis[AvisTypes.avisDirectionAlimentationAgricultureForet.id] = { ...AvisTypes.avisDirectionAlimentationAgricultureForet, optionnel: true }
      avis[AvisTypes.avisEtatMajorOrpaillagePecheIllicite.id] = { ...AvisTypes.avisEtatMajorOrpaillagePecheIllicite, optionnel: true }
    }

    // TODO 2024-06-18 Normalement c'est obligatoire si avis propriétaire du sol est favorable avec réserve,  optionnel pour le moment
    if (TitresTypes[titreTypeId].typeId === TITRES_TYPES_TYPES_IDS.AUTORISATION_D_EXPLOITATION) {
      avis[AvisTypes.confirmationAccordProprietaireDuSol.id] = { ...AvisTypes.confirmationAccordProprietaireDuSol, optionnel: true }
    }
  } else if (etapeTypeId === ETAPES_TYPES.consultationDesAdministrationsCentrales) {
    avis[AvisTypes.autreAvis.id] = { ...AvisTypes.autreAvis, optionnel: true }
  }

  return avis
}

export const etapeDocumentsStepIsVisible = (): boolean => {
  return true // il y'a forcément au moins le document "Autre" que l'on peut saisir, donc si on a le droit d'éditer une étape, on peut voir les documents dans la page d'édition d'une étape
}

export const isArmMecanise = (contenu: FlattenedContenu | SectionWithValue[]): IsArmMecanise => {
  let result: boolean = false
  if (Array.isArray(contenu)) {
    result = contenu.some(({ id, elements }) => id === 'arm' && elements.some(({ id: idElement, value }) => idElement === 'mecanise' && value === true))
  } else {
    result = contenu['arm']?.['mecanise']?.value === true
  }

  return isArmMecaniseValidator.parse(result)
}

export const etapeDocumentsStepIsComplete = (
  etape: Pick<FlattenEtape, 'typeId' | 'contenu' | 'isBrouillon'>,
  demarcheTypeId: DemarcheTypeId,
  titreTypeId: TitreTypeId,
  demarcheId: DemarcheId,
  etapeDocuments: Pick<EtapeDocument | TempEtapeDocument, 'etape_document_type_id'>[],
  sdomZoneIds: SDOMZoneId[],
  firstEtapeDate: FirstEtapeDate
): ValidReturn => {
  const errors: string[] = []
  const documentTypes = getDocumentsTypes({ typeId: etape.typeId }, demarcheTypeId, titreTypeId, demarcheId, sdomZoneIds, isArmMecanise(etape.contenu), firstEtapeDate)

  errors.push(
    ...documentTypes
      .filter(({ optionnel, id }) => !optionnel && etapeDocuments.every(({ etape_document_type_id }) => etape_document_type_id !== id))
      .map(({ id }) => `le document "${DocumentsTypes[id].nom}" (${id}) est obligatoire`)
  )

  if (isNonEmptyArray(errors)) {
    return { valid: false, errors }
  }

  return { valid: true }
}

export const etapeAvisStepIsVisible = (
  etape: Pick<FlattenEtape, 'typeId' | 'contenu'>,
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  demarcheId: DemarcheId,
  firstEtapeDate: FirstEtapeDate,
  communeIds: CommuneId[]
): boolean => {
  return Object.keys(getAvisTypes(etape.typeId, titreTypeId, demarcheTypeId, demarcheId, firstEtapeDate, communeIds, isArmMecanise(etape.contenu))).length > 0
}

export const etapeAvisStepIsComplete = (
  etape: Pick<FlattenEtape, 'typeId' | 'contenu'>,
  etapeAvis: Pick<EtapeAvis | TempEtapeAvis, 'avis_type_id'>[],
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  demarcheId: DemarcheId,
  firstEtapeDate: FirstEtapeDate,
  communeIds: CommuneId[]
): ValidReturn => {
  if (!etapeAvisStepIsVisible(etape, titreTypeId, demarcheTypeId, demarcheId, firstEtapeDate, communeIds)) {
    return { valid: true }
  }

  const avisTypes = getAvisTypes(etape.typeId, titreTypeId, demarcheTypeId, demarcheId, firstEtapeDate, communeIds, isArmMecanise(etape.contenu))
  if (Object.values(avisTypes).some(avisType => !avisType.optionnel && etapeAvis.every(avis => avis.avis_type_id !== avisType.id))) {
    return { valid: false, errors: ['Il manque des avis obligatoires'] }
  }

  return { valid: true }
}

export const entrepriseDocumentsStepIsVisible = (etape: Pick<FlattenEtape, 'typeId'>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  return getEntrepriseDocuments(titreTypeId, demarcheTypeId, etape.typeId).length > 0
}
export const entrepriseDocumentsStepIsComplete = (
  etape: Pick<FlattenEtape, 'typeId' | 'contenu' | 'titulaires' | 'amodiataires'>,
  demarcheTypeId: DemarcheTypeId,
  titreTypeId: TitreTypeId,
  entreprisesDocuments: Pick<SelectedEntrepriseDocument, 'documentTypeId' | 'entrepriseId'>[]
): ValidReturn => {
  if (!entrepriseDocumentsStepIsVisible(etape, demarcheTypeId, titreTypeId)) {
    return { valid: true }
  }

  const documentTypes = getEntrepriseDocuments(titreTypeId, demarcheTypeId, etape.typeId)

  const entrepriseIds = [...etape.titulaires.value, ...etape.amodiataires.value].filter(onlyUnique)

  if (isNullOrUndefinedOrEmpty(entrepriseIds) && getEntrepriseDocuments(titreTypeId, demarcheTypeId, etape.typeId).some(({ optionnel }) => !optionnel)) {
    return { valid: false, errors: ["Il y a des documents d'entreprise obligatoires, mais il n'y a pas de titulaire"] }
  }

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
