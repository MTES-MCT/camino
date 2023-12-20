import { z } from 'zod'
import { titreIdValidator } from './titres'

const journauxQueryParamsValidator = z.object({
  page: z.number(),
  recherche: z.string().nullable(),
  titreId: titreIdValidator.nullable(),
  titresIds: z.array(titreIdValidator).optional(),
})

export type JournauxQueryParams = z.infer<typeof journauxQueryParamsValidator>

export interface Journal {
  id: string
  date: string
  differences: any
  elementId: string
  operation: 'update' | 'create' | 'delete'
  utilisateur: {
    nom: string
    prenom: string
  }
  titre: {
    nom: string
  }
}
export interface Journaux {
  elements: Journal[]
  page: number
  total: number
}
