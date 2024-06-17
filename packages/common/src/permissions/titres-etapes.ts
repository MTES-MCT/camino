import { ETAPES_TYPES, EtapeTypeId } from '../static/etapesTypes.js'
import { TitreTypeId } from '../static/titresTypes.js'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId, isDemarcheTypeWithPhase } from '../static/demarchesTypes.js'
import { isAdministrationAdmin, isAdministrationEditeur, isBureauDEtudes, isEntreprise, isSuper, User } from '../roles.js'
import { TITRES_TYPES_IDS_DEMAT } from './titres.js'
import { AdministrationId } from '../static/administrations.js'
import { isGestionnaire } from '../static/administrationsTitresTypes.js'
import { canAdministrationModifyEtapes } from '../static/administrationsTitresTypesTitresStatuts.js'
import { canAdministrationEtapeTypeId } from '../static/administrationsTitresTypesEtapesTypes.js'

import { TitreStatutId } from '../static/titresStatuts.js'
import { EntrepriseDocument, EntrepriseId } from '../entreprise.js'
import { SDOMZoneId } from '../static/sdom.js'
import { DeepReadonly, NonEmptyArray, isNonEmptyArray } from '../typescript-tools.js'
import {
  ETAPE_IS_BROUILLON,
  EtapeAvis,
  EtapeDocument,
  GetEtapeDocumentsByEtapeId,
  GetEtapeDocumentsByEtapeIdAslDocument,
  GetEtapeDocumentsByEtapeIdDaeDocument,
  TempEtapeAvis,
  TempEtapeDocument,
} from '../etape.js'
import {
  dateTypeStepIsComplete,
  entrepriseDocumentsStepIsComplete,
  etapeAvisStepIsComplete,
  etapeDocumentsStepIsComplete,
  fondamentaleStepIsComplete,
  perimetreStepIsComplete,
  sectionsStepIsComplete,
} from './etape-form.js'
import { CommuneId } from '../static/communes.js'
import { FlattenEtape } from '../etape-form.js'

export const isDureeOptional = (etapeTypeId: EtapeTypeId, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
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
  isBrouillon: boolean,
  titulaireIds: EntrepriseId[],
  titresAdministrationsLocales: AdministrationId[],
  demarcheTypeId: DemarcheTypeId,
  titre: { typeId: TitreTypeId; titreStatutId: TitreStatutId }
): boolean => {
  return canCreateOrEditEtape(user, etapeTypeId, isBrouillon, titulaireIds, titresAdministrationsLocales, demarcheTypeId, titre, 'creation')
}

export const canDeleteEtape = (
  user: User,
  etapeTypeId: EtapeTypeId,
  isBrouillon: boolean,
  titulaireIds: EntrepriseId[],
  titresAdministrationsLocales: AdministrationId[],
  demarcheTypeId: DemarcheTypeId,
  titre: { typeId: TitreTypeId; titreStatutId: TitreStatutId }
): boolean => {
  return (
    (isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)) && canEditEtape(user, etapeTypeId, isBrouillon, titulaireIds, titresAdministrationsLocales, demarcheTypeId, titre)
  )
}

export const canEditEtape = (
  user: User,
  etapeTypeId: EtapeTypeId,
  isBrouillon: boolean,
  titulaireIds: EntrepriseId[],
  titresAdministrationsLocales: AdministrationId[],
  demarcheTypeId: DemarcheTypeId,
  titre: { typeId: TitreTypeId; titreStatutId: TitreStatutId }
): boolean => {
  return canCreateOrEditEtape(user, etapeTypeId, isBrouillon, titulaireIds, titresAdministrationsLocales, demarcheTypeId, titre, 'modification')
}

const canCreateOrEditEtape = (
  user: User,
  etapeTypeId: EtapeTypeId,
  isBrouillon: boolean,
  titulaireIds: EntrepriseId[],
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
      isBrouillon &&
      TITRES_TYPES_IDS_DEMAT.includes(titre.typeId) &&
      titulaireIds.some(id => user.entreprises?.some(entreprise => id === entreprise.id))
    )
  }

  return false
}

export type IsEtapeCompleteEtape = DeepReadonly<Pick<FlattenEtape, 'typeId' | 'date' | 'statutId' | 'duree' | 'contenu' | 'substances' | 'perimetre' | 'isBrouillon' | 'titulaires' | 'amodiataires'>>
export type IsEtapeCompleteDocuments = DeepReadonly<Pick<EtapeDocument | TempEtapeDocument, 'etape_document_type_id'>[]>
export type IsEtapeCompleteEntrepriseDocuments = DeepReadonly<Pick<EntrepriseDocument, 'entreprise_document_type_id' | 'entreprise_id'>[]>
type IsEtapeCompleteSdomZones = DeepReadonly<SDOMZoneId[]> | null | undefined
type IsEtapeCompleteCommunes = DeepReadonly<CommuneId[]>
type IsEtapeCompleteDaeDocument = DeepReadonly<Omit<GetEtapeDocumentsByEtapeIdDaeDocument, 'id'> | null>
type IsEtapeCompleteAslDocument = DeepReadonly<Omit<GetEtapeDocumentsByEtapeIdAslDocument, 'id'> | null>
type IsEtapeCompleteEtapeAvis = DeepReadonly<Pick<EtapeAvis, 'avis_type_id'>[]>

