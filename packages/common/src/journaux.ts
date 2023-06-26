import { Range } from './number'

export interface JournauxQueryParams {
  page: number
  intervalle: Range
  recherche: string | null
  titreId: string | null
}

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
  intervalle: Range
  total: number
}
