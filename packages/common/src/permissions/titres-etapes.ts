import { ETAPES_TYPES, EtapeTypeId } from '../static/etapesTypes.js'
import { TitreTypeId } from '../static/titresTypes.js'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId, isDemarcheTypeWithPhase } from '../static/demarchesTypes.js'
import { isAdministrationAdmin, isAdministrationEditeur, isBureauDEtudes, isEntreprise, isSuper, User } from '../roles.js'
import { EtapeStatutId, ETAPES_STATUTS } from '../static/etapesStatuts.js'
import { TITRES_TYPES_IDS_DEMAT } from './titres.js'
import { AdministrationId } from '../static/administrations.js'
import { isGestionnaire } from '../static/administrationsTitresTypes.js'
import { canAdministrationModifyEtapes } from '../static/administrationsTitresTypesTitresStatuts.js'
import { canAdministrationEtapeTypeId } from '../static/administrationsTitresTypesEtapesTypes.js'

import { TitreStatutId } from '../static/titresStatuts.js'
import { EntrepriseDocument, EntrepriseId } from '../entreprise.js'
import { Section, getSections } from '../static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { getEntrepriseDocuments } from '../static/titresTypes_demarchesTypes_etapesTypes/entrepriseDocuments.js'
import { SDOMZoneId } from '../static/sdom.js'
import { documentTypeIdsBySdomZonesGet } from '../static/titresTypes_demarchesTypes_etapesTypes/sdom.js'
import { DeepReadonly, NonEmptyArray, isNonEmptyArray, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from '../typescript-tools.js'
import { DocumentsTypes, DocumentType, DocumentTypeId, EntrepriseDocumentTypeId } from '../static/documentsTypes.js'
import { SubstanceLegaleId } from '../static/substancesLegales.js'
import { isDocumentsComplete } from './documents.js'
import { getDocuments } from '../static/titresTypes_demarchesTypes_etapesTypes/documents.js'
import { Contenu, contenuCompleteValidate, sectionsWithValueCompleteValidate } from './sections.js'
import { SectionWithValue } from '../sections.js'
import { FeatureMultiPolygon } from '../perimetre.js'

export const dureeOptionalCheck = (etapeTypeId: EtapeTypeId, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  if (titreTypeId !== 'axm' && titreTypeId !== 'arm') {
    return true
  }

  if (!isDemarcheTypeWithPhase(demarcheTypeId)) {
    return true
  }

  return etapeTypeId !== 'mfr'
}

export const canEditAmodiataires = (titreTypeId: TitreTypeId, user: User): boolean => {
  // il n’y a pas d’amodiataire sur les ARM et les AXM
  if (titreTypeId === 'arm' || titreTypeId === 'axm') {
    return false
  }

  // seuls les supers et les administrations peuvent éditer les amodiataires
  return isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)
}

const demarchesSansDatesNiDureePourLesEtapes = [DEMARCHES_TYPES_IDS.DeplacementDePerimetre, DEMARCHES_TYPES_IDS.Mutation, DEMARCHES_TYPES_IDS.ExtensionDePerimetre] as const
export const canEditDates = (titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId, etapeTypeId: EtapeTypeId, user: User): boolean => {
  // ne peut pas ajouter de dates à la démarche déplacement de périmètre
  if (demarchesSansDatesNiDureePourLesEtapes.includes(demarcheTypeId)) {
    return false
  }

  // peut éditer la date sur les titres autre que ARM et AXM
  if (titreTypeId !== 'arm' && titreTypeId !== 'axm') {
    return true
  }

  // ne peut pas modifier les dates sur une demande d’ARM ou d’AXM car c'est camino qui fait foi
  if (etapeTypeId === ETAPES_TYPES.demande) {
    return false
  }

  // seuls les supers et les administrations peuvent éditer la date de début sur les ARM et les AXM
  return isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)
}

export const canEditTitulaires = (titreTypeId: TitreTypeId, user: User): boolean => {
  // peut éditer les titulaires sur les titres autre que ARM et AXM
  if (titreTypeId !== 'arm' && titreTypeId !== 'axm') {
    return true
  }

  // seuls les supers et les administrations peuvent éditer les titulaires sur les ARM et les AXM
  return isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)
}

export const canEditDuree = (titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId): boolean => {
  // ne peut pas ajouter de durée à la démarche déplacement de périmètre
  if (demarchesSansDatesNiDureePourLesEtapes.includes(demarcheTypeId)) {
    return false
  }

  // la durée pour les demandes d’ARM est fixée à 4 mois par l’API
  return titreTypeId !== 'arm' || demarcheTypeId !== 'oct'
}