export const isEtapeComplete = (
  etape: IsEtapeCompleteEtape,
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  documents: IsEtapeCompleteDocuments,
  entrepriseDocuments: IsEtapeCompleteEntrepriseDocuments,
  sdomZones: IsEtapeCompleteSdomZones,
  communes: IsEtapeCompleteCommunes,
  daeDocument: IsEtapeCompleteDaeDocument,
  aslDocument: IsEtapeCompleteAslDocument,
  etapeAvis: IsEtapeCompleteEtapeAvis,
  user: User
): { valid: true } | { valid: false; errors: NonEmptyArray<string> } => {
  const isCompleteChecks = [
    dateTypeStepIsComplete(etape, user),
    fondamentaleStepIsComplete(etape, demarcheTypeId, titreTypeId),
    sectionsStepIsComplete(etape, demarcheTypeId, titreTypeId),
    perimetreStepIsComplete(etape),
    etapeDocumentsStepIsComplete(etape, demarcheTypeId, titreTypeId, documents, sdomZones ?? [], daeDocument, aslDocument, user),
    entrepriseDocumentsStepIsComplete(
      etape,
      demarcheTypeId,
      titreTypeId,
      entrepriseDocuments.map(ed => ({ documentTypeId: ed.entreprise_document_type_id, entrepriseId: ed.entreprise_id }))
    ),
    etapeAvisStepIsComplete(etape, etapeAvis, titreTypeId, communes),
  ]
  const errors: string[] = isCompleteChecks.reduce<string[]>((acc, c) => {
    if (!c.valid) {
      acc.push(...c.errors)
    }

    return acc
  }, [])

  // FIXME: vérifier que toute la logique ci-dessous est respectée par le nouveau code ci-dessus
  // const sections = getSections(titreTypeId, demarcheTypeId, titreEtape.typeId)
  // // les éléments non optionnel des sections sont renseignés
  // const hasAtLeasOneSectionMandatory: boolean = sections.some(section => {
  //   return section.elements.some(element => (element.optionnel ?? true) === false)
  // })
  // if (hasAtLeasOneSectionMandatory) {
  //   if (isNotNullNorUndefined(titreEtape.contenu)) {
  //     errors.push(...contenuCompleteValidate(sections, titreEtape.contenu))
  //   } else if (isNotNullNorUndefinedNorEmpty(titreEtape.sectionsWithValue)) {
  //     errors.push(...sectionsWithValueCompleteValidate(titreEtape.sectionsWithValue))
  //   } else {
  //     errors.push('les contenus ne sont pas présents dans l’étape alors que les sections ont des éléments obligatoires')
  //   }
  // }

  // if (needAslAndDae({ etapeTypeId: titreEtape.typeId, demarcheTypeId, titreTypeId }, titreEtape.statutId, user)) {
  //   if (isNullOrUndefined(daeDocument)) {
  //     errors.push('L’arrêté préfectoral de la mission autorité environnementale est obligatoire')
  //   }
  //   if (isNullOrUndefined(aslDocument)) {
  //     errors.push('La lettre de décision du propriétaire du sol est obligatoire')
  //   }
  // }

  // let contenu = titreEtape.contenu
  // if (isNullOrUndefined(contenu) && isNotNullNorUndefinedNorEmpty(titreEtape.sectionsWithValue)) {
  //   contenu = titreEtape.sectionsWithValue.reduce(
  //     (accSection, section) => ({ ...accSection, [section.id]: section.elements.reduce((accElement, element) => ({ ...accElement, [element.id]: element.value }), {}) }),
  //     {}
  //   )
  // }
  // const dts: DocumentType[] = getDocumentsTypes({ ...titreEtape }, demarcheTypeId, titreTypeId, sdomZones ?? [], contenu?.arm?.mecanise === true)

  // const documentsErrors = isDocumentsComplete(documents ?? [], dts)
  // if (!documentsErrors.valid) {
  //   errors.push(...documentsErrors.errors)
  // }

  // // les documents d'entreprise obligatoires sont tous présents
  // const entrepriseDocumentsTypes = getEntrepriseDocuments(titreTypeId, demarcheTypeId, titreEtape.typeId)

  // const entrepriseDocumentsTypesIds: EntrepriseDocumentTypeId[] = []
  // if (entrepriseDocuments.length) {
  //   for (const entrepriseDocumentType of entrepriseDocuments) {
  //     if (!entrepriseDocumentsTypes.map(({ id }) => id).includes(entrepriseDocumentType.entreprise_document_type_id)) {
  //       errors.push(`impossible de lier un document d'entreprise de type ${entrepriseDocumentType.entreprise_document_type_id}`)
  //     }
  //     entrepriseDocumentsTypesIds.push(entrepriseDocumentType.entreprise_document_type_id)
  //   }
  // }
  // entrepriseDocumentsTypes
  //   .filter(({ optionnel }) => !optionnel)
  //   .forEach(jt => {
  //     if (!entrepriseDocumentsTypesIds.includes(jt.id)) {
  //       errors.push(`le document d'entreprise « ${jt.nom} » obligatoire est manquant`)
  //     }
  //   })

  // // Si c’est une demande d’AEX ou d’ARM, certaines informations sont obligatoires
  // if (titreEtape.typeId === 'mfr' && ['arm', 'axm'].includes(titreTypeId)) {
  //   // le périmètre doit être défini
  //   if (isNullOrUndefined(titreEtape.geojson4326Perimetre)) {
  //     errors.push('le périmètre doit être renseigné')
  //   }

  //   // il doit exister au moins une substance
  //   if (!titreEtape.substances || !titreEtape.substances.length || !titreEtape.substances.some(substanceId => !!substanceId)) {
  //     errors.push('au moins une substance doit être renseignée')
  //   }
  // }

  // if ((isNullOrUndefined(titreEtape.duree) || titreEtape.duree === 0) && !isDureeOptional(titreEtape.typeId, demarcheTypeId, titreTypeId)) {
  //   errors.push('la durée doit être renseignée')
  // }

  if (isNonEmptyArray(errors)) {
    return { valid: false, errors }
  }

  return { valid: true }
}

