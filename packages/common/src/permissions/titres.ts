import { isTitreType, TitresTypes, TitreTypeId } from '../titresTypes'
import { DemarcheTypeId, isDemarcheTypeId } from '../demarchesTypes'

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

export const canLinkTitresFrom = (
  typeIdOrDemarcheTypeId: TitreTypeId | DemarcheTypeId
): boolean => {
  if (isTitreType(typeIdOrDemarcheTypeId)) {
    return getTitreFromTypeId(typeIdOrDemarcheTypeId) !== null
  } else if (isDemarcheTypeId(typeIdOrDemarcheTypeId)) {
    return typeIdOrDemarcheTypeId === 'fus'
  }

  return false
}
