import { z } from 'zod'
import { CaminoDate } from './date.js'

export const eidValidator = z.string().brand<'EntrepriseId'>()
export type EntrepriseId = z.infer<typeof eidValidator>

export type EntrepriseEtablissement = { id: string; dateDebut: CaminoDate; dateFin: CaminoDate; nom: string }
export interface Entreprise {
  id: EntrepriseId
  nom: string
  etablissements: EntrepriseEtablissement[]
  legalSiren?: string
}

export const newEntrepriseId = (value: string): EntrepriseId => {
  return eidValidator.parse(value)
}
