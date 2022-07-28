import { TitresTypes, TitreTypeId } from '../static/titresTypes'
import { DemarcheTypeId } from '../static/demarchesTypes'
import { isAdministrationAdmin, isAdministrationEditeur, isSuper, User } from '../roles'
import { AdministrationId } from '../static/administrations'

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