type IsEtapeDeposableEtapeAvis = DeepReadonly<Pick<EtapeAvis | TempEtapeAvis, 'avis_type_id'>[]>
export const isEtapeDeposable = (
  user: User,
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  titreEtape: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'date' | 'statutId' | 'duree' | 'contenu' | 'substances' | 'perimetre' | 'isBrouillon' | 'titulaires' | 'amodiataires'>>,
  etapeDocuments: IsEtapeCompleteDocuments,
  entrepriseDocuments: IsEtapeCompleteEntrepriseDocuments,
  sdomZones: IsEtapeCompleteSdomZones,
  communes: IsEtapeCompleteCommunes,
  daeDocument: IsEtapeCompleteDaeDocument,
  aslDocument: IsEtapeCompleteAslDocument,
  etapeAvis: IsEtapeDeposableEtapeAvis
): boolean => {
  if (titreEtape.typeId === ETAPES_TYPES.demande && titreEtape.isBrouillon === ETAPE_IS_BROUILLON) {
    const complete = isEtapeComplete(titreEtape, titreTypeId, demarcheTypeId, etapeDocuments, entrepriseDocuments, sdomZones, communes, daeDocument, aslDocument, etapeAvis, user)
    if (!complete.valid) {
      console.warn(complete.errors)

      return false
    }

    return true
  }

  return false
}

export const canDeposeEtape = (
  user: User,
  titre: {
    typeId: TitreTypeId
    titreStatutId: TitreStatutId
    titulaires: EntrepriseId[]
    administrationsLocales: AdministrationId[]
  },
  demarcheTypeId: DemarcheTypeId,
  titreEtape: DeepReadonly<Pick<FlattenEtape, 'typeId' | 'date' | 'statutId' | 'duree' | 'contenu' | 'substances' | 'perimetre' | 'isBrouillon' | 'titulaires' | 'amodiataires'>>,
  etapeDocuments: Pick<EtapeDocument, 'etape_document_type_id'>[],
  entrepriseDocuments: Pick<EntrepriseDocument, 'entreprise_document_type_id' | 'entreprise_id'>[],
  sdomZones: SDOMZoneId[] | null | undefined,
  communes: CommuneId[],
  daeDocument: GetEtapeDocumentsByEtapeId['dae'],
  aslDocument: GetEtapeDocumentsByEtapeId['asl'],
  etapeAvis: IsEtapeDeposableEtapeAvis
): boolean => {
  return (
    isEtapeDeposable(user, titre.typeId, demarcheTypeId, titreEtape, etapeDocuments, entrepriseDocuments, sdomZones, communes, daeDocument, aslDocument, etapeAvis) &&
    canCreateOrEditEtape(
      user,
      titreEtape.typeId,
      titreEtape.isBrouillon,
      titre.titulaires,
      titre.administrationsLocales,
      demarcheTypeId,
      { typeId: titre.typeId, titreStatutId: titre.titreStatutId },
      'modification'
    )
  )
}

export const canDeleteEtapeDocument = (isBrouillon: boolean): boolean => isBrouillon