export const canCreateEtape = (
  user: User,
  etapeTypeId: EtapeTypeId,
  etapeStatutId: EtapeStatutId | null,
  titulaires: { id: EntrepriseId }[],
  titresAdministrationsLocales: AdministrationId[],
  demarcheTypeId: DemarcheTypeId,
  titre: { typeId: TitreTypeId; titreStatutId: TitreStatutId }
): boolean => {
  return canCreateOrEditEtape(user, etapeTypeId, etapeStatutId, titulaires, titresAdministrationsLocales, demarcheTypeId, titre, 'creation')
}

export const canEditEtape = (
  user: User,
  etapeTypeId: EtapeTypeId,
  etapeStatutId: EtapeStatutId | null,
  titulaires: { id: EntrepriseId }[],
  titresAdministrationsLocales: AdministrationId[],
  demarcheTypeId: DemarcheTypeId,
  titre: { typeId: TitreTypeId; titreStatutId: TitreStatutId }
): boolean => {
  return canCreateOrEditEtape(user, etapeTypeId, etapeStatutId, titulaires, titresAdministrationsLocales, demarcheTypeId, titre, 'modification')
}

const canCreateOrEditEtape = (
  user: User,
  etapeTypeId: EtapeTypeId,
  etapeStatutId: EtapeStatutId | null,
  titulaires: { id: EntrepriseId }[],
  titresAdministrationsLocales: AdministrationId[],
  demarcheTypeId: DemarcheTypeId,
  titre: { typeId: TitreTypeId; titreStatutId: TitreStatutId },
  permission: 'creation' | 'modification'
): boolean => {
  if (isSuper(user)) {
    return true
  } else if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    if (isGestionnaire(user.administrationId, titre.typeId) || titresAdministrationsLocales.includes(user.administrationId)) {
      return canAdministrationModifyEtapes(user.administrationId, titre.typeId, titre.titreStatutId) && canAdministrationEtapeTypeId(user.administrationId, titre.typeId, etapeTypeId, permission)
    }
  } else if (isEntreprise(user) || isBureauDEtudes(user)) {
    return (
      (user.entreprises?.length ?? 0) > 0 &&
      demarcheTypeId === DEMARCHES_TYPES_IDS.Octroi &&
      etapeTypeId === ETAPES_TYPES.demande &&
      etapeStatutId === ETAPES_STATUTS.EN_CONSTRUCTION &&
      TITRES_TYPES_IDS_DEMAT.includes(titre.typeId) &&
      titulaires.some(({ id }) => user.entreprises?.some(entreprise => id === entreprise.id))
    )
  }

  return false
}

