import { IEtapeType } from '../../types'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'

export const titreEtapeDemarcheEtapeTypeFind = (
  etapeTypeId: EtapeTypeId,
  etapesTypes: IEtapeType[],
  demarcheTypeNom: string
) => {
  const titreDemarcheEtapeType = etapesTypes.find(
    ({ id }) => id === etapeTypeId
  )

  if (!titreDemarcheEtapeType) {
    throw new Error(
      `étape "${etapeTypeId}" invalide pour une démarche "${demarcheTypeNom}"`
    )
  }

  return titreDemarcheEtapeType
}
