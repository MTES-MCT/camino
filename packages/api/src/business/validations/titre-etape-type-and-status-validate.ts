import { IEtapeType } from '../../types'

// valide le type et le statut de l'étape en fonction des type d'étapes d'une démarche
import { titreEtapeDemarcheEtapeTypeFind } from '../utils/titre-etape-demarche-etape-type-find'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'

export const titreEtapeTypeAndStatusValidate = (
  etapeTypeId: EtapeTypeId,
  etapeStatutId: EtapeStatutId | undefined,
  etapesTypes: IEtapeType[],
  demarcheTypeNom: string
) => {
  try {
    if (!etapeStatutId) {
      return [`le statut est obligatoire`]
    }

    const etapeType = titreEtapeDemarcheEtapeTypeFind(
      etapeTypeId,
      etapesTypes,
      demarcheTypeNom
    )

    const etapesStatuts = getEtapesStatuts(etapeType.id)

    const titreEtapeStatut = etapesStatuts.find(
      etapeStatut => etapeStatut.id === etapeStatutId
    )

    if (!titreEtapeStatut) {
      return [
        `statut de l'étape "${etapeStatutId}" invalide pour une type d'étape ${etapeTypeId} pour une démarche de type ${demarcheTypeNom}`
      ]
    }

    return []
  } catch (e: any) {
    return [e.message]
  }
}
