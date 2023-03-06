import { CaminoDate } from './date.js'

export type EntrepriseId = string & { __camino: 'entrepriseId' }

export type EntrepriseEtablissement = { dateDebut: CaminoDate; dateFin: CaminoDate; nom: string }
export interface Entreprise {
  id: EntrepriseId
  nom: string
  legalSiren?:string
  etablissements: EntrepriseEtablissement[]
}

export const newEntrepriseId = (value: string): EntrepriseId => {
  return value as EntrepriseId
}
