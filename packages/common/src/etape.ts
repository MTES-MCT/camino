import { TitreSubstance } from './substance'

export interface HeritageProp {
  actif: boolean
  etape: Etape
}

export interface Etape {
  contenu: { [key: string]: unknown }
  date: string
  type: { nom: string }
  incertitudes: { [key: string]: boolean }
  substances: TitreSubstance[]
  duree: number
  dateDebut: string
  dateFin: string
  titulaires: Entreprise[]
  amodiataires: Entreprise[]
}

interface Entreprise {
  id: string
  nom: string
  etablissements: []
  operateur: boolean
}
