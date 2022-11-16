import { CaminoDate } from './date'

export type EntrepriseId = string & { __camino: 'entrepriseId' }

export interface Entreprise {
  id: EntrepriseId
  nom: string
  etablissements: { dateDebut: CaminoDate; dateFin: CaminoDate; nom: string }[]
}

export const newEntrepriseId = (value: string): EntrepriseId => {
  return value as EntrepriseId
}
