import { ETAPES_TYPES, EtapeTypeId } from '../static/etapesTypes'
import { TitreTypeId } from '../static/titresTypes'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId, isDemarcheTypeWithPhase } from '../static/demarchesTypes'
import { isAdministrationAdmin, isAdministrationEditeur, isSuper, User } from '../roles'

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
