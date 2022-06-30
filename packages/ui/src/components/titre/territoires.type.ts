import { DepartementId } from 'camino-common/src/departement'

export interface TerritoiresProps {
  surface?: number
  forets?: { nom: string }[]
  sdomZones?: { nom: string }[]
  communes?: { nom: string; departementId: DepartementId }[]
}
