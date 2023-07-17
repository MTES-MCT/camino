import { z } from 'zod'
import { titreIdValidator } from './titres'

const journauxQueryParamsValidator = z.object({
  page: z.number(),
  intervalle: z.number().gte(10).lte(10),
  recherche: z.string().nullable(),
  titreId: titreIdValidator.nullable(),
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
