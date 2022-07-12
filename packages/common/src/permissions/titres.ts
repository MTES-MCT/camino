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
  typeIdOrDemarcheTypeId: TitreTypeId | DemarcheTypeId | null
): boolean => {
  if (isTitreType(typeIdOrDemarcheTypeId)) {
    return ['axm', 'pxm'].includes(typeIdOrDemarcheTypeId)
  } else if (isDemarcheTypeId(typeIdOrDemarcheTypeId)) {
    return typeIdOrDemarcheTypeId === 'fus'
  }

  return false
}
