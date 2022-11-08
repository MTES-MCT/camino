import { TitresTypes, TitreTypeId } from '../static/titresTypes'
import { DemarcheTypeId } from '../static/demarchesTypes'
import { isAdministrationAdmin, isAdministrationEditeur, isBureauDEtudes, isEntreprise, isSuper, User } from '../roles'
import { AdministrationId } from '../static/administrations'
import { isGestionnaire } from '../static/administrationsTitresTypes'

export const getLinkConfig = (typeId: TitreTypeId, demarches: { typeId: DemarcheTypeId }[]): { count: 'single' | 'multiple'; typeId: TitreTypeId } | null => {
  switch (typeId) {
    case 'axm':
      return { count: 'single', typeId: 'arm' }
    case 'pxm':
      return { count: 'single', typeId: 'prm' }
  }

  const titreType = TitresTypes[typeId]

  if (titreType.typeId === 'cx' && demarches.some(({ typeId }) => typeId === 'fus')) {
    return { count: 'multiple', typeId }
  }

  return null
}

export const canLinkTitres = (user: User, administrationIds: AdministrationId[]): boolean => {
  if (isSuper(user)) {
    return true
  }

  if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    return administrationIds.includes(user.administrationId)
  }

  return false
}

export const TITRES_TYPES_IDS_DEMAT = ['arm', 'axm']

export const canCreateTitre = (user: User, titreTypeId: TitreTypeId | undefined): boolean => {
  if (isSuper(user)) {
    return true
  } else if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    return isGestionnaire(user.administrationId, titreTypeId)
  } else if (isEntreprise(user) || isBureauDEtudes(user)) {
    return TITRES_TYPES_IDS_DEMAT.includes(titreTypeId)
  }

  return false
}
