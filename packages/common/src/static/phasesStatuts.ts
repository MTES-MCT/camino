import { Couleur } from './couleurs.js'

export const PHASES_STATUTS_IDS = {
  Echu: 'ech',
  Valide: 'val'
} as const

export type PhaseStatutId = (typeof PHASES_STATUTS_IDS)[keyof typeof PHASES_STATUTS_IDS]

interface Definition<T> {
  id: T
  nom: string
  couleur: Couleur
}

export const phaseStatuts: { [key in PhaseStatutId]: Definition<key> } = {
  ech: {
    id: 'ech',
    nom: 'échu',
    couleur: 'neutral'
  },
  val: {
    id: 'val',
    nom: 'valide',
    couleur: 'success'
  }
} as const

export const phasesStatuts = Object.values(phaseStatuts)
