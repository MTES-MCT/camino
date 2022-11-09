import { CaminoDate } from './date'
import { EntrepriseId } from './entreprise'
import { EtapeTypeId } from './static/etapesTypes'
import { SubstanceLegaleId } from './static/substancesLegales'

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

type EtapeWithIncertitudesAndHeritage<T extends Pick<EtapeBase, 'type' | 'date'>> = T & {
  incertitudes: { [key in keyof Omit<T, 'incertitudes' | 'type' | 'heritageProps' | 'contenu'>]: boolean }
  heritageProps: { [key in keyof Omit<T, 'incertitudes' | 'type' | 'heritageProps' | 'contenu' | 'date'>]: HeritageProp<Pick<T, 'type' | 'date' | key>> }
}

export type Etape = EtapeWithIncertitudesAndHeritage<EtapeBase>
export type EtapeFondamentale = EtapeWithIncertitudesAndHeritage<Omit<EtapeBase, 'points' | 'surface'>>
