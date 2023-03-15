import { Couleur } from './couleurs'

export const ACTIVITES_STATUTS_IDS = {
  ABSENT: 'abs',
  EN_CONSTRUCTION: 'enc',
  DEPOSE: 'dep',
  CLOTURE: 'fer',
} as const

export type ActivitesStatutId = (typeof ACTIVITES_STATUTS_IDS)[keyof typeof ACTIVITES_STATUTS_IDS]
export type ActivitesStatut<T = ActivitesStatutId> = {
  id: T
  nom: string
  couleur: Couleur
}
export const ActivitesStatuts: { [key in ActivitesStatutId]: ActivitesStatut<key> } = {
  abs: { id: 'abs', nom: 'absent', couleur: 'error' },
  dep: { id: 'dep', nom: 'déposé', couleur: 'success' },
  enc: { id: 'enc', nom: 'en construction', couleur: 'warning' },
  fer: { id: 'fer', nom: 'cloturé', couleur: 'neutral' },
}

export const activitesStatutsIds = Object.values(ACTIVITES_STATUTS_IDS)
export const activitesStatuts = Object.values(ActivitesStatuts)
