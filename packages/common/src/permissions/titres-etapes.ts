import { AdministrationId } from '../static/administrations'
import { isGestionnaire } from '../static/administrationsTitresTypes'
import { canAdministrationModifyEtapes } from '../static/administrationsTitresTypesTitresStatuts'
import { canAdministrationEtapeTypeId } from '../static/administrationsTitresTypesEtapesTypes'

import { TitreStatutId } from '../static/titresStatuts'
import { EntrepriseDocument, EntrepriseId } from '../entreprise'
import { SDOMZoneId } from '../static/sdom'
import { DeepReadonly, NonEmptyArray, isNonEmptyArray } from '../typescript-tools'
import { ETAPE_IS_BROUILLON, EtapeAvis, EtapeBrouillon, EtapeDocument, TempEtapeAvis, TempEtapeDocument } from '../etape'
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
import { TitreTypeId, TITRES_TYPES_IDS } from '../static/titresTypes'
import { User, isSuper, isAdministrationAdmin, isAdministrationEditeur, isEntreprise, isBureauDEtudes } from '../roles'
import { DemarcheTypeId, DEMARCHES_TYPES_IDS, DemarchesTypes } from '../static/demarchesTypes'
import { EtapeTypeId, ETAPES_TYPES, EtapesTypes, isEtapeDecision } from '../static/etapesTypes'
import { TITRES_TYPES_IDS_DEMAT } from './titres'

export type InputAbsent = { visibility: 'absent'; message: string }
type InputPresentRequired = { visibility: 'present'; required: true; message: string }
export type InputPresentOptional = { visibility: 'present'; required: false }
export type InputPresence = InputAbsent | InputPresentRequired | InputPresentOptional

export const canEditAmodiataires = (titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId, user: User): InputPresence => {
  if (titreTypeId === TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX || titreTypeId === TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX) {
    return { visibility: 'absent', message: `une autorisation ${titreTypeId === 'arm' ? 'de recherche' : "d'exploitation"} ne peut pas inclure d'amodiataires` }
  }

  if (
    [
      DEMARCHES_TYPES_IDS.Fusion,
      DEMARCHES_TYPES_IDS.Mutation,
      DEMARCHES_TYPES_IDS.MutationPartielle,
      DEMARCHES_TYPES_IDS.Renonciation,
      DEMARCHES_TYPES_IDS.Conversion,
      DEMARCHES_TYPES_IDS.DeplacementDePerimetre,
      DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation,
    ].includes(demarcheTypeId)
  ) {
    return { visibility: 'absent', message: `une démarche ${DemarchesTypes[demarcheTypeId].nom} ne peut pas inclure d'amodiataire` }
  }

  // seuls les supers et les administrations peuvent éditer les amodiataires
  if (isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    if (demarcheTypeId === DEMARCHES_TYPES_IDS.Amodiation) {
      return { visibility: 'present', required: true, message: "les amodiataires sont obligatoires pour les démarches d'Amodiation" }
    }

    return { visibility: 'present', required: false }
  }

  return { visibility: 'absent', message: 'droits insuffisants pour éditer les amodiataires' }
}

const demarchesSansDatesNiDureePourLesEtapes = [DEMARCHES_TYPES_IDS.DeplacementDePerimetre, DEMARCHES_TYPES_IDS.Mutation, DEMARCHES_TYPES_IDS.ExtensionDePerimetre] as const

// Attention les champs dates ne sont jamais obligatoires, si ils le deviennent il faudra faire des modifs dans la validation et dans l'ui
export const canEditDates = (_titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId, etapeTypeId: EtapeTypeId, user: User): InputAbsent | InputPresentOptional => {
  if (demarchesSansDatesNiDureePourLesEtapes.includes(demarcheTypeId)) {
    return { visibility: 'absent', message: `une démarche ${DemarchesTypes[demarcheTypeId].nom} ne peut pas inclure de date` }
  }

  if (!isEtapeDecision(etapeTypeId)) {
    return { visibility: 'absent', message: `une date peut-être spécifiée que sur une étape de décision` }
  }

  if (isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    return { visibility: 'present', required: false }
  }

  return { visibility: 'absent', message: 'droits insuffisants pour éditer les dates' }
}

export const canEditTitulaires = (_titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId, user: User): InputPresence => {
  if (
    [
      DEMARCHES_TYPES_IDS.Fusion,
      DEMARCHES_TYPES_IDS.Renonciation,
      DEMARCHES_TYPES_IDS.Amodiation,
      DEMARCHES_TYPES_IDS.Conversion,
      DEMARCHES_TYPES_IDS.DeplacementDePerimetre,
      DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation,
    ].includes(demarcheTypeId)
  ) {
    return { visibility: 'absent', message: `une démarche ${DemarchesTypes[demarcheTypeId].nom} ne peut pas inclure de titulaire` }
  }

  // seuls les supers et les administrations peuvent éditer les titulaires
  if (isSuper(user) || isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    return { visibility: 'present', required: true, message: `les titulaires sont obligatoires pour les démarches ${DemarchesTypes[demarcheTypeId].nom}` }
  }

  return { visibility: 'absent', message: 'droits insuffisants pour éditer les titulaires' }
}

