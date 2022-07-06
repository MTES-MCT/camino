import { TitreTypeId } from '../titresTypes'

export const getTitreFromTypeId = (typeId: TitreTypeId): TitreTypeId | null => {
  switch (typeId) {
    case 'axm':
      return 'arm'
    case 'pxm':
      return 'prm'
  }

  return null
}

export const canLinkTitresFrom = (titreTypeId: TitreTypeId): boolean => {
  return getTitreFromTypeId(titreTypeId) !== null
  // || titreOld.demarches.some(({ typeId }) => typeId === 'fus')
}
