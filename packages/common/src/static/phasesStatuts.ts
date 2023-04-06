import { CaminoDate } from '../date.js'
import { Couleur } from './couleurs.js'

export const PHASES_STATUTS_IDS = {
  Echu: 'ech',
  Valide: 'val',
} as const

export type PhaseStatutId = (typeof PHASES_STATUTS_IDS)[keyof typeof PHASES_STATUTS_IDS]

interface Definition<T> {
  id: T
  nom: string
  couleur: Couleur
}

export const phaseStatuts: { [key in PhaseStatutId]: Definition<key> } = {
  ech: { id: 'ech', nom: 'échu', couleur: 'neutral' },
  val: { id: 'val', nom: 'valide', couleur: 'success' },
} as const

export const phasesStatuts = Object.values(phaseStatuts)

export const isDemarchePhaseValide = (date: CaminoDate, demarche?: {demarcheDateDebut?:CaminoDate | null, demarcheDateFin?: CaminoDate | null} | null): boolean => getPhaseStatutId(date, demarche) === PHASES_STATUTS_IDS.Valide

export const getPhaseStatutId = (date: CaminoDate, demarche?: {demarcheDateDebut?:CaminoDate | null, demarcheDateFin?: CaminoDate | null} | null): PhaseStatutId | null => {
  if(!demarche?.demarcheDateDebut){
    return null
  }

  if( demarche.demarcheDateFin && date > demarche.demarcheDateFin ){
    return PHASES_STATUTS_IDS.Echu
  }else{
    return PHASES_STATUTS_IDS.Valide
  }
}