import { z } from 'zod'
import { CaminoDate } from './date.js'

export const eidValidator = z.string().brand<'EntrepriseId'>()
export type EntrepriseId = z.infer<typeof eidValidator>

export const entrepriseModificationValidator = z.object({
  id: eidValidator,
  url: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().optional(),
  archive: z.boolean().optional(),
})

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
