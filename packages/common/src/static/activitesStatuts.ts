import { z } from 'zod'
import { Couleur } from './couleurs'

const IDS = ['abs', 'enc', 'dep', 'fer'] as const

export const activiteStatutIdValidator = z.enum(IDS)
export type ActivitesStatutId = z.infer<typeof activiteStatutIdValidator>
export const ACTIVITES_STATUTS_IDS = {
  ABSENT: 'abs',
  EN_CONSTRUCTION: 'enc',
  DEPOSE: 'dep',
  CLOTURE: 'fer',
} as const satisfies Record<string, ActivitesStatutId>

export type ActivitesStatut<T = ActivitesStatutId> = {
  id: T
  nom: string
  couleur: Couleur
}
export const ActivitesStatuts: { [key in ActivitesStatutId]: ActivitesStatut<key> } = {
  abs: { id: 'abs', nom: 'absent', couleur: 'error' },
  fer: { id: 'fer', nom: 'cloturé', couleur: 'neutral' },
  dep: { id: 'dep', nom: 'déposé', couleur: 'success' },
  enc: { id: 'enc', nom: 'en construction', couleur: 'warning' },
}

export const activitesStatutsIds = Object.values(ACTIVITES_STATUTS_IDS)
export const activitesStatuts = Object.values(ActivitesStatuts)
