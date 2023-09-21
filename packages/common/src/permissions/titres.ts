import { isTitreType, TitresTypes, TitreTypeId } from '../static/titresTypes.js'
import { DemarcheTypeId } from '../static/demarchesTypes.js'
import { isAdministrationAdmin, isAdministrationEditeur, isBureauDEtudes, isEntreprise, isSuper, User, UserNotNull } from '../roles.js'
import { AdministrationId } from '../static/administrations.js'
import { isGestionnaire } from '../static/administrationsTitresTypes.js'

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

export function assertsCanCreateTitre(user: User, titreTypeId: TitreTypeId | undefined): asserts user is UserNotNull {
  if (!isTitreType(titreTypeId) || !canCreateTitre(user, titreTypeId)) {
    throw new Error('permissions insuffisantes')
  }
}

export const canCreateTitre = (user: User, titreTypeId: TitreTypeId | null): boolean => {
  if (isSuper(user)) {
    return true
  } else if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    return isGestionnaire(user.administrationId, titreTypeId)
  } else if (isEntreprise(user) || isBureauDEtudes(user)) {
    return TITRES_TYPES_IDS_DEMAT.includes(titreTypeId)
  }

  return false
}

export const canDeleteTitre = (user: User): boolean => isSuper(user)
