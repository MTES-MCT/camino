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
import { EntrepriseId } from '../entreprise.js'
import { isTDEExist } from '../static/titresTypes_demarchesTypes_etapesTypes/index.js'

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

export const canEditDates = (titreTypeId: TitreTypeId, demarcheTypeId: DemarcheTypeId, etapeTypeId: EtapeTypeId, user: User): boolean => {
  // ne peut pas ajouter de dates à la démarche déplacement de périmètre
  if (demarcheTypeId === DEMARCHES_TYPES_IDS.DeplacementDePerimetre) {
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
  if (demarcheTypeId === DEMARCHES_TYPES_IDS.DeplacementDePerimetre) {
    return false
  }

  // la durée pour les ARM est fixée à 4 mois par l’API
  return titreTypeId !== 'arm'
}

export const canCreateOrEditEtape = (
  user: User,
  etapeTypeId: EtapeTypeId,
  etapeStatutId: EtapeStatutId | null,
  titulaires: { id: EntrepriseId }[],
  titresAdministrationsLocales: AdministrationId[],
  demarcheTypeId: DemarcheTypeId,
  titre: { typeId: TitreTypeId; titreStatutId: TitreStatutId },
  permission: 'creation' | 'modification'
): boolean => {
  if (!isTDEExist(titre.typeId, demarcheTypeId, etapeTypeId)) {
    return false
  }

  if (isSuper(user)) {
    return true
  } else if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    if (isGestionnaire(user.administrationId) || titresAdministrationsLocales.includes(user.administrationId)) {
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
