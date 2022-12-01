import { CaminoDate } from './date.js'
import { EntrepriseId } from './entreprise.js'
import { EtapeTypeId } from './static/etapesTypes.js'
import { SubstanceLegaleId } from './static/substancesLegales.js'

export type HeritageProp<T> =
  | {
      actif: true
      etape: T
    }
  | { actif: false; etape?: T }

export interface EtapeEntreprise {
  id: EntrepriseId
  operateur: boolean
}

type EtapeBase = {
  contenu: { [key: string]: unknown }
  date: CaminoDate
  type: { id: EtapeTypeId; nom: string }
  substances: SubstanceLegaleId[]
  titulaires: EtapeEntreprise[]
  amodiataires: EtapeEntreprise[]
  points: unknown[]
  surface: number
  dateDebut: CaminoDate
} & ({ duree: number; dateFin: CaminoDate | undefined } | { duree: number | undefined; dateFin: CaminoDate })

export type EtapeWithIncertitudesAndHeritage<T extends Pick<EtapeBase, 'type' | 'date'>> = T & {
  incertitudes: { [key in keyof Omit<T, 'incertitudes' | 'type' | 'heritageProps' | 'contenu'>]: boolean }
  heritageProps: { [key in keyof Omit<T, 'incertitudes' | 'type' | 'heritageProps' | 'contenu' | 'date'>]: HeritageProp<Pick<T, 'type' | 'date' | key> & { incertitudes: { [k in key]: boolean } }> }
}

export type Etape = EtapeWithIncertitudesAndHeritage<EtapeBase>
export type EtapeFondamentale = EtapeWithIncertitudesAndHeritage<Omit<EtapeBase, 'points' | 'surface'>>