export const canEditDuree = (_titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId, _user: User): InputPresence => {
  // par exemple, ne peut pas ajouter de durée à la démarche déplacement de périmètre
  if (demarchesSansDatesNiDureePourLesEtapes.includes(demarcheTypeId)) {
    return { visibility: 'absent', message: `une démarche ${DemarchesTypes[demarcheTypeId].nom} ne peut pas inclure de durée` }
  }

  return { visibility: 'present', required: true, message: `la durée est obligatoire pour une démarche ${DemarchesTypes[demarcheTypeId].nom}` }
}

export const canEditPerimetre = (demarcheTypeId: DemarcheTypeId, etapeTypeId: EtapeTypeId): InputPresence => {
  if (!EtapesTypes[etapeTypeId].fondamentale) {
    return { visibility: 'absent', message: `une étape ${EtapesTypes[etapeTypeId].nom} ne peut pas inclure de périmètre` }
  }

  if (
    [
      DEMARCHES_TYPES_IDS.Fusion,
      DEMARCHES_TYPES_IDS.Mutation,
      DEMARCHES_TYPES_IDS.Renonciation,
      DEMARCHES_TYPES_IDS.Amodiation,
      DEMARCHES_TYPES_IDS.Conversion,
      DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation,
    ].includes(demarcheTypeId)
  ) {
    return { visibility: 'absent', message: `une démarche ${DemarchesTypes[demarcheTypeId].nom} ne peut pas inclure de périmètre` }
  }

  return { visibility: 'present', required: true, message: `le périmètre est obligatoire pour une démarche ${DemarchesTypes[demarcheTypeId].nom}` }
}

export const canCreateEtape = (
  user: DeepReadonly<User>,
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
  user: DeepReadonly<User>,
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
      user.entrepriseIds.length > 0 &&
      demarcheTypeId === DEMARCHES_TYPES_IDS.Octroi &&
      etapeTypeId === ETAPES_TYPES.demande &&
      isBrouillon === ETAPE_IS_BROUILLON &&
      TITRES_TYPES_IDS_DEMAT.includes(titre.typeId) &&
      titulaireIds.some(id => user.entrepriseIds.includes(id))
    )
  }

  return false
}

export type IsEtapeCompleteEtape = DeepReadonly<Pick<FlattenEtape, 'typeId' | 'date' | 'statutId' | 'duree' | 'contenu' | 'substances' | 'perimetre' | 'isBrouillon' | 'titulaires' | 'amodiataires'>>
export type IsEtapeCompleteDocuments = DeepReadonly<Pick<EtapeDocument | TempEtapeDocument, 'etape_document_type_id'>[]>
export type IsEtapeCompleteEntrepriseDocuments = DeepReadonly<Pick<EntrepriseDocument, 'entreprise_document_type_id' | 'entreprise_id'>[]>
type IsEtapeCompleteSdomZones = DeepReadonly<SDOMZoneId[]> | null | undefined
type IsEtapeCompleteCommunes = DeepReadonly<CommuneId[]>
type IsEtapeCompleteEtapeAvis = DeepReadonly<Pick<EtapeAvis, 'avis_type_id'>[]>

export const isEtapeComplete = (
  etape: IsEtapeCompleteEtape,
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  documents: IsEtapeCompleteDocuments,
  entrepriseDocuments: IsEtapeCompleteEntrepriseDocuments,
  sdomZones: IsEtapeCompleteSdomZones,
  communes: IsEtapeCompleteCommunes,
  etapeAvis: IsEtapeCompleteEtapeAvis,
  user: User
): { valid: true } | { valid: false; errors: NonEmptyArray<string> } => {
  const isCompleteChecks = [
    dateTypeStepIsComplete(etape, user),
    fondamentaleStepIsComplete(etape, demarcheTypeId, titreTypeId, user),
    sectionsStepIsComplete(etape, demarcheTypeId, titreTypeId),
    perimetreStepIsComplete(etape, demarcheTypeId),
    etapeDocumentsStepIsComplete(etape, demarcheTypeId, titreTypeId, documents, sdomZones ?? []),
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
  etapeAvis: IsEtapeDeposableEtapeAvis
): boolean => {
  if (titreEtape.isBrouillon === ETAPE_IS_BROUILLON) {
    const complete = isEtapeComplete(titreEtape, titreTypeId, demarcheTypeId, etapeDocuments, entrepriseDocuments, sdomZones, communes, etapeAvis, user)
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
  etapeAvis: IsEtapeDeposableEtapeAvis
): boolean => {
  return (
    isEtapeDeposable(user, titre.typeId, demarcheTypeId, titreEtape, etapeDocuments, entrepriseDocuments, sdomZones, communes, etapeAvis) &&
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
