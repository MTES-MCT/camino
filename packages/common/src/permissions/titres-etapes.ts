import { ETAPES_TYPES, EtapeTypeId } from '../static/etapesTypes'
import { TitreTypeId } from '../static/titresTypes'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId, isDemarcheTypeWithPhase } from '../static/demarchesTypes'
import { isAdministrationAdmin, isAdministrationEditeur, isBureauDEtudes, isEntreprise, isSuper, User } from '../roles'
import { TITRES_TYPES_IDS_DEMAT } from './titres'
import { AdministrationId } from '../static/administrations'
import { isGestionnaire } from '../static/administrationsTitresTypes'
import { canAdministrationModifyEtapes } from '../static/administrationsTitresTypesTitresStatuts'
import { canAdministrationEtapeTypeId } from '../static/administrationsTitresTypesEtapesTypes'

import { TitreStatutId } from '../static/titresStatuts'
import { EntrepriseDocument, EntrepriseId } from '../entreprise'
import { SDOMZoneId } from '../static/sdom'
import { DeepReadonly, NonEmptyArray, isNonEmptyArray } from '../typescript-tools'
import {
  ETAPE_IS_BROUILLON,
  EtapeAvis,
  EtapeBrouillon,
  EtapeDocument,
  GetEtapeDocumentsByEtapeId,
  GetEtapeDocumentsByEtapeIdAslDocument,
  GetEtapeDocumentsByEtapeIdDaeDocument,
  TempEtapeAvis,
  TempEtapeDocument,
} from '../etape'
import {
  dateTypeStepIsComplete,
  entrepriseDocumentsStepIsComplete,
  etapeAvisStepIsComplete,
  etapeDocumentsStepIsComplete,
  fondamentaleStepIsComplete,
  perimetreStepIsComplete,
  sectionsStepIsComplete,
} from './etape-form'
import { CommuneId } from '../static/communes'
import { FlattenEtape } from '../etape-form'

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
  isBrouillon: EtapeBrouillon,
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
  isBrouillon: EtapeBrouillon,
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
  isBrouillon: EtapeBrouillon,
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
  isBrouillon: EtapeBrouillon,
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
      isBrouillon === ETAPE_IS_BROUILLON &&
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
  if (titreEtape.isBrouillon === ETAPE_IS_BROUILLON) {
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
