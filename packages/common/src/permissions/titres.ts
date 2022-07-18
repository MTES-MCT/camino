import { TitresTypes, TitreTypeId } from '../titresTypes'
import { DemarcheTypeId } from '../demarchesTypes'
import {
  isAdministrationAdmin,
  isAdministrationEditeur,
  isSuper,
  User
} from '../roles'
import { AdministrationId } from '../administrations'

export const getTitreFromTypeId = (typeId: TitreTypeId): TitreTypeId | null => {
  switch (typeId) {
    case 'axm':
      return 'arm'
    case 'pxm':
      return 'prm'
  }

  const titreType = TitresTypes[typeId]

  if (titreType.typeId === 'cx') {
    return typeId
  }

  return null
}

export const titreLinksExpectedGet = (titre: {
  typeId: TitreTypeId
  demarches?: { typeId: DemarcheTypeId }[]
}): 'none' | 'one' | 'multiple' => {
  if (['axm', 'pxm'].includes(titre.typeId)) {
    return 'one'
  }

  // FIXME CX
  // const titreType = TitresTypes[titre.typeId]
  // if (titreType.typeId === 'cx') {
  //   return 'multiple'
  // }

  if (titre.demarches?.some(({ typeId }) => demarcheCanHaveLinks(typeId))) {
    return 'multiple'
  }

  return 'none'
}

export const demarcheCanHaveLinks = (typeId: DemarcheTypeId) => typeId === 'fus'

export const canLinkTitres = (
  user: User,
  administrationIds: AdministrationId[]
): boolean => {
  if (isSuper(user)) {
    return true
  }

  if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    return administrationIds.includes(user.administrationId)
  }

  return false
}
