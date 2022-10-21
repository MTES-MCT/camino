import { DepartementId } from 'camino-common/src/static/departement'
import { SecteursMaritimes } from 'camino-common/src/static/facades'

export interface TerritoiresProps {
  surface?: number
  forets?: { nom: string }[]
  sdomZones?: { nom: string }[]
  communes?: { nom: string; departementId: DepartementId }[]
  secteursMaritimes?: SecteursMaritimes[]
}