type IsEtapeCompleteEtape = {
  typeId: EtapeTypeId
  /** 
   @deprecated use sectionsWithValue
  */
  contenu?: Contenu
  sectionsWithValue?: SectionWithValue[]
  decisionsAnnexesSections?: DeepReadonly<Section[]> | null
  decisionsAnnexesContenu?: Contenu
  geojson4326Perimetre?: null | FeatureMultiPolygon
  substances?: null | SubstanceLegaleId[]
  duree?: number | null
}
export const isEtapeComplete = (
  titreEtape: IsEtapeCompleteEtape,
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  documents: { typeId: DocumentTypeId; fichier?: unknown; fichierNouveau?: unknown }[] | null | undefined,
  entrepriseDocuments: Pick<EntrepriseDocument, 'entreprise_document_type_id'>[],
  sdomZones: SDOMZoneId[] | null | undefined
): { valid: true } | { valid: false; errors: NonEmptyArray<string> } => {
  const documentsTypes = getDocuments(titreTypeId, demarcheTypeId, titreEtape.typeId)

  const errors: string[] = []
  const sections = getSections(titreTypeId, demarcheTypeId, titreEtape.typeId)
  // les éléments non optionnel des sections sont renseignés
  const hasAtLeasOneSectionMandatory: boolean = sections.some(section => {
    return section.elements.some(element => (element.optionnel ?? true) === false)
  })
  if (hasAtLeasOneSectionMandatory) {
    if (isNotNullNorUndefined(titreEtape.contenu)) {
      errors.push(...contenuCompleteValidate(sections, titreEtape.contenu))
    } else if (isNotNullNorUndefinedNorEmpty(titreEtape.sectionsWithValue)) {
      errors.push(...sectionsWithValueCompleteValidate(titreEtape.sectionsWithValue))
    } else {
      errors.push('les contenus ne sont pas présents dans l’étape alors que les sections ont des éléments obligatoires')
    }
  }

  // les décisions annexes sont complètes
  if (titreEtape.decisionsAnnexesSections) {
    errors.push(...contenuCompleteValidate(titreEtape.decisionsAnnexesSections, titreEtape.decisionsAnnexesContenu))
  }

  const dts: DocumentType[] = [...documentsTypes]
  if (isNotNullNorUndefined(sdomZones)) {
    // Ajoute les documents obligatoires en fonction des zones du SDOM
    const documentTypeIds = documentTypeIdsBySdomZonesGet(sdomZones, titreTypeId, demarcheTypeId, titreEtape.typeId)

    documentTypeIds?.forEach(dtId => dts.push({ id: dtId, nom: DocumentsTypes[dtId].nom, optionnel: false }))
  }

  // les fichiers obligatoires sont tous renseignés et complets
  if (isNonEmptyArray(dts)) {
    // ajoute des documents obligatoires pour les arm mécanisées
    if (
      (titreTypeId === 'arm' && titreEtape.contenu && titreEtape.contenu.arm && titreEtape.contenu?.arm?.mecanise === true) ||
      (titreEtape.sectionsWithValue &&
        titreEtape.sectionsWithValue.some(section => section.id === 'arm' && section.elements.some(element => element.id === 'mecanise' && element.type === 'radio' && (element.value ?? false))))
    ) {
      dts
        .filter(dt => ['doe', 'dep'].includes(dt.id))
        .forEach(dt => {
          dt.optionnel = false
        })
    }
    const documentsErrors = isDocumentsComplete(documents ?? [], dts)
    if (!documentsErrors.valid) {
      errors.push(...documentsErrors.errors)
    }
  }

  // les documents d'entreprise obligatoires sont tous présents
  const entrepriseDocumentsTypes = getEntrepriseDocuments(titreTypeId, demarcheTypeId, titreEtape.typeId)

  const entrepriseDocumentsTypesIds: EntrepriseDocumentTypeId[] = []
  if (entrepriseDocuments.length) {
    for (const entrepriseDocumentType of entrepriseDocuments) {
      if (!entrepriseDocumentsTypes.map(({ id }) => id).includes(entrepriseDocumentType.entreprise_document_type_id)) {
        errors.push(`impossible de lier un document d'entreprise de type ${entrepriseDocumentType.entreprise_document_type_id}`)
      }
      entrepriseDocumentsTypesIds.push(entrepriseDocumentType.entreprise_document_type_id)
    }
  }
  entrepriseDocumentsTypes
    .filter(({ optionnel }) => !optionnel)
    .forEach(jt => {
      if (!entrepriseDocumentsTypesIds.includes(jt.id)) {
        errors.push(`le document d'entreprise « ${jt.nom} » obligatoire est manquant`)
      }
    })

  // Si c’est une demande d’AEX ou d’ARM, certaines informations sont obligatoires
  if (titreEtape.typeId === 'mfr' && ['arm', 'axm'].includes(titreTypeId)) {
    // le périmètre doit être défini
    if (isNullOrUndefined(titreEtape.geojson4326Perimetre)) {
      errors.push('le périmètre doit être renseigné')
    }

    // il doit exister au moins une substance
    if (!titreEtape.substances || !titreEtape.substances.length || !titreEtape.substances.some(substanceId => !!substanceId)) {
      errors.push('au moins une substance doit être renseignée')
    }
  }

  if ((isNullOrUndefined(titreEtape.duree) || titreEtape.duree === 0) && !dureeOptionalCheck(titreEtape.typeId, demarcheTypeId, titreTypeId)) {
    errors.push('la durée doit être renseignée')
  }

  if (isNonEmptyArray(errors)) {
    return { valid: false, errors }
  }

  return { valid: true }
}

export const isEtapeDeposable = (
  user: User,
  titre: {
    typeId: TitreTypeId
    titreStatutId: TitreStatutId
    titulaires: { id: EntrepriseId }[]
    administrationsLocales: AdministrationId[]
  },
  demarcheTypeId: DemarcheTypeId,
  titreEtape: IsEtapeCompleteEtape & { statutId: EtapeStatutId },
  documents:
    | {
        typeId: DocumentTypeId
        fichier?: unknown
        fichierNouveau?: unknown
      }[]
    | null
    | undefined,
  entrepriseDocuments: Pick<EntrepriseDocument, 'entreprise_document_type_id'>[],
  sdomZones: SDOMZoneId[] | null | undefined
): boolean => {
  if (titreEtape.typeId === ETAPES_TYPES.demande && titreEtape.statutId === ETAPES_STATUTS.EN_CONSTRUCTION) {
    if (
      canCreateOrEditEtape(
        user,
        titreEtape.typeId,
        titreEtape.statutId,
        titre.titulaires,
        titre.administrationsLocales,
        demarcheTypeId,
        { typeId: titre.typeId, titreStatutId: titre.titreStatutId },
        'modification'
      )
    ) {
      const complete = isEtapeComplete(titreEtape, titre.typeId, demarcheTypeId, documents, entrepriseDocuments, sdomZones)
      if (!complete.valid) {
        console.warn(complete.errors)

        return false
      }

      return true
    }
  }

  return false
}
