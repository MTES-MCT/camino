import { isTitreType, TitresTypes, TitreTypeId } from '../titresTypes'

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

// FIXME faire DemarcheTypeId
export const canLinkTitresFrom = (typeId: TitreTypeId | string): boolean => {
  if (isTitreType(typeId)) {
    return getTitreFromTypeId(typeId) !== null
  } else {
    return typeId === 'fus'
  }
}
