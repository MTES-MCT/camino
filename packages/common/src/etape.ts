import { EtapeTypeId } from './static/etapesTypes'
import { SubstanceLegaleId } from './static/substancesLegales'

export interface HeritageProp {
  actif: boolean
  etape: Etape
}

export interface Etape {
  contenu: { [key: string]: unknown }
  date: string
  type: { id: EtapeTypeId; nom: string }
  incertitudes: { [key in keyof Omit<Etape, 'incertitudes' | 'type' | 'heritageProps' | 'contenu'>]: boolean }
  substances: SubstanceLegaleId[]
  duree: number
  dateDebut: string
  dateFin: string
  titulaires: EtapeEntreprise[]
  amodiataires: EtapeEntreprise[]
  heritageProps: {
    substances: HeritageProp
    duree: HeritageProp
    dateDebut: HeritageProp
    dateFin: HeritageProp
    titulaires: HeritageProp
    amodiataires: HeritageProp
  }
}

export interface EtapeEntreprise {
  id: string
  nom: string
  etablissements: unknown[]
  operateur: boolean
}
