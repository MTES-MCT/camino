import { SubstanceLegaleId } from 'camino-common/src/static/substancesLegales'

export type Substance = {
  substanceId: SubstanceLegaleId | undefined
  ordre: number
}

export interface HeritageProp {
  actif: boolean
  etape: {
    contenu: { [key: string]: unknown }
    date: string
    type: { nom: string }
    incertitudes: { [key: string]: boolean }
    substances: Substance[]
  }
}
